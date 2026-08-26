-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Learners table
CREATE TABLE IF NOT EXISTS learners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    time_budget_hours FLOAT DEFAULT 5.0,
    preferred_format TEXT DEFAULT 'video',
    difficulty_tolerance TEXT DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Learner Skills
CREATE TABLE IF NOT EXISTS learner_skills (
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    mastery_level INTEGER DEFAULT 0,
    PRIMARY KEY (learner_id, skill_id)
);

-- Learning Goals
CREATE TABLE IF NOT EXISTS learning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    target_role_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE UNIQUE,
    path_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Recommendations Cache
CREATE TABLE IF NOT EXISTS recommendations_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES learners(id) ON DELETE CASCADE,
    resource_id TEXT NOT NULL,
    scoring_factors JSONB NOT NULL,
    explanation_text TEXT,
    UNIQUE (learner_id, resource_id)
);
