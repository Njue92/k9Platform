# Dog Management Platform - Django Backend

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
cp .env.example.example .env.example
# Edit .env.example with your database credentials
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```

### 6. Run Development Server

For development with WebSocket support, use Daphne:
```bash
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

Or use the standard Django development server (without WebSocket support):
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`
WebSocket notifications will be available at `ws://localhost:8000/ws/notifications/`

## Real-Time Notifications

The backend supports real-time WebSocket notifications for:
- Reminders (created, due soon)
- Breeding events (created, confirmed)
- Litter events (born)
- Training milestones (created, excellent performance)
- Deployment events (created, completed)

Connect to: `ws://localhost:8000/ws/notifications/?token=YOUR_JWT_TOKEN`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user (requires: username, email, password, first_name, last_name, role)
- `POST /api/auth/login/` - Login (requires: username, password)
- `GET /api/auth/profile/` - Get current user profile

### Dashboard
- `GET /api/dashboard/stats/` - Get role-specific dashboard statistics

### Dogs Management
- `GET /api/dogs/` - List all dogs
- `POST /api/dogs/` - Create new dog
- `GET /api/dogs/{id}/` - Get dog details
- `PUT /api/dogs/{id}/` - Update dog
- `DELETE /api/dogs/{id}/` - Delete dog

### Health Records
- Full CRUD: `/api/health-records/`

### Breeding Module (For Breeders)
- `/api/breeding-records/` - Breeding records
- `/api/litters/` - Litter management
- `/api/puppies/` - Puppy tracking
- `/api/genetic-tests/` - Genetic test results

### Training Module (For Trainers)
- `/api/training-records/` - Training history
- `/api/behavior-assessments/` - Behavior evaluations
- `/api/deployments/` - Deployment tracking

### General
- `/api/equipment/` - Equipment management
- `/api/financial-records/` - Financial tracking
- `/api/financial-records/dashboard/` - Financial dashboard
- `/api/documents/` - Document uploads
- `/api/reminders/` - Reminders and alerts

## Admin Panel
Access the admin panel at `http://localhost:8000/admin/` using your superuser credentials.

## CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative frontend port)

Modify `CORS_ALLOWED_ORIGINS` in `settings.py` for production deployment.
