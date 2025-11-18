# SEO SOP Repository & Onboarding System - Setup Guide

## Database Setup Complete ✓

Your Supabase database has been configured with the complete schema including:
- 9 tables (users, sop_documents, sop_versions, onboarding_modules, etc.)
- Custom ENUMs for type safety
- Indexes for performance
- Triggers for automated version control
- Full-text search capabilities

## Required: Set Your Database Password

**IMPORTANT**: You need to add your Supabase database password to the backend configuration.

### Step 1: Get Your Database Password
Your database password was set when you created the Supabase project. If you don't remember it:
1. Go to https://supabase.com/dashboard/project/rewnmtvzzwdewubmcvbd/database/settings
2. Click "Reset database password" to create a new password
3. Copy the new password (you won't be able to see it again!)

### Step 2: Update the Backend Configuration
Open `backend/.env` and replace `YOUR_DATABASE_PASSWORD_HERE` with your actual password:

```env
DB_PASSWORD=your_actual_password_here
```

## Connection Details

Your Supabase database connection details (Session Pooler - IPv4 Compatible):
- **Host**: aws-1-eu-central-2.pooler.supabase.com
- **Port**: 5432
- **Database**: postgres
- **User**: postgres.rewnmtvzzwdewubmcvbd
- **Password**: (Set by you in backend/.env)

**Note**: The Session Pooler provides IPv4 compatibility for networks that don't support IPv6. The direct connection host (db.rewnmtvzzwdewubmcvbd.supabase.co) uses IPv6 only.

## Project Structure

```
SEO SOP/
├── backend/              # Node.js/Express API
│   ├── .env             # Environment variables (UPDATE PASSWORD HERE!)
│   ├── src/
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   └── package.json
└── database/
    └── schema.sql       # Database schema (already applied to Supabase)
```

## Next Steps

1. **Set your database password** in `backend/.env` (see above)
2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```
4. **Test the backend connection**:
   ```bash
   cd backend
   npm run dev
   ```
5. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```

## Additional Configuration

You may also want to update in `backend/.env`:
- `JWT_SECRET` - Change to a secure random string
- `JWT_REFRESH_SECRET` - Change to a different secure random string
- SMTP settings if you want email notifications

## Database Schema Highlights

Your database includes:
- **User Management**: Role-based access (Admin, Editor, Viewer, Mentor)
- **SOP Documents**: With versioning, tagging, and full-text search
- **Onboarding System**: Modules, tasks, and progress tracking
- **Activity Logging**: Complete audit trail
- **Notifications**: User notification system

## Support

For Supabase documentation: https://supabase.com/docs
For project issues: Create an issue in your repository
