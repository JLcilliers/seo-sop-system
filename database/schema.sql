-- SEO SOP Repository & Onboarding System Database Schema
-- PostgreSQL 14+

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Enums
CREATE TYPE user_role AS ENUM ('Admin', 'Editor', 'Viewer', 'Mentor');
CREATE TYPE onboarding_status AS ENUM ('PreDay1', 'Orientation', 'Training', 'Evaluation', 'Completed');
CREATE TYPE sop_category AS ENUM ('TechnicalSEO', 'Content', 'LinkBuilding', 'Analytics', 'ToolAccess', 'General');
CREATE TYPE sop_status AS ENUM ('Draft', 'Published', 'Archived');
CREATE TYPE task_status AS ENUM ('NotStarted', 'InProgress', 'Completed');
CREATE TYPE onboarding_phase AS ENUM ('Preparation', 'Orientation', 'Training', 'Evaluation');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Viewer',
    hire_date DATE,
    onboarding_status onboarding_status DEFAULT 'PreDay1',
    mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- SOP Documents Table
CREATE TABLE sop_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    category sop_category NOT NULL,
    subcategory VARCHAR(255),
    purpose TEXT NOT NULL,
    scope TEXT,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status sop_status NOT NULL DEFAULT 'Draft',
    version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    content TEXT NOT NULL,
    tags TEXT[], -- Array of tags
    review_interval_days INTEGER DEFAULT 90,
    last_review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- SOP Versions Table (Version History)
CREATE TABLE sop_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_document_id UUID NOT NULL REFERENCES sop_documents(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Modules Table
CREATE TABLE onboarding_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    phase onboarding_phase NOT NULL,
    sequence_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    content TEXT,
    estimated_hours DECIMAL(4,2),
    linked_sop_ids UUID[], -- Array of SOP document IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Tasks Table
CREATE TABLE onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES onboarding_modules(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) DEFAULT 'manual', -- manual, quiz, video, reading
    task_metadata JSONB, -- For quiz questions, video URLs, etc.
    sequence_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Task Progress Table
CREATE TABLE user_task_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
    status task_status DEFAULT 'NotStarted',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    quiz_score DECIMAL(5,2), -- For quiz tasks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- SOP Feedback Table
CREATE TABLE sop_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_document_id UUID NOT NULL REFERENCES sop_documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'task_due', 'sop_review_due', 'onboarding_milestone'
    title VARCHAR(500) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Activity Log Table (Audit Trail)
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'view'
    entity_type VARCHAR(100), -- 'sop_document', 'user', 'task'
    entity_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_onboarding_status ON users(onboarding_status);
CREATE INDEX idx_users_mentor ON users(mentor_id);
CREATE INDEX idx_sop_category ON sop_documents(category);
CREATE INDEX idx_sop_status ON sop_documents(status);
CREATE INDEX idx_sop_owner ON sop_documents(owner_user_id);
CREATE INDEX idx_sop_tags ON sop_documents USING GIN(tags);
CREATE INDEX idx_sop_versions_doc ON sop_versions(sop_document_id);
CREATE INDEX idx_onboarding_modules_phase ON onboarding_modules(phase);
CREATE INDEX idx_tasks_module ON onboarding_tasks(module_id);
CREATE INDEX idx_user_progress_user ON user_task_progress(user_id);
CREATE INDEX idx_user_progress_task ON user_task_progress(task_id);
CREATE INDEX idx_user_progress_status ON user_task_progress(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- Full-Text Search Index for SOPs
CREATE INDEX idx_sop_search ON sop_documents USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(purpose, '') || ' ' || COALESCE(content, ''))
);

-- Functions for Updated Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for Updated Timestamp
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sop_documents_updated_at BEFORE UPDATE ON sop_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_modules_updated_at BEFORE UPDATE ON onboarding_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_tasks_updated_at BEFORE UPDATE ON onboarding_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_task_progress_updated_at BEFORE UPDATE ON user_task_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create SOP version on update
CREATE OR REPLACE FUNCTION create_sop_version()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.content IS DISTINCT FROM NEW.content OR OLD.version IS DISTINCT FROM NEW.version THEN
        INSERT INTO sop_versions (sop_document_id, version, content, changed_by)
        VALUES (OLD.id, OLD.version, OLD.content, NEW.owner_user_id);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_sop_version_trigger BEFORE UPDATE ON sop_documents
    FOR EACH ROW EXECUTE FUNCTION create_sop_version();

-- View for SOP with latest feedback
CREATE VIEW sop_with_stats AS
SELECT 
    s.*,
    COUNT(DISTINCT f.id) as feedback_count,
    AVG(f.rating) as average_rating,
    COUNT(DISTINCT CASE WHEN f.is_helpful = true THEN f.id END) as helpful_count,
    COUNT(DISTINCT v.id) as version_count
FROM sop_documents s
LEFT JOIN sop_feedback f ON s.id = f.sop_document_id
LEFT JOIN sop_versions v ON s.id = v.sop_document_id
GROUP BY s.id;

-- View for user onboarding progress
CREATE VIEW user_onboarding_progress AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.onboarding_status,
    COUNT(DISTINCT utp.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN utp.status = 'Completed' THEN utp.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN utp.status = 'InProgress' THEN utp.id END) as in_progress_tasks,
    ROUND((COUNT(DISTINCT CASE WHEN utp.status = 'Completed' THEN utp.id END)::DECIMAL / 
           NULLIF(COUNT(DISTINCT utp.id), 0) * 100), 2) as completion_percentage,
    m.name as mentor_name
FROM users u
LEFT JOIN user_task_progress utp ON u.id = utp.user_id
LEFT JOIN users m ON u.mentor_id = m.id
GROUP BY u.id, u.name, u.email, u.onboarding_status, m.name;

-- Initial Admin User (password: Admin123! - CHANGE IN PRODUCTION)
-- Password hash for 'Admin123!' using bcrypt
INSERT INTO users (email, name, password_hash, role, is_active) 
VALUES (
    'admin@seosop.com',
    'System Administrator',
    '$2b$10$rKvVJZZZZZZZZZZZZZZZZeuGKqH5tPCYqH5tPCYqH5tPCYqH5tPCY', -- Placeholder, will be generated in app
    'Admin',
    true
);
