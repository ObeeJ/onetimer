package repository

import (
	"context"
	"fmt"
	"onetimer-backend/models"
	"time"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/google/uuid"
)

type SurveyRepository struct {
	*BaseRepository
}

func NewSurveyRepository(base *BaseRepository) *SurveyRepository {
	return &SurveyRepository{BaseRepository: base}
}

func (r *SurveyRepository) CreateSurvey(ctx context.Context, survey *models.Survey, questions []models.Question, totalCost int) error {
	return r.WithTx(ctx, func(tx interface{}) error {
		// Deduct credits
		_, err := r.db.Exec(ctx, "INSERT INTO credits (user_id, amount, type, description) VALUES ($1, $2, $3, $4)", survey.CreatorID, -totalCost, "deduction", fmt.Sprintf("Survey creation: %s", survey.Title))
		if err != nil {
			return err
		}

		// Save survey
		err = r.db.QueryRow(ctx,
			"INSERT INTO surveys (id, creator_id, title, description, category, reward_amount, estimated_duration, target_responses, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
			survey.ID, survey.CreatorID, survey.Title, survey.Description, survey.Category, survey.RewardAmount, survey.EstimatedDuration, survey.TargetResponses, survey.Status).Scan(&survey.ID)
		if err != nil {
			return err
		}

		// Save questions
		for _, q := range questions {
			q.SurveyID = survey.ID
			_, err := r.db.Exec(ctx,
				"INSERT INTO questions (id, survey_id, type, title, description, required, options, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
				q.ID, q.SurveyID, q.Type, q.Title, q.Description, q.Required, q.Options, q.OrderIndex)
			if err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *SurveyRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Survey, error) {
	var survey models.Survey
	err := pgxscan.Get(ctx, r.db, &survey, "SELECT * FROM surveys WHERE id = $1", id)
	if err != nil {
		return nil, err
	}
	return &survey, nil
}

func (r *SurveyRepository) GetAll(ctx context.Context, limit, offset int, status string) ([]models.Survey, error) {
	var surveys []models.Survey
	
	// Optimized query - select only necessary fields and add index hints
	query := "SELECT id, creator_id, title, description, category, reward_amount, estimated_duration, target_responses, current_responses, status, created_at, updated_at FROM surveys"
	args := []interface{}{}
	
	if status != "" {
		query += " WHERE status = $1"
		args = append(args, status)
	}
	
	// Add ORDER BY with index hint and reasonable limit
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, limit, offset)

	// Set a shorter timeout for this specific query
	queryCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	err := pgxscan.Select(queryCtx, r.db, &surveys, query, args...)
	if err != nil {
		return nil, fmt.Errorf("survey query failed: %w", err)
	}
	
	return surveys, nil
}

func (r *SurveyRepository) GetQuestions(ctx context.Context, surveyID uuid.UUID) ([]models.Question, error) {
	var questions []models.Question
	err := pgxscan.Select(ctx, r.db, &questions, "SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index", surveyID)
	if err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *SurveyRepository) Update(ctx context.Context, survey *models.Survey) error {
	_, err := r.db.Exec(ctx,
		"UPDATE surveys SET title = $1, description = $2, category = $3, reward_amount = $4, target_responses = $5, estimated_duration = $6, status = $7, updated_at = NOW() WHERE id = $8",
		survey.Title, survey.Description, survey.Category, survey.RewardAmount, survey.TargetResponses, survey.EstimatedDuration, survey.Status, survey.ID)
	return err
}

func (r *SurveyRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, "DELETE FROM surveys WHERE id = $1", id)
	return err
}

func (r *SurveyRepository) CreateResponse(ctx context.Context, response *models.Response) error {
	_, err := r.db.Exec(ctx,
		"INSERT INTO responses (id, survey_id, filler_id, answers, status, started_at, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		response.ID, response.SurveyID, response.FillerID, response.Answers, response.Status, response.StartedAt, response.CompletedAt)
	return err
}

func (r *SurveyRepository) IncrementResponseCount(ctx context.Context, surveyID uuid.UUID) error {
	_, err := r.db.Exec(ctx, "UPDATE surveys SET current_responses = current_responses + 1 WHERE id = $1", surveyID)
	return err
}

func (r *SurveyRepository) CreateEarning(ctx context.Context, earning *models.Earning) error {
	_, err := r.db.Exec(ctx,
		"INSERT INTO earnings (id, user_id, survey_id, amount, type, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		earning.ID, earning.UserID, earning.SurveyID, earning.Amount, earning.Type, earning.Status, earning.CreatedAt)
	return err
}

func (r *SurveyRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	_, err := r.db.Exec(ctx, "UPDATE surveys SET status = $1, updated_at = NOW() WHERE id = $2", status, id)
	return err
}

func (r *SurveyRepository) GetSurveyResponses(ctx context.Context, surveyID uuid.UUID, limit, offset int) ([]models.Response, int, error) {
	var responses []models.Response
	var total int

	query := "SELECT * FROM responses WHERE survey_id = $1 ORDER BY started_at DESC LIMIT $2 OFFSET $3"
	countQuery := "SELECT COUNT(*) FROM responses WHERE survey_id = $1"

	err := pgxscan.Select(ctx, r.db, &responses, query, surveyID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	err = r.db.QueryRow(ctx, countQuery, surveyID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	return responses, total, nil
}

func (r *SurveyRepository) GetResponseDetails(ctx context.Context, surveyID, responseID uuid.UUID) (*models.Response, error) {
	var response models.Response
	err := pgxscan.Get(ctx, r.db, &response, "SELECT * FROM responses WHERE survey_id = $1 AND id = $2", surveyID, responseID)
	if err != nil {
		return nil, err
	}
	return &response, nil
}
