# LeadsHub - Full Stack Lead Management System

A complete lead management application with React frontend and multiple backend options (PHP & Java).

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker Desktop installed
- Git (optional)

### Start Everything
```bash
# Start PostgreSQL + PHP Backend + Frontend
docker-compose up --build

# Or include Java backend too
docker-compose --profile java up --build
```

### Access Points
- **Frontend**: http://localhost:3000
- **PHP API**: http://localhost:8080/api/public
- **Java API**: http://localhost:8081/api (if enabled)

### Test Credentials
- Email: demo@leadshub.com
- Password: test123

---

## 🖥️ Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- PHP 8.1+ with Composer
- Java 17+ with Maven (optional)
- PostgreSQL 15+

### 1. Database Setup
```bash
# Create database
createdb leadshub

# Import schema
psql -d leadshub -f database/schema-standalone.sql
```

### 2. Start Frontend
```bash
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### 3. Start PHP Backend
```bash
cd php-backend
composer install
cp .env.example .env
# Edit .env with your database credentials
php -S localhost:8080 -t public
```

### 4. Start Java Backend (Optional)
```bash
cd java-backend
./mvnw spring-boot:run
```

---

## 📁 Project Structure

```
leadshub/
├── src/                    # React frontend source
├── php-backend/            # PHP backend
│   ├── public/index.php    # Entry point
│   └── src/                # PHP source files
├── java-backend/           # Java Spring Boot backend
├── database/               # SQL schemas
├── docker-compose.yml      # Docker orchestration
└── package.json            # Frontend dependencies
```

## 🔧 Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api/public
```

### PHP Backend (php-backend/.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leadshub
DB_USER=leadshub_user
DB_PASSWORD=your_password
JWT_SECRET=your-32-character-secret-key-here
```

### Java Backend (environment variables)
```bash
SPRING_R2DBC_URL=r2dbc:postgresql://localhost:5432/leadshub
SPRING_R2DBC_USERNAME=leadshub_user
SPRING_R2DBC_PASSWORD=your_password
JWT_SECRET=your-32-character-secret-key-here
```

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login user |
| POST | /api/auth/register | Register user |
| GET | /api/leads | List leads |
| POST | /api/leads | Create lead |
| GET | /api/leads/:id | Get lead |
| PUT | /api/leads/:id | Update lead |
| DELETE | /api/leads/:id | Delete lead |

## 📄 License
MIT License
