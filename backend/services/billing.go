package services

import (
	"errors"
	"onetimer-backend/utils"
)

type BillingService struct{}

type SurveyBilling struct {
	Pages              int     `json:"pages"`
	RewardPerUser      int     `json:"reward_per_user"`
	Respondents        int     `json:"respondents"`
	PriorityPlacement  bool    `json:"priority_placement"`
	DemographicFilters int     `json:"demographic_filters"`
	ExtraDays          int     `json:"extra_days"`
	DataExport         bool    `json:"data_export"`
}

type BillingResult struct {
	PlatformFee        int    `json:"platform_fee"`
	TotalCost          int    `json:"total_cost"`
	ComplexityLevel    string `json:"complexity_level"`
	EstimatedDuration  string `json:"estimated_duration"`
}

func NewBillingService() *BillingService {
	return &BillingService{}
}

func (bs *BillingService) CalculateSurveyCost(billing SurveyBilling) (*BillingResult, error) {
	if billing.Pages <= 0 {
		utils.LogWarn("Invalid billing calculation: pages must be greater than 0")
		return nil, errors.New("pages must be greater than 0")
	}
	if billing.RewardPerUser < 100 {
		utils.LogWarn("Invalid billing calculation: reward per user must be at least ₦100")
		return nil, errors.New("reward per user must be at least ₦100")
	}
	if billing.Respondents <= 0 {
		utils.LogWarn("Invalid billing calculation: respondents must be greater than 0")
		return nil, errors.New("respondents must be greater than 0")
	}

	// Calculate platform fee based on complexity
	var platformFee int
	var complexityLevel string
	var estimatedDuration string

	if billing.Pages <= 5 {
		platformFee = 150
		complexityLevel = "Basic"
		estimatedDuration = "2-5 mins"
	} else if billing.Pages <= 10 {
		platformFee = 300
		complexityLevel = "Standard"
		estimatedDuration = "5-10 mins"
	} else if billing.Pages <= 20 {
		platformFee = 500
		complexityLevel = "Advanced"
		estimatedDuration = "10-20 mins"
	} else {
		platformFee = 1000
		complexityLevel = "Enterprise"
		estimatedDuration = "20+ mins"
	}

	// Calculate base cost
	totalCost := (billing.RewardPerUser * billing.Respondents) + platformFee

	// Add-ons
	if billing.PriorityPlacement {
		totalCost += 500
	}
	if billing.DemographicFilters > 0 {
		totalCost += billing.DemographicFilters * 200
	}
	if billing.ExtraDays > 0 {
		totalCost += billing.ExtraDays * 100
	}
	if billing.DataExport {
		totalCost += 300
	}

	result := &BillingResult{
		PlatformFee:       platformFee,
		TotalCost:         totalCost,
		ComplexityLevel:   complexityLevel,
		EstimatedDuration: estimatedDuration,
	}

	utils.LogInfo("Survey cost calculated: complexity=%s, platform_fee=%d, total_cost=%d", complexityLevel, platformFee, totalCost)

	return result, nil
}

func (bs *BillingService) ValidateRewardRange(pages int, rewardPerUser int) error {
	var minReward, maxReward int

	if pages <= 5 {
		minReward, maxReward = 100, 150
	} else if pages <= 10 {
		minReward, maxReward = 150, 250
	} else if pages <= 20 {
		minReward, maxReward = 300, 500
	} else {
		minReward, maxReward = 600, 1000
	}

	if rewardPerUser < minReward || rewardPerUser > maxReward {
		return errors.New("reward amount is outside the valid range for this survey complexity")
	}

	return nil
}