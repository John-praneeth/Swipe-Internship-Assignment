# AI Interview Assistant - Backend API

A robust Node.js/Express backend with PostgreSQL database for the AI Interview Assistant application.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin panel for managing users and roles
- **Interview Management**: Complete interview lifecycle management
- **Resume Upload**: File upload with resume processing
- **Real-time Data**: RESTful APIs for real-time interview data
- **Database Integration**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, CORS, helmet, input validation
- **File Storage**: Secure file upload and storage system

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18.0 or higher
- PostgreSQL 12 or higher
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb ai_interview_db

# Update DATABASE_URL in .env file
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/ai_interview_db"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Private |
| GET | `/api/auth/me` | Get current user | Private |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Candidate Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/candidates` | Get all candidates | Interviewer/Admin |
| POST | `/api/candidates` | Create candidate | Private |
| GET | `/api/candidates/:id` | Get candidate details | Private |
| PUT | `/api/candidates/:id` | Update candidate | Private |
| POST | `/api/candidates/:id/answers` | Add answer | Private |
| POST | `/api/candidates/:id/messages` | Add chat message | Private |
| DELETE | `/api/candidates/:id` | Delete candidate | Admin |

### Question Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/questions` | Get all questions | Private |
| POST | `/api/questions` | Create question | Admin |
| PUT | `/api/questions/:id` | Update question | Admin |
| DELETE | `/api/questions/:id` | Delete question | Admin |

### File Upload Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/upload/resume` | Upload resume file | Private |
| DELETE | `/api/upload/:filename` | Delete uploaded file | Private |

## 🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **ADMIN**: Full access to all endpoints
- **INTERVIEWER**: Can view and manage candidates and interviews
- **INTERVIEWEE**: Can manage their own interview data

## 🗃️ Database Schema

### Key Tables

- **users**: User accounts and authentication
- **sessions**: JWT session management
- **candidates**: Interview candidate information
- **questions**: Interview questions bank
- **answers**: Candidate responses to questions
- **chat_messages**: Interview chat history

## 🚦 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔐 Default Login Credentials

After running the seed script, you can use these credentials:

- **Admin**: `admin@demo.com` / `password123`
- **Interviewer**: `interviewer@demo.com` / `password123`
- **Interviewee**: `interviewee@demo.com` / `password123`

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Input Validation**: Request data validation
- **Password Hashing**: bcrypt for secure password storage
- **JWT Expiration**: Automatic token expiration

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── middleware/      # Custom middleware
│   ├── database/        # Database seeds and utilities
│   └── server.ts        # Main server file
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # Uploaded files storage
└── package.json
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Use a production PostgreSQL database
- Configure proper JWT secrets
- Set up file storage (AWS S3, etc.)
- Configure rate limiting for production traffic

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## 🔧 Development Tools

- **Prisma Studio**: Visual database editor (`npm run db:studio`)
- **API Testing**: Use tools like Postman or Thunder Client
- **Database Migrations**: Automatic schema migrations with Prisma

## 📊 Health Check

The API includes a health check endpoint:

```
GET /health
```

Returns server status, uptime, and environment information.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Migration Errors**
   - Reset database: `npx prisma migrate reset`
   - Re-run migrations: `npx prisma migrate dev`

3. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure supported file types (PDF, DOCX)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
