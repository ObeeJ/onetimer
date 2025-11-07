package controllers

import (
	"bytes"
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"onetimer-backend/cache"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jung-kurt/gofpdf"
	"github.com/unidoc/unioffice/document"
)

type ExportController struct {
	cache *cache.Cache
	db    *pgxpool.Pool
}

func NewExportController(cache *cache.Cache, db *pgxpool.Pool) *ExportController {
	return &ExportController{cache: cache, db: db}
}

// ExportSurveyResponses exports survey responses in various formats
func (h *ExportController) ExportSurveyResponses(c *fiber.Ctx) error {
	surveyID := c.Params("id")
	format := c.Query("format", "csv") // csv, json, xlsx

	// Validate survey ID
	if _, err := uuid.Parse(surveyID); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid survey ID"})
	}

	// Get survey responses
	responses, err := h.getSurveyResponsesForExport(surveyID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch responses"})
	}

	switch format {
	case "csv":
		return h.exportCSV(c, responses, surveyID)
	case "json":
		return h.exportJSON(c, responses, surveyID)
	case "pdf":
		return h.exportPDF(c, responses, surveyID)
	case "docx":
		return h.exportDOCX(c, responses, surveyID)
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Unsupported format"})
	}
}

func (h *ExportController) exportCSV(c *fiber.Ctx, responses []SurveyResponse, surveyID string) error {
	filename := fmt.Sprintf("survey_%s_responses_%s.csv", surveyID[:8], time.Now().Format("20060102"))

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	writer := csv.NewWriter(c)
	defer writer.Flush()

	if len(responses) == 0 {
		writer.Write([]string{"No responses found"})
		return nil
	}

	// Write header
	header := []string{"Response ID", "Filler Email", "Submitted At", "Quality Score"}

	// Add question headers
	if len(responses) > 0 {
		for questionID := range responses[0].Answers {
			header = append(header, fmt.Sprintf("Question_%s", questionID[:8]))
		}
	}
	writer.Write(header)

	// Write data rows
	for _, response := range responses {
		row := []string{
			response.ID,
			response.FillerEmail,
			response.CompletedAt.Format("2006-01-02 15:04:05"),
			strconv.Itoa(response.QualityScore),
		}

		// Add answers
		for questionID := range responses[0].Answers {
			if answer, exists := response.Answers[questionID]; exists {
				row = append(row, fmt.Sprintf("%v", answer))
			} else {
				row = append(row, "")
			}
		}
		writer.Write(row)
	}

	return nil
}

func (h *ExportController) exportJSON(c *fiber.Ctx, responses []SurveyResponse, surveyID string) error {
	filename := fmt.Sprintf("survey_%s_responses_%s.json", surveyID[:8], time.Now().Format("20060102"))

	c.Set("Content-Type", "application/json")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	exportData := fiber.Map{
		"survey_id":       surveyID,
		"exported_at":     time.Now(),
		"total_responses": len(responses),
		"responses":       responses,
	}

	return c.JSON(exportData)
}

type SurveyResponse struct {
	ID           string                 `json:"id"`
	FillerEmail  string                 `json:"filler_email"`
	Answers      map[string]interface{} `json:"answers"`
	CompletedAt  time.Time              `json:"completed_at"`
	QualityScore int                    `json:"quality_score"`
}

func (h *ExportController) getSurveyResponsesForExport(surveyID string) ([]SurveyResponse, error) {
	query := `
		SELECT r.id, u.email, r.answers, r.completed_at, r.quality_score
		FROM responses r
		JOIN users u ON r.filler_id = u.id
		WHERE r.survey_id = $1 AND r.status = 'completed'
		ORDER BY r.completed_at DESC
	`

	rows, err := h.db.Query(context.Background(), query, surveyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var responses []SurveyResponse
	for rows.Next() {
		var response SurveyResponse
		var answersJSON string

		err := rows.Scan(
			&response.ID,
			&response.FillerEmail,
			&answersJSON,
			&response.CompletedAt,
			&response.QualityScore,
		)
		if err != nil {
			continue
		}

		// Parse JSON answers
		if err := json.Unmarshal([]byte(answersJSON), &response.Answers); err != nil {
			response.Answers = make(map[string]interface{})
		}

		responses = append(responses, response)
	}

	return responses, nil
}

func (h *ExportController) exportPDF(c *fiber.Ctx, responses []SurveyResponse, surveyID string) error {
	filename := fmt.Sprintf("survey_%s_responses_%s.pdf", surveyID[:8], time.Now().Format("20060102"))

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, fmt.Sprintf("Survey Responses - %s", surveyID[:8]))
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 12)
	for i, response := range responses {
		pdf.Cell(40, 10, fmt.Sprintf("Response %d: %s", i+1, response.FillerEmail))
		pdf.Ln(8)
		for qID, answer := range response.Answers {
			pdf.Cell(40, 10, fmt.Sprintf("Q%s: %v", qID[:4], answer))
			pdf.Ln(6)
		}
		pdf.Ln(4)
	}

	var buf bytes.Buffer
	pdf.Output(&buf)

	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	return c.Send(buf.Bytes())
}

func (h *ExportController) exportDOCX(c *fiber.Ctx, responses []SurveyResponse, surveyID string) error {
	filename := fmt.Sprintf("survey_%s_responses_%s.docx", surveyID[:8], time.Now().Format("20060102"))

	doc := document.New()
	para := doc.AddParagraph()
	run := para.AddRun()
	run.AddText(fmt.Sprintf("Survey Responses - %s", surveyID[:8]))
	run.Properties().SetBold(true)
	run.Properties().SetSize(16)

	for i, response := range responses {
		para = doc.AddParagraph()
		run = para.AddRun()
		run.AddText(fmt.Sprintf("Response %d: %s", i+1, response.FillerEmail))
		run.Properties().SetBold(true)

		for qID, answer := range response.Answers {
			para = doc.AddParagraph()
			run = para.AddRun()
			run.AddText(fmt.Sprintf("Q%s: %v", qID[:4], answer))
		}
	}

	var buf bytes.Buffer
	doc.Save(&buf)

	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	return c.Send(buf.Bytes())
}
