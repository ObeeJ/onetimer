package models

type QuestionRequest struct {
	ID          string   `json:"id"`
	Type        string   `json:"type"` // single, multi, text, rating, matrix
	Title       string   `json:"title"`
	Description string   `json:"description,omitempty"`
	Required    bool     `json:"required"`
	Options     []string `json:"options,omitempty"`
	Scale       int      `json:"scale,omitempty"` // for rating questions
	Rows        []string `json:"rows,omitempty"`  // for matrix questions
	Cols        []string `json:"cols,omitempty"`  // for matrix questions
	Order       int      `json:"order"`
}

type SurveyRequest struct {
	Title              string            `json:"title"`
	Description        string            `json:"description"`
	Category           string            `json:"category"`
	RewardAmount       int               `json:"reward_amount"`
	TargetCount        int               `json:"target_count"`
	Duration           int               `json:"estimated_duration"`
	Questions          []QuestionRequest `json:"questions"`
	PriorityPlacement  bool              `json:"priority_placement,omitempty"`
	DemographicFilters []string          `json:"demographic_filters,omitempty"`
	ExtraDays          int               `json:"extra_days,omitempty"`
	DataExport         bool              `json:"data_export,omitempty"`
	Demographics       struct {
		AgeGroups    []string `json:"age_groups,omitempty"`
		Genders      []string `json:"genders,omitempty"`
		Locations    []string `json:"locations,omitempty"`
		Education    []string `json:"education,omitempty"`
		Employment   []string `json:"employment,omitempty"`
		IncomeRanges []string `json:"income_ranges,omitempty"`
	} `json:"demographics,omitempty"`
}
