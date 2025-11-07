package services

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gofiber/websocket/v2"
)

// WSMessageType represents different types of real-time WebSocket notifications
type WSMessageType string

const (
	WSMsgNewSurvey          WSMessageType = "new_survey"
	WSMsgSurveyCompleted    WSMessageType = "survey_completed"
	WSMsgEarningsUpdate     WSMessageType = "earnings_update"
	WSMsgPaymentReceived    WSMessageType = "payment_received"
	WSMsgWithdrawalApproved WSMessageType = "withdrawal_approved"
	WSMsgSystemAlert        WSMessageType = "system_alert"
	WSMsgResponseReceived   WSMessageType = "response_received"
	WSMsgSurveyApproved     WSMessageType = "survey_approved"
)

// WSMessage represents a real-time WebSocket notification message
type WSMessage struct {
	Type      WSMessageType          `json:"type"`
	Title     string                 `json:"title"`
	Message   string                 `json:"message"`
	Data      map[string]interface{} `json:"data,omitempty"`
	Timestamp time.Time              `json:"timestamp"`
	Read      bool                   `json:"read"`
}

// Client represents a WebSocket client connection
type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan WSMessage
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	// Registered clients per user
	clients map[string]map[*Client]bool

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Broadcast messages to specific user
	broadcast chan struct {
		userID  string
		message WSMessage
	}

	// Mutex for thread-safe operations
	mu sync.RWMutex
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast: make(chan struct {
			userID  string
			message WSMessage
		}),
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.UserID] == nil {
				h.clients[client.UserID] = make(map[*Client]bool)
			}
			h.clients[client.UserID][client] = true
			h.mu.Unlock()
			log.Printf("✅ WebSocket client registered: user=%s, total_connections=%d",
				client.UserID, len(h.clients[client.UserID]))

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.clients[client.UserID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.clients, client.UserID)
					}
					log.Printf("❌ WebSocket client unregistered: user=%s", client.UserID)
				}
			}
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.mu.RLock()
			clients := h.clients[msg.userID]
			h.mu.RUnlock()

			for client := range clients {
				select {
				case client.Send <- msg.message:
					log.Printf("📨 Message sent to user %s: %s", msg.userID, msg.message.Type)
				default:
					// Client's send channel is full, close connection
					h.mu.Lock()
					close(client.Send)
					delete(h.clients[msg.userID], client)
					h.mu.Unlock()
					log.Printf("⚠️ Client send channel full, closing connection for user %s", msg.userID)
				}
			}
		}
	}
}

// RegisterClient registers a new client connection
func (h *Hub) RegisterClient(client *Client) {
	h.register <- client
}

// UnregisterClient unregisters a client connection
func (h *Hub) UnregisterClient(client *Client) {
	h.unregister <- client
}

// SendNotification sends a message to a specific user
func (h *Hub) SendNotification(userID string, message WSMessage) {
	message.Timestamp = time.Now()
	message.Read = false

	h.broadcast <- struct {
		userID  string
		message WSMessage
	}{
		userID:  userID,
		message: message,
	}
}

// BroadcastToAll broadcasts a message to all connected clients
func (h *Hub) BroadcastToAll(message WSMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	message.Timestamp = time.Now()
	message.Read = false

	for userID := range h.clients {
		h.broadcast <- struct {
			userID  string
			message WSMessage
		}{
			userID:  userID,
			message: message,
		}
	}
}

// GetActiveConnections returns the number of active connections for a user
func (h *Hub) GetActiveConnections(userID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.clients[userID]; ok {
		return len(clients)
	}
	return 0
}

// GetTotalConnections returns the total number of active connections
func (h *Hub) GetTotalConnections() int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	total := 0
	for _, clients := range h.clients {
		total += len(clients)
	}
	return total
}

// ReadPump reads messages from the WebSocket connection
func (c *Client) ReadPump(hub *Hub) {
	defer func() {
		hub.UnregisterClient(c)
		c.Conn.Close()
	}()

	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error for user %s: %v", c.UserID, err)
			}
			break
		}
	}
}

// WritePump sends messages to the WebSocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case notification, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				// Hub closed the channel
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// Send notification as JSON
			data, err := json.Marshal(notification)
			if err != nil {
				log.Printf("Error marshaling notification: %v", err)
				continue
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Printf("Error writing to WebSocket for user %s: %v", c.UserID, err)
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Helper functions for sending common notifications via Hub
// These are convenience wrappers around hub.SendNotification

// SendNewSurveyNotification notifies a filler about a new survey
func SendNewSurveyNotification(hub *Hub, userID string, surveyTitle string, reward int) {
	hub.SendNotification(userID, WSMessage{
		Type:    WSMsgNewSurvey,
		Title:   "New Survey Available!",
		Message: surveyTitle,
		Data: map[string]interface{}{
			"survey_title": surveyTitle,
			"reward":       reward,
		},
	})
}

// SendEarningsNotification notifies a filler when they earn from a survey
func SendEarningsNotification(hub *Hub, userID string, amount int, surveyTitle string) {
	hub.SendNotification(userID, WSMessage{
		Type:    WSMsgEarningsUpdate,
		Title:   "Earnings Updated!",
		Message: surveyTitle,
		Data: map[string]interface{}{
			"amount":       amount,
			"survey_title": surveyTitle,
		},
	})
}

// SendResponseNotification notifies a creator about a survey response
func SendResponseNotification(hub *Hub, userID string, surveyTitle string, responseCount int) {
	hub.SendNotification(userID, WSMessage{
		Type:    WSMsgResponseReceived,
		Title:   "New Survey Response",
		Message: surveyTitle,
		Data: map[string]interface{}{
			"survey_title":   surveyTitle,
			"response_count": responseCount,
		},
	})
}

// SendPaymentNotification notifies a creator about payment
func SendPaymentNotification(hub *Hub, userID string, amount int, credits int) {
	hub.SendNotification(userID, WSMessage{
		Type:    WSMsgPaymentReceived,
		Title:   "Payment Received",
		Message: "Your payment has been processed successfully",
		Data: map[string]interface{}{
			"amount":  amount,
			"credits": credits,
		},
	})
}

// SendWithdrawalNotification notifies a filler about withdrawal approval
func SendWithdrawalNotification(hub *Hub, userID string, amount int) {
	hub.SendNotification(userID, WSMessage{
		Type:    WSMsgWithdrawalApproved,
		Title:   "Withdrawal Approved",
		Message: "Your withdrawal request has been approved",
		Data: map[string]interface{}{
			"amount": amount,
		},
	})
}

// SendSurveyApprovalNotification notifies a creator about survey approval
func SendSurveyApprovalNotification(hub *Hub, userID string, surveyTitle string) {
	hub.SendNotification(userID, WSMessage{
		Type:    WSMsgSurveyApproved,
		Title:   "Survey Approved",
		Message: surveyTitle,
		Data: map[string]interface{}{
			"survey_title": surveyTitle,
		},
	})
}

// SendSystemAlert sends a system alert to a user
func SendSystemAlert(hub *Hub, userID string, title string, message string) {
	hub.SendNotification(userID, WSMessage{
		Type:    WSMsgSystemAlert,
		Title:   title,
		Message: message,
	})
}
