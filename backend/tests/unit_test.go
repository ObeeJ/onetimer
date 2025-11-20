package tests

import (
	"onetimer-backend/services"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestBillingService(t *testing.T) {
	service := services.NewBillingService()

	t.Run("Calculate Survey Cost", func(t *testing.T) {
		billing := services.SurveyBilling{
			Pages:         5,
			RewardPerUser: 150,
			Respondents:   100,
		}

		result, err := service.CalculateSurveyCost(billing)
		assert.NoError(t, err)
		assert.Greater(t, result.TotalCost, 0)
		assert.Equal(t, 15150, result.TotalCost) // (150 * 100) + 150 platform fee
		assert.Equal(t, "Basic", result.ComplexityLevel)
	})

	t.Run("Validate Reward Range", func(t *testing.T) {
		err := service.ValidateRewardRange(3, 120)
		assert.NoError(t, err)

		err = service.ValidateRewardRange(10, 50) // Too low for 10 pages
		assert.Error(t, err)
	})
}

func TestOTPService(t *testing.T) {
	service := services.NewOTPService()

	t.Run("Generate OTP", func(t *testing.T) {
		otp, err := service.Generate()
		assert.NoError(t, err)
		assert.Len(t, otp, 6)
		assert.Regexp(t, `^\d{6}$`, otp)
	})

	t.Run("Check Expiry", func(t *testing.T) {
		// Test fresh OTP
		fresh := service.IsExpired(time.Now())
		assert.False(t, fresh)

		// Test expired OTP
		expired := service.IsExpired(time.Now().Add(-10 * time.Minute))
		assert.True(t, expired)
	})
}
