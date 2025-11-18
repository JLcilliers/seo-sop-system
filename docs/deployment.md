# Deployment Guide

## Prerequisites

- PostgreSQL 14+ database
- Node.js 18+ runtime
- Domain name with SSL certificate
- SMTP credentials for email notifications

## Environment Setup

### Production Environment Variables

Create `.env` file in backend directory:

```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your-db-host.rds.amazonaws.com
DB_PORT=5432
DB_NAME=seo_sop_production
DB_USER=sop_admin
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@yourdomain.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@yourdomain.com

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Options

### Option 1: AWS Deployment

#### Step 1: Database Setup (RDS)

1. Create PostgreSQL RDS instance
```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier seo-sop-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourPassword \
  --allocated-storage 20
```

2. Run migrations
```bash
psql -h your-rds-endpoint.amazonaws.com -U admin -d postgres -f database/schema.sql
psql -h your-rds-endpoint.amazonaws.com -U admin -d postgres -f database/seed.sql
```

#### Step 2: Backend Deployment (EC2)

1. Launch EC2 instance (Ubuntu 22.04)
2. Install dependencies
```bash
sudo apt update
sudo apt install nodejs npm nginx
```

3. Clone and setup
```bash
git clone https://github.com/JLcilliers/SEO_SOPs.git
cd SEO_SOPs/backend
npm install --production
```

4. Setup PM2 for process management
```bash
npm install -g pm2
pm2 start src/index.js --name seo-sop-api
pm2 startup
pm2 save
```

5. Configure nginx
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 3: Frontend Deployment (S3 + CloudFront)

1. Build frontend
```bash
cd frontend
npm install
npm run build
```

2. Upload to S3
```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

3. Configure CloudFront distribution
- Origin: S3 bucket
- Default root object: index.html
- Error pages: redirect 404 to /index.html (for SPA routing)

### Option 2: Docker Deployment

#### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: seo_sop_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: seo_sop_db
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5000:5000"
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

Backend Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

Frontend Dockerfile:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy:
```bash
docker-compose up -d
```

### Option 3: Heroku Deployment

#### Backend on Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create seo-sop-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# Run migrations
heroku run psql $DATABASE_URL < database/schema.sql
```

#### Frontend on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

## SSL Certificate Setup

### Using Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Monitoring & Maintenance

### Health Checks

Backend health endpoint: `GET /health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-18T12:00:00.000Z"
}
```

### Backup Strategy

#### Database Backups

Daily automated backups:
```bash
# Cron job (run at 2 AM daily)
0 2 * * * pg_dump -h localhost -U postgres seo_sop_db | gzip > /backups/seo_sop_$(date +\%Y\%m\%d).sql.gz
```

#### Backup Retention
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

### Log Management

```bash
# View PM2 logs
pm2 logs seo-sop-api

# Rotate logs
pm2 install pm2-logrotate
```

## Scaling Considerations

### Horizontal Scaling
- Add more EC2 instances behind load balancer
- Use Redis for session storage
- Implement database read replicas

### Vertical Scaling
- Upgrade EC2 instance type
- Increase RDS instance size
- Add database connection pooling

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database connectivity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Verify security groups allow port 5432
```

**502 Bad Gateway**
```bash
# Check backend is running
pm2 status

# Restart backend
pm2 restart seo-sop-api
```

**CORS Errors**
- Verify CORS_ORIGIN in .env matches frontend domain
- Check nginx proxy headers

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up DDoS protection
- [ ] Enable database encryption at rest
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Set up intrusion detection
- [ ] Configure backup encryption

## Post-Deployment

1. Test all authentication flows
2. Verify SOP creation and editing
3. Test onboarding workflows
4. Check email notifications
5. Monitor error logs for 24 hours
6. Load test with expected traffic
7. Set up uptime monitoring (UptimeRobot, Pingdom)

## Rollback Procedure

```bash
# Revert to previous version
git checkout <previous-commit>
pm2 restart seo-sop-api

# Restore database backup
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
```
