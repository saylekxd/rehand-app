-- Migration for Cloud LLM Strategic Analysis
-- Creates tables for caching, usage tracking, and analytics

-- User Sessions Table (groups individual exercises into training sessions)
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) DEFAULT 'workout',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    session_data JSONB DEFAULT '{}',
    exercise_type VARCHAR(50),
    total_exercises INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0, -- in minutes
    avg_quality DECIMAL(3,2),
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategic Analysis Cache Table
CREATE TABLE strategic_analysis_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(20) NOT NULL CHECK (analysis_type IN ('session_summary', 'weekly_review', 'live_coaching', 'plateau_analysis')),
    analysis_data JSONB NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(8,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Strategic Analysis Usage Tracking
CREATE TABLE strategic_analysis_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    analysis_type VARCHAR(20) NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(8,4) NOT NULL DEFAULT 0,
    processing_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
    request_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly Progress Reports
CREATE TABLE weekly_progress_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    report_data JSONB NOT NULL,
    strategic_insights JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- Session Strategic Analysis (stores full analyses)
CREATE TABLE session_strategic_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(20) NOT NULL,
    analysis_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(8,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Coaching Interactions
CREATE TABLE live_coaching_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trigger_context JSONB NOT NULL,
    coaching_response TEXT NOT NULL,
    response_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
    user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5), -- 1-5 rating
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cloud LLM Configuration per User
CREATE TABLE user_cloud_llm_preferences (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    language VARCHAR(2) NOT NULL DEFAULT 'pl' CHECK (language IN ('pl', 'en')),
    detail_level VARCHAR(15) NOT NULL DEFAULT 'detailed' CHECK (detail_level IN ('brief', 'detailed', 'comprehensive')),
    communication_style VARCHAR(15) NOT NULL DEFAULT 'motivational' CHECK (communication_style IN ('formal', 'casual', 'motivational')),
    focus_areas TEXT[] DEFAULT '{}',
    weekly_reports_enabled BOOLEAN DEFAULT true,
    live_coaching_enabled BOOLEAN DEFAULT true,
    max_daily_requests INTEGER DEFAULT 10,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User AI Analytics and Insights
CREATE TABLE user_ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type VARCHAR(30) NOT NULL,
    insight_data JSONB NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    source VARCHAR(20) NOT NULL CHECK (source IN ('ml_analysis', 'cloud_llm', 'pattern_detection')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX idx_strategic_cache_user_type ON strategic_analysis_cache(user_id, analysis_type);
CREATE INDEX idx_strategic_cache_expires ON strategic_analysis_cache(expires_at);
CREATE INDEX idx_strategic_usage_user_date ON strategic_analysis_usage(user_id, created_at);
CREATE INDEX idx_weekly_reports_user_date ON weekly_progress_reports(user_id, week_start_date);
CREATE INDEX idx_session_analyses_session ON session_strategic_analyses(session_id);
CREATE INDEX idx_live_coaching_session ON live_coaching_interactions(session_id);
CREATE INDEX idx_ai_insights_user_active ON user_ai_insights(user_id, is_active);

-- RLS (Row Level Security) policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_analysis_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_strategic_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_coaching_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cloud_llm_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_insights ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own strategic cache" ON strategic_analysis_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage data" ON strategic_analysis_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own weekly reports" ON weekly_progress_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own session analyses" ON session_strategic_analyses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own coaching interactions" ON live_coaching_interactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own LLM preferences" ON user_cloud_llm_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own AI insights" ON user_ai_insights FOR ALL USING (auth.uid() = user_id);

-- Service role can insert into cache and usage tables
CREATE POLICY "Service role can manage cache" ON strategic_analysis_cache FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can insert usage" ON strategic_analysis_usage FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Clean up expired cache entries (to be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM strategic_analysis_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's daily usage count
CREATE OR REPLACE FUNCTION get_daily_usage_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM strategic_analysis_usage
        WHERE user_id = p_user_id
        AND created_at >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate weekly progress summary
CREATE OR REPLACE FUNCTION generate_weekly_summary(
    p_user_id UUID,
    p_week_start DATE
)
RETURNS JSONB AS $$
DECLARE
    summary JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalExercises', COUNT(ue.id),
        'totalMinutes', COALESCE(SUM(ue.duration_completed), 0),
        'avgDifficultyRating', COALESCE(AVG(ue.difficulty_rating), 0),
        'consistencyScore', 
            CASE 
                WHEN COUNT(DISTINCT DATE(ue.completed_at)) >= 5 THEN 100
                WHEN COUNT(DISTINCT DATE(ue.completed_at)) >= 3 THEN 75
                WHEN COUNT(DISTINCT DATE(ue.completed_at)) >= 1 THEN 50
                ELSE 0
            END,
        'exerciseBreakdown', jsonb_agg(
            DISTINCT jsonb_build_object(
                'exerciseId', e.id,
                'exerciseTitle', e.title,
                'category', e.category,
                'completions', COUNT(ue.id),
                'totalMinutes', SUM(ue.duration_completed),
                'avgRating', AVG(ue.difficulty_rating)
            )
        ),
        'dailyActivity', jsonb_agg(
            DISTINCT jsonb_build_object(
                'date', DATE(ue.completed_at),
                'exercises', COUNT(ue.id),
                'minutes', SUM(ue.duration_completed)
            )
        )
    ) INTO summary
    FROM user_exercises ue
    LEFT JOIN exercises e ON ue.exercise_id = e.id
    WHERE ue.user_id = p_user_id
    AND ue.completed_at >= p_week_start
    AND ue.completed_at < p_week_start + INTERVAL '7 days'
    GROUP BY ue.user_id;

    -- If no data found, return empty summary
    IF summary IS NULL THEN
        summary := jsonb_build_object(
            'totalExercises', 0,
            'totalMinutes', 0,
            'avgDifficultyRating', 0,
            'consistencyScore', 0,
            'exerciseBreakdown', '[]'::jsonb,
            'dailyActivity', '[]'::jsonb
        );
    END IF;

    RETURN summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE user_sessions IS 'Groups individual exercises into training sessions for analysis';
COMMENT ON TABLE strategic_analysis_cache IS 'Caches GPT-4 strategic analysis responses to reduce costs';
COMMENT ON TABLE strategic_analysis_usage IS 'Tracks API usage and costs for analytics and billing';
COMMENT ON TABLE weekly_progress_reports IS 'Stores generated weekly progress reports for users';
COMMENT ON TABLE session_strategic_analyses IS 'Full strategic analyses linked to specific sessions';
COMMENT ON TABLE live_coaching_interactions IS 'Real-time coaching interactions and user feedback';
COMMENT ON TABLE user_cloud_llm_preferences IS 'User preferences for cloud LLM interactions';
COMMENT ON TABLE user_ai_insights IS 'AI-generated insights about user patterns and progress';
