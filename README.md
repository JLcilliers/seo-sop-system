# SEO SOP Repository & Onboarding System

A comprehensive web application for managing Standard Operating Procedures (SOPs) and onboarding new SEO specialists. Built with Node.js, Express, PostgreSQL, React, and TypeScript.

## Features

### Core Functionality
- **SOP Repository**: Centralized knowledge base for all SEO processes and workflows
- **Version Control**: Track changes and maintain history of all SOP documents
- **Onboarding System**: Structured 4-6 week onboarding program for new hires
- **Progress Tracking**: Monitor individual and team onboarding progress
- **Role-Based Access**: Admin, Editor, Mentor, and Viewer roles with appropriate permissions
- **Search & Filter**: Full-text search across SOPs with category and tag filtering
- **Feedback System**: Collect user feedback on SOP helpfulness and clarity

### Technical Features
- JWT-based authentication
- RESTful API architecture
- Responsive React frontend with Tailwind CSS
- PostgreSQL database with Sequelize ORM
- Full-text search capabilities
- Activity logging and audit trail
- Email notifications for task assignments

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, bcrypt, rate-limiting

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Markdown**: React Markdown

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/JLcilliers/SEO_SOPs.git
cd SEO_SOPs
```

2. **Set up the database**
```bash
# Create PostgreSQL database
createdb seo_sop_db

# Run schema migration
psql -d seo_sop_db -f database/schema.sql

# (Optional) Load seed data
psql -d seo_sop_db -f database/seed.sql
```

3. **Configure backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and JWT secrets
npm install
```

4. **Configure frontend**
```bash
cd ../frontend
npm install
```

### Running the Application

**Development Mode:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:3000

**Production Build:**
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Project Structure

```
SEO_SOPs/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── index.js        # Entry point
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── store/          # State management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # Entry point
│   └── package.json
├── database/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── docs/
│   ├── architecture.md     # System architecture
│   └── deployment.md       # Deployment guide
└── README.md
```

## API Documentation

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatepassword` - Update password

### SOPs
- `GET /api/v1/sops` - List all SOPs (with search/filter)
- `GET /api/v1/sops/:id` - Get SOP details
- `POST /api/v1/sops` - Create SOP (Admin/Editor)
- `PUT /api/v1/sops/:id` - Update SOP (Admin/Editor)
- `DELETE /api/v1/sops/:id` - Delete SOP (Admin)
- `POST /api/v1/sops/:id/feedback` - Submit feedback

### Onboarding
- `GET /api/v1/onboarding/progress` - Get my progress
- `GET /api/v1/onboarding/mentees/:userId` - Get mentee progress (Mentor/Admin)
- `PUT /api/v1/onboarding/tasks/:taskId` - Update task status
- `GET /api/v1/onboarding/modules` - List modules (Admin)
- `POST /api/v1/onboarding/modules` - Create module (Admin)

## User Roles

### Admin
- Full system access
- Manage users, SOPs, and onboarding modules
- View all analytics and reports

### Editor
- Create and edit SOPs
- Cannot delete SOPs or manage users

### Mentor
- View assigned mentee progress
- Guide new hires through onboarding

### Viewer
- Read-only access to published SOPs
- Complete assigned onboarding tasks
- Submit feedback

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seo_sop_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions for:
- AWS (EC2, RDS, S3)
- Docker containers
- Heroku
- Vercel (frontend)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/JLcilliers/SEO_SOPs/issues
- Email: support@example.com

## Acknowledgments

- Built for SEO teams to scale knowledge and onboarding
- Inspired by best practices in SOP management and employee onboarding
- Uses industry-standard SEO tools and workflows (Ahrefs, SEMrush, Screaming Frog, GSC)
