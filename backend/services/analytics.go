package services

import (
	"context"
	"fmt"
	"onetimer-backend/cache"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type AnalyticsService struct {
	db    *pgxpool.Pool
	cache *cache.Cache
}

func NewAnalyticsService(db *pgxpool.Pool, cache *cache.Cache) *AnalyticsService {
	return &AnalyticsService{
		db:    db,
		cache: cache,
	}
}

// FillerAnalytics returns analytics for survey fillers
type FillerAnalytics struct {
	TotalSurveysCompleted int     `json:"total_surveys_completed"`
	TotalEarnings         int     `json:"total_earnings"`
	PendingEarnings       int     `json:"pending_earnings"`
	AvailableBalance      int     `json:"available_balance"`
	CompletionRate        float64 `json:"completion_rate"`
	AverageRating         float64 `json:"average_rating"`
	ThisMonthEarnings     int     `json:"this_month_earnings"`
	ThisWeekSurveys       int     `json:"this_week_surveys"`
	ReferralEarnings      int     `json:"referral_earnings"`
	TotalReferrals        int     `json:"total_referrals"`
}

func (s *AnalyticsService) GetFillerAnalytics(ctx context.Context, userID string) (*FillerAnalytics, error) {
	// Try cache first
	cacheKey := fmt.Sprintf("analytics:filler:%s", userID)
	var analytics FillerAnalytics
	if err := s.cache.Get(ctx, cacheKey, &analytics); err == nil {
		return &analytics, nil
	}

	// Total surveys completed
	err := s.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM responses
		WHERE filler_id = $1 AND status = 'completed'
	`, userID).Scan(&analytics.TotalSurveysCompleted)
	if err != nil {
		analytics.TotalSurveysCompleted = 0
	}

	// Total earnings and balance
	err = s.db.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_earnings,
			COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_earnings,
			COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as available_balance
		FROM earnings
		WHERE user_id = $1
	`, userID).Scan(&analytics.TotalEarnings, &analytics.PendingEarnings, &analytics.AvailableBalance)
	if err != nil {
		analytics.TotalEarnings = 0
		analytics.PendingEarnings = 0
		analytics.AvailableBalance = 0
	}

	// This month earnings
	err = s.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM earnings
		WHERE user_id = $1
		AND created_at >= date_trunc('month', CURRENT_DATE)
	`, userID).Scan(&analytics.ThisMonthEarnings)
	if err != nil {
		analytics.ThisMonthEarnings = 0
	}

	// This week surveys
	err = s.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM responses
		WHERE filler_id = $1
		AND status = 'completed'
		AND completed_at >= date_trunc('week', CURRENT_DATE)
	`, userID).Scan(&analytics.ThisWeekSurveys)
	if err != nil {
		analytics.ThisWeekSurveys = 0
	}

	// Referral data
	err = s.db.QueryRow(ctx, `
		SELECT
			COALESCE(COUNT(*), 0) as total_referrals,
			COALESCE(SUM(earnings), 0) as referral_earnings
		FROM referrals
		WHERE referrer_id = $1 AND status = 'active'
	`, userID).Scan(&analytics.TotalReferrals, &analytics.ReferralEarnings)
	if err != nil {
		analytics.TotalReferrals = 0
		analytics.ReferralEarnings = 0
	}

	// Completion rate (completed vs started)
	var started, completed int
	s.db.QueryRow(ctx, `
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
		FROM responses
		WHERE filler_id = $1
	`, userID).Scan(&started, &completed)

	if started > 0 {
		analytics.CompletionRate = float64(completed) / float64(started) * 100
	}

	// Cache for 5 minutes
	s.cache.SetWithTTL(ctx, cacheKey, analytics, 5*time.Minute)

	return &analytics, nil
}

// CreatorAnalytics returns analytics for survey creators
type CreatorAnalytics struct {
	TotalSurveysCreated   int     `json:"total_surveys_created"`
	ActiveSurveys         int     `json:"active_surveys"`
	TotalResponses        int     `json:"total_responses"`
	TotalSpent            int     `json:"total_spent"`
	AvailableCredits      int     `json:"available_credits"`
	ThisMonthResponses    int     `json:"this_month_responses"`
	ThisMonthSpent        int     `json:"this_month_spent"`
	AverageResponseTime   float64 `json:"average_response_time_minutes"`
	CompletionRate        float64 `json:"completion_rate"`
	TopPerformingSurveyID string  `json:"top_performing_survey_id"`
}

func (s *AnalyticsService) GetCreatorAnalytics(ctx context.Context, userID string) (*CreatorAnalytics, error) {
	// Try cache first
	cacheKey := fmt.Sprintf("analytics:creator:%s", userID)
	var analytics CreatorAnalytics
	if err := s.cache.Get(ctx, cacheKey, &analytics); err == nil {
		return &analytics, nil
	}

	// Total surveys and active surveys
	err := s.db.QueryRow(ctx, `
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active
		FROM surveys
		WHERE creator_id = $1
	`, userID).Scan(&analytics.TotalSurveysCreated, &analytics.ActiveSurveys)
	if err != nil {
		analytics.TotalSurveysCreated = 0
		analytics.ActiveSurveys = 0
	}

	// Total responses
	err = s.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(current_responses), 0)
		FROM surveys
		WHERE creator_id = $1
	`, userID).Scan(&analytics.TotalResponses)
	if err != nil {
		analytics.TotalResponses = 0
	}

	// Financial data
	err = s.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM payment_transactions
		WHERE user_id = $1 AND type = 'purchase' AND status = 'success'
	`, userID).Scan(&analytics.TotalSpent)
	if err != nil {
		analytics.TotalSpent = 0
	}

	// Available credits
	err = s.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM credits
		WHERE user_id = $1
	`, userID).Scan(&analytics.AvailableCredits)
	if err != nil {
		analytics.AvailableCredits = 0
	}

	// This month stats
	err = s.db.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(s.current_responses), 0) as responses,
			COALESCE(SUM(s.reward_amount * s.current_responses), 0) as spent
		FROM surveys s
		WHERE s.creator_id = $1
		AND s.created_at >= date_trunc('month', CURRENT_DATE)
	`, userID).Scan(&analytics.ThisMonthResponses, &analytics.ThisMonthSpent)
	if err != nil {
		analytics.ThisMonthResponses = 0
		analytics.ThisMonthSpent = 0
	}

	// Completion rate
	var targetResponses, actualResponses int
	s.db.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(target_responses), 0) as target,
			COALESCE(SUM(current_responses), 0) as actual
		FROM surveys
		WHERE creator_id = $1 AND status != 'draft'
	`, userID).Scan(&targetResponses, &actualResponses)

	if targetResponses > 0 {
		analytics.CompletionRate = float64(actualResponses) / float64(targetResponses) * 100
	}

	// Top performing survey
	s.db.QueryRow(ctx, `
		SELECT id
		FROM surveys
		WHERE creator_id = $1
		ORDER BY current_responses DESC
		LIMIT 1
	`, userID).Scan(&analytics.TopPerformingSurveyID)

	// Cache for 5 minutes
	s.cache.SetWithTTL(ctx, cacheKey, analytics, 5*time.Minute)

	return &analytics, nil
}

// AdminAnalytics returns platform-wide analytics
type AdminAnalytics struct {
	TotalUsers         int            `json:"total_users"`
	TotalFillers       int            `json:"total_fillers"`
	TotalCreators      int            `json:"total_creators"`
	TotalSurveys       int            `json:"total_surveys"`
	ActiveSurveys      int            `json:"active_surveys"`
	TotalResponses     int            `json:"total_responses"`
	TotalRevenue       int            `json:"total_revenue"`
	TotalPayouts       int            `json:"total_payouts"`
	ThisMonthUsers     int            `json:"this_month_users"`
	ThisMonthRevenue   int            `json:"this_month_revenue"`
	ThisMonthResponses int            `json:"this_month_responses"`
	PendingWithdrawals int            `json:"pending_withdrawals"`
	UserGrowthRate     float64        `json:"user_growth_rate"`
	TopCategories      map[string]int `json:"top_categories"`
}

func (s *AnalyticsService) GetAdminAnalytics(ctx context.Context) (*AdminAnalytics, error) {
	// Try cache first
	cacheKey := "analytics:admin:platform"
	var analytics AdminAnalytics
	if err := s.cache.Get(ctx, cacheKey, &analytics); err == nil {
		return &analytics, nil
	}

	// User counts
	err := s.db.QueryRow(ctx, `
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN role = 'filler' THEN 1 END) as fillers,
			COUNT(CASE WHEN role = 'creator' THEN 1 END) as creators
		FROM users
		WHERE is_active = true
	`).Scan(&analytics.TotalUsers, &analytics.TotalFillers, &analytics.TotalCreators)
	if err != nil {
		analytics.TotalUsers = 0
		analytics.TotalFillers = 0
		analytics.TotalCreators = 0
	}

	// Survey counts
	err = s.db.QueryRow(ctx, `
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active
		FROM surveys
	`).Scan(&analytics.TotalSurveys, &analytics.ActiveSurveys)
	if err != nil {
		analytics.TotalSurveys = 0
		analytics.ActiveSurveys = 0
	}

	// Response count
	err = s.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM responses WHERE status = 'completed'
	`).Scan(&analytics.TotalResponses)
	if err != nil {
		analytics.TotalResponses = 0
	}

	// Financial data
	err = s.db.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(CASE WHEN type = 'purchase' AND status = 'success' THEN amount ELSE 0 END), 0) as revenue,
			COALESCE(SUM(CASE WHEN type = 'payout' AND status = 'success' THEN amount ELSE 0 END), 0) as payouts
		FROM payment_transactions
	`).Scan(&analytics.TotalRevenue, &analytics.TotalPayouts)
	if err != nil {
		analytics.TotalRevenue = 0
		analytics.TotalPayouts = 0
	}

	// Pending withdrawals
	err = s.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM withdrawals
		WHERE status = 'pending'
	`).Scan(&analytics.PendingWithdrawals)
	if err != nil {
		analytics.PendingWithdrawals = 0
	}

	// This month stats
	err = s.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM users
		WHERE created_at >= date_trunc('month', CURRENT_DATE)
	`).Scan(&analytics.ThisMonthUsers)
	if err != nil {
		analytics.ThisMonthUsers = 0
	}

	err = s.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM payment_transactions
		WHERE type = 'purchase'
		AND status = 'success'
		AND created_at >= date_trunc('month', CURRENT_DATE)
	`).Scan(&analytics.ThisMonthRevenue)
	if err != nil {
		analytics.ThisMonthRevenue = 0
	}

	err = s.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM responses
		WHERE status = 'completed'
		AND completed_at >= date_trunc('month', CURRENT_DATE)
	`).Scan(&analytics.ThisMonthResponses)
	if err != nil {
		analytics.ThisMonthResponses = 0
	}

	// User growth rate (this month vs last month)
	var lastMonthUsers int
	s.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM users
		WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
		AND created_at < date_trunc('month', CURRENT_DATE)
	`).Scan(&lastMonthUsers)

	if lastMonthUsers > 0 {
		analytics.UserGrowthRate = float64(analytics.ThisMonthUsers-lastMonthUsers) / float64(lastMonthUsers) * 100
	}

	// Top categories
	analytics.TopCategories = make(map[string]int)
	rows, err := s.db.Query(ctx, `
		SELECT category, COUNT(*) as count
		FROM surveys
		WHERE category IS NOT NULL AND category != ''
		GROUP BY category
		ORDER BY count DESC
		LIMIT 10
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var category string
			var count int
			if err := rows.Scan(&category, &count); err == nil {
				analytics.TopCategories[category] = count
			}
		}
	}

	// Cache for 10 minutes
	s.cache.SetWithTTL(ctx, cacheKey, analytics, 10*time.Minute)

	return &analytics, nil
}

// EarningsBreakdown provides detailed earnings information
type EarningsBreakdown struct {
	TotalEarnings      int                  `json:"total_earnings"`
	PaidEarnings       int                  `json:"paid_earnings"`
	PendingEarnings    int                  `json:"pending_earnings"`
	AvailableBalance   int                  `json:"available_balance"`
	MonthlyEarnings    map[string]int       `json:"monthly_earnings"`
	EarningsByType     map[string]int       `json:"earnings_by_type"`
	RecentTransactions []EarningTransaction `json:"recent_transactions"`
}

type EarningTransaction struct {
	ID          string    `json:"id"`
	Amount      int       `json:"amount"`
	Type        string    `json:"type"`
	Status      string    `json:"status"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

func (s *AnalyticsService) GetEarningsBreakdown(ctx context.Context, userID string) (*EarningsBreakdown, error) {
	cacheKey := fmt.Sprintf("analytics:earnings:%s", userID)
	var breakdown EarningsBreakdown
	if err := s.cache.Get(ctx, cacheKey, &breakdown); err == nil {
		return &breakdown, nil
	}

	// Total earnings by status
	err := s.db.QueryRow(ctx, `
		SELECT
			COALESCE(SUM(amount), 0) as total,
			COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid,
			COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending,
			COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as available
		FROM earnings
		WHERE user_id = $1
	`, userID).Scan(&breakdown.TotalEarnings, &breakdown.PaidEarnings, &breakdown.PendingEarnings, &breakdown.AvailableBalance)
	if err != nil {
		breakdown.TotalEarnings = 0
		breakdown.PaidEarnings = 0
		breakdown.PendingEarnings = 0
		breakdown.AvailableBalance = 0
	}

	// Monthly earnings (last 6 months)
	breakdown.MonthlyEarnings = make(map[string]int)
	rows, err := s.db.Query(ctx, `
		SELECT
			TO_CHAR(created_at, 'YYYY-MM') as month,
			SUM(amount) as total
		FROM earnings
		WHERE user_id = $1
		AND created_at >= CURRENT_DATE - interval '6 months'
		GROUP BY month
		ORDER BY month DESC
	`, userID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var month string
			var total int
			if err := rows.Scan(&month, &total); err == nil {
				breakdown.MonthlyEarnings[month] = total
			}
		}
	}

	// Earnings by type
	breakdown.EarningsByType = make(map[string]int)
	rows, err = s.db.Query(ctx, `
		SELECT type, SUM(amount) as total
		FROM earnings
		WHERE user_id = $1
		GROUP BY type
	`, userID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var earningType string
			var total int
			if err := rows.Scan(&earningType, &total); err == nil {
				breakdown.EarningsByType[earningType] = total
			}
		}
	}

	// Recent transactions
	rows, err = s.db.Query(ctx, `
		SELECT id, amount, type, status, description, created_at
		FROM earnings
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 20
	`, userID)
	if err == nil {
		defer rows.Close()
		breakdown.RecentTransactions = []EarningTransaction{}
		for rows.Next() {
			var txn EarningTransaction
			if err := rows.Scan(&txn.ID, &txn.Amount, &txn.Type, &txn.Status, &txn.Description, &txn.CreatedAt); err == nil {
				breakdown.RecentTransactions = append(breakdown.RecentTransactions, txn)
			}
		}
	}

	// Cache for 3 minutes
	s.cache.SetWithTTL(ctx, cacheKey, breakdown, 3*time.Minute)

	return &breakdown, nil
}
