package repository

import (
	"context"
	"encoding/json"
	"onetimer-backend/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SurveyRepository struct {
	*BaseRepository
}

func NewSurveyRepository(db *pgxpool.Pool) *SurveyRepository {
	return &SurveyRepository{BaseRepository: NewBaseRepository(db)}
}

func (r *SurveyRepository) Create(ctx context.Context, survey *models.Survey) error {
	query := `
		INSERT INTO surveys (id, creator_id, title, description, category, target_audience, 
			estimated_time, reward, status, max_responses, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err := r.db.Exec(ctx, query, survey.ID, survey.CreatorID, survey.Title, survey.Description,
		survey.Category, survey.TargetAudience, survey.EstimatedTime, survey.Reward,
		survey.Status, survey.MaxResponses, survey.CreatedAt, survey.UpdatedAt)

	return err
}

func (r *SurveyRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Survey, error) {
	var survey models.Survey

	query := `
		SELECT id, creator_id, title, description, category, target_audience,
			estimated_time, reward, status, max_responses, current_responses,
			created_at, updated_at
		FROM surveys WHERE id = $1
	`

	err := r.db.QueryRow(ctx, query, id).Scan(
		&survey.ID, &survey.CreatorID, &survey.Title, &survey.Description,
		&survey.Category, &survey.TargetAudience, &survey.EstimatedTime,
		&survey.Reward, &survey.Status, &survey.MaxResponses,
		&survey.CurrentResponses, &survey.CreatedAt, &survey.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &survey, nil
}

func (r *SurveyRepository) GetAll(ctx context.Context, limit, offset int, status string) ([]models.Survey, error) {
	var surveys []models.Survey
	var query string
	var args []interface{}

	if status != "" {
		query = `
			SELECT id, creator_id, title, description, category, target_audience,
				estimated_time, reward, status, max_responses, current_responses,
				created_at, updated_at
			FROM surveys WHERE status = $1
			ORDER BY created_at DESC LIMIT $2 OFFSET $3
		`
		args = []interface{}{status, limit, offset}
	} else {
		query = `
			SELECT id, creator_id, title, description, category, target_audience,
				estimated_time, reward, status, max_responses, current_responses,
				created_at, updated_at
			FROM surveys
			ORDER BY created_at DESC LIMIT $1 OFFSET $2
		`
		args = []interface{}{limit, offset}
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var survey models.Survey
		err := rows.Scan(
			&survey.ID, &survey.CreatorID, &survey.Title, &survey.Description,
			&survey.Category, &survey.TargetAudience, &survey.EstimatedTime,
			&survey.Reward, &survey.Status, &survey.MaxResponses,
			&survey.CurrentResponses, &survey.CreatedAt, &survey.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		surveys = append(surveys, survey)
	}

	return surveys, nil
}

func (r *SurveyRepository) Update(ctx context.Context, survey *models.Survey) error {
	query := `
		UPDATE surveys SET title = $2, description = $3, category = $4,
			target_audience = $5, estimated_time = $6, reward = $7,
			status = $8, max_responses = $9, updated_at = $10
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, survey.ID, survey.Title, survey.Description,
		survey.Category, survey.TargetAudience, survey.EstimatedTime,
		survey.Reward, survey.Status, survey.MaxResponses, survey.UpdatedAt)

	return err
}

func (r *SurveyRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := "DELETE FROM surveys WHERE id = $1"
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *SurveyRepository) GetByCreator(ctx context.Context, creatorID uuid.UUID) ([]models.Survey, error) {
	query := `
		SELECT id, creator_id, title, description, category, target_audience,
			estimated_time, reward, status, max_responses, current_responses,
			created_at, updated_at
		FROM surveys WHERE creator_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, creatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var surveys []models.Survey
	for rows.Next() {
		var survey models.Survey
		err := rows.Scan(
			&survey.ID, &survey.CreatorID, &survey.Title, &survey.Description,
			&survey.Category, &survey.TargetAudience, &survey.EstimatedTime,
			&survey.Reward, &survey.Status, &survey.MaxResponses,
			&survey.CurrentResponses, &survey.CreatedAt, &survey.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		surveys = append(surveys, survey)
	}

	return surveys, nil
}

func (r *SurveyRepository) SubmitResponse(ctx context.Context, response *models.Response) error {
	answersJSON, _ := json.Marshal(response.Answers)

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Insert response
	query := `
		INSERT INTO survey_responses (id, survey_id, user_id, answers, status, started_at, completed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err = tx.Exec(ctx, query, response.ID, response.SurveyID, response.FillerID,
		answersJSON, response.Status, response.StartedAt, response.CompletedAt)
	if err != nil {
		return err
	}

	// Update survey response count
	_, err = tx.Exec(ctx, "UPDATE surveys SET current_responses = current_responses + 1 WHERE id = $1", response.SurveyID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *SurveyRepository) GetResponses(ctx context.Context, surveyID uuid.UUID) ([]models.Response, error) {
	query := `
		SELECT id, survey_id, user_id, answers, status, started_at, completed_at
		FROM survey_responses WHERE survey_id = $1
		ORDER BY completed_at DESC
	`

	rows, err := r.db.Query(ctx, query, surveyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var responses []models.Response
	for rows.Next() {
		var response models.Response
		var answersJSON []byte

		err := rows.Scan(
			&response.ID, &response.SurveyID, &response.FillerID,
			&answersJSON, &response.Status, &response.StartedAt, &response.CompletedAt,
		)
		if err != nil {
			return nil, err
		}

		json.Unmarshal(answersJSON, &response.Answers)
		responses = append(responses, response)
	}

	return responses, nil
}

func (r *SurveyRepository) CreateQuestion(ctx context.Context, question *models.Question) error {
	optionsJSON, _ := json.Marshal(question.Options)
	rowsJSON, _ := json.Marshal(question.Rows)
	colsJSON, _ := json.Marshal(question.Cols)

	query := `
		INSERT INTO questions (id, survey_id, type, title, description, required, options, scale, rows, cols, "order")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.Exec(ctx, query, question.ID, question.SurveyID, question.Type, question.Title,
		question.Description, question.Required, optionsJSON, question.Scale, rowsJSON, colsJSON, question.Order)
	return err
}

func (r *SurveyRepository) GetQuestions(ctx context.Context, surveyID uuid.UUID) ([]models.Question, error) {
	query := `
		SELECT id, survey_id, type, title, description, required, options, scale, rows, cols, "order"
		FROM questions WHERE survey_id = $1 ORDER BY "order"
	`
	rows, err := r.db.Query(ctx, query, surveyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []models.Question
	for rows.Next() {
		var question models.Question
		var optionsJSON, rowsJSON, colsJSON []byte
		err := rows.Scan(&question.ID, &question.SurveyID, &question.Type, &question.Title, &question.Description,
			&question.Required, &optionsJSON, &question.Scale, &rowsJSON, &colsJSON, &question.Order)
		if err != nil {
			return nil, err
		}
		json.Unmarshal(optionsJSON, &question.Options)
		json.Unmarshal(rowsJSON, &question.Rows)
		json.Unmarshal(colsJSON, &question.Cols)
		questions = append(questions, question)
	}
	return questions, nil
}

func (r *SurveyRepository) CreateEarning(ctx context.Context, earning *models.Earning) error {
	query := `
		INSERT INTO earnings (id, user_id, survey_id, amount, type, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(ctx, query, earning.ID, earning.UserID, earning.SurveyID, earning.Amount,
		earning.Type, earning.Status, earning.CreatedAt)
	return err
}

func (r *SurveyRepository) CreateResponse(ctx context.Context, response *models.Response) error {
	answersJSON, _ := json.Marshal(response.Answers)
	query := `
		INSERT INTO responses (id, survey_id, filler_id, answers, status, started_at, completed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(ctx, query, response.ID, response.SurveyID, response.FillerID, answersJSON,
		response.Status, response.StartedAt, response.CompletedAt)
	return err
}

func (r *SurveyRepository) IncrementResponseCount(ctx context.Context, surveyID uuid.UUID) error {
	query := `UPDATE surveys SET current_responses = current_responses + 1 WHERE id = $1`
	_, err := r.db.Exec(ctx, query, surveyID)
	return err
}

func (r *SurveyRepository) UpdateStatus(ctx context.Context, surveyID uuid.UUID, status string) error {
	query := `UPDATE surveys SET status = $2, updated_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, surveyID)
	return err
}
