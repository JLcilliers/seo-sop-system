-- Sample Seed Data for SEO SOP Repository
-- Run this after schema.sql

-- Insert Admin User (password: Admin123!)
INSERT INTO users (email, name, password_hash, role, hire_date, is_active)
VALUES (
  'admin@seosop.com',
  'System Administrator',
  '$2b$10$YourHashedPasswordHere',  -- Use bcrypt to hash: Admin123!
  'Admin',
  CURRENT_DATE,
  true
);

-- Insert Sample Mentor
INSERT INTO users (email, name, password_hash, role, hire_date, is_active)
VALUES (
  'mentor@seosop.com',
  'Sarah Johnson',
  '$2b$10$YourHashedPasswordHere',
  'Mentor',
  CURRENT_DATE - INTERVAL '2 years',
  true
);

-- Insert Sample New Hire
INSERT INTO users (email, name, password_hash, role, hire_date, onboarding_status, mentor_id, is_active)
VALUES (
  'newhire@seosop.com',
  'Alex Martinez',
  '$2b$10$YourHashedPasswordHere',
  'Viewer',
  CURRENT_DATE - INTERVAL '1 week',
  'Training',
  (SELECT id FROM users WHERE email = 'mentor@seosop.com'),
  true
);

-- Sample SOPs
INSERT INTO sop_documents (title, category, subcategory, purpose, scope, owner_user_id, status, version, content, tags, published_at)
VALUES
(
  'Technical SEO Site Audit - Complete Guide',
  'TechnicalSEO',
  'Site Audits',
  'Perform comprehensive technical SEO audits to identify and prioritize optimization opportunities',
  'All client websites requiring technical SEO analysis',
  (SELECT id FROM users WHERE email = 'admin@seosop.com'),
  'Published',
  'v2.1',
  '# Technical SEO Site Audit

## Overview
This SOP covers the complete process for conducting technical SEO audits using industry-standard tools.

## Tools Required
- Screaming Frog SEO Spider
- Google Search Console
- Ahrefs Site Audit
- PageSpeed Insights

## Audit Process

### 1. Initial Setup
1. Configure Screaming Frog with proper settings
2. Set crawl limits based on site size
3. Connect to Google Analytics and Search Console

### 2. Crawl Analysis
- Review crawl statistics
- Identify crawl errors (4xx, 5xx)
- Check robots.txt and XML sitemaps
- Analyze URL structure

### 3. On-Page Factors
- Title tags and meta descriptions
- Header tag hierarchy (H1-H6)
- Internal linking structure
- Image optimization (alt tags, file sizes)

### 4. Technical Issues
- Page speed and Core Web Vitals
- Mobile responsiveness
- HTTPS implementation
- Structured data markup

### 5. Reporting
- Prioritize issues by impact
- Create actionable recommendations
- Document in standard template',
  ARRAY['technical-seo', 'audit', 'screaming-frog', 'site-analysis'],
  NOW()
),
(
  'Keyword Research Process - From Seed to Strategy',
  'Content',
  'Keyword Research',
  'Conduct comprehensive keyword research to identify high-value search opportunities aligned with business goals',
  'All content strategy and SEO campaigns',
  (SELECT id FROM users WHERE email = 'admin@seosop.com'),
  'Published',
  'v1.5',
  '# Keyword Research Methodology

## Objectives
Identify target keywords that balance search volume, difficulty, and business relevance.

## Tools
- Ahrefs Keywords Explorer
- SEMrush Keyword Magic Tool
- Google Keyword Planner
- Answer The Public

## Process

### 1. Seed Keyword Generation
- Client interview for core topics
- Competitor analysis
- Current ranking keywords
- Business goals alignment

### 2. Keyword Expansion
- Use keyword tools for variations
- Identify question-based keywords
- Find long-tail opportunities
- Analyze search intent (informational, commercial, transactional)

### 3. Metrics Analysis
- Search volume thresholds
- Keyword difficulty scores
- SERP feature opportunities
- CPC and commercial intent

### 4. Categorization
- Intent buckets (awareness, consideration, decision)
- Topic clusters
- Priority tiers (high/medium/low)

### 5. Deliverables
- Keyword matrix spreadsheet
- Content mapping recommendations
- Competitive gap analysis',
  ARRAY['keyword-research', 'content-strategy', 'ahrefs', 'semrush'],
  NOW()
);

-- Onboarding Modules
INSERT INTO onboarding_modules (title, description, phase, sequence_order, is_required, content, estimated_hours)
VALUES
(
  'SEO Tools Setup & Access',
  'Get access to all required SEO tools and platforms',
  'Preparation',
  1,
  true,
  'Set up accounts for Ahrefs, SEMrush, Screaming Frog, Google Analytics, and Search Console',
  2
),
(
  'Company SEO Processes Overview',
  'Introduction to company SEO methodologies and workflows',
  'Orientation',
  2,
  true,
  'Review company SEO philosophy, client communication standards, and reporting cadence',
  4
),
(
  'Technical SEO Fundamentals',
  'Learn technical SEO audit process using company tools',
  'Training',
  3,
  true,
  'Complete hands-on technical audit training with sample client site',
  8
),
(
  'Content & Keyword Strategy',
  'Master keyword research and content optimization processes',
  'Training',
  4,
  true,
  'Conduct keyword research exercise and create content recommendations',
  6
);

-- Onboarding Tasks
INSERT INTO onboarding_tasks (module_id, title, description, task_type, sequence_order, is_required)
VALUES
(
  (SELECT id FROM onboarding_modules WHERE title = 'SEO Tools Setup & Access'),
  'Request Ahrefs Account Access',
  'Submit IT ticket for Ahrefs account provisioning',
  'manual',
  1,
  true
),
(
  (SELECT id FROM onboarding_modules WHERE title = 'SEO Tools Setup & Access'),
  'Install Screaming Frog SEO Spider',
  'Download and install Screaming Frog on your workstation',
  'manual',
  2,
  true
),
(
  (SELECT id FROM onboarding_modules WHERE title = 'Technical SEO Fundamentals'),
  'Complete Technical SEO Quiz',
  'Test your understanding of technical SEO concepts',
  'quiz',
  1,
  true
),
(
  (SELECT id FROM onboarding_modules WHERE title = 'Content & Keyword Strategy'),
  'Keyword Research Practice Exercise',
  'Conduct keyword research for sample client in healthcare vertical',
  'manual',
  1,
  true
);
