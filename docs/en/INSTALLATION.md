# 🛠️ Installation Guide

This guide will walk you through setting up NeuroStock in your local environment.

---

## 📋 Prerequisites

Before starting, make sure you have the following installed:

| Software | Minimum Version | Check Installation |
|----------|-----------------|-------------------|
| Python | 3.12+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.0+ | `git --version` |

---

## 🚀 Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/neurostock.git
cd neurostock
```

---

### 2. Configure the Backend (Django)

#### 2.1 Create Virtual Environment

```bash
# Create virtual environment
python -m venv env

# Activate virtual environment
# Windows PowerShell:
.\env\Scripts\Activate.ps1

# Windows CMD:
.\env\Scripts\activate.bat

# Linux/MacOS:
source env/bin/activate
```

> 💡 **Tip**: You'll know the environment is active when you see `(env)` at the beginning of your command line.

#### 2.2 Install Dependencies

```bash
cd backend-drf
pip install -r requirements.txt
```

Main dependencies include:
- Django 5.2
- Django REST Framework
- TensorFlow/Keras
- yfinance
- scikit-learn
- NumPy, Pandas

#### 2.3 Configure Environment Variables

Create `.env` file in the `backend-drf/` folder:

```bash
# Windows PowerShell
@"
SECRET_KEY=your-super-secure-secret-key-here
DEBUG=True
"@ | Out-File -FilePath .env -Encoding UTF8

# Linux/MacOS
cat > .env << EOF
SECRET_KEY=your-super-secure-secret-key-here
DEBUG=True
EOF
```

> ⚠️ **Important**: In production, `DEBUG` should be `False` and `SECRET_KEY` should be a unique and complex key.

#### 2.4 Run Migrations

```bash
python manage.py migrate
```

#### 2.5 Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

#### 2.6 Verify ML Model

Make sure the file `stock_prediction_model.keras` exists in `backend-drf/`. This is the pre-trained LSTM model.

#### 2.7 Start Backend Server

```bash
python manage.py runserver
```

Server will be available at: `http://127.0.0.1:8000/`

---

### 3. Configure the Frontend (React)

#### 3.1 Navigate to Frontend Directory

```bash
# From project root
cd frontend-react
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Configure Environment Variables

Create `.env` file in the `frontend-react/` folder:

```bash
# Windows PowerShell
echo "VITE_BACKEND_BASE_API=http://127.0.0.1:8000/api/v1" | Out-File -FilePath .env -Encoding UTF8

# Linux/MacOS
echo "VITE_BACKEND_BASE_API=http://127.0.0.1:8000/api/v1" > .env
```

#### 3.4 Start Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173/`

---

## ✅ Verify Installation

### 1. Verify Backend

Open your browser and visit:
- API Root: `http://127.0.0.1:8000/api/v1/`
- Admin Panel: `http://127.0.0.1:8000/admin/`

### 2. Verify Frontend

Visit `http://localhost:5173/` and you should see the NeuroStock home page.

### 3. Integration Test

1. Register with a new user
2. Log in
3. In the dashboard, enter a ticker (e.g., `AAPL`)
4. You should see the prediction charts and metrics

---

## 🐛 Troubleshooting

### Error: "Model file not found"

```
FileNotFoundError: Model file not found: stock_prediction_model.keras
```

**Solution**: Make sure the file `stock_prediction_model.keras` is in `backend-drf/`.

### Error: "CORS blocked"

**Solution**: Verify that `corsheaders` is in `INSTALLED_APPS` and `CORS_ALLOW_ALL_ORIGINS = True` in development.

### Error: "Module not found"

**Solution**: Make sure the virtual environment is activated and dependencies are installed.

```bash
pip install -r requirements.txt
```

### Error: "Connection refused" in Frontend

**Solution**: Verify the backend is running on port 8000 and the URL in frontend's `.env` is correct.

---

## 🚀 Useful Commands

### Backend

```bash
# Activate virtual environment
.\env\Scripts\Activate.ps1

# Run server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

---

## 📦 Configuration Files Structure

```
NeuroStock/
├── backend-drf/
│   ├── .env                          # Backend environment variables
│   ├── requirements.txt              # Python dependencies
│   ├── manage.py                     # Django CLI
│   └── stock_prediction_model.keras  # LSTM model
│
└── frontend-react/
    ├── .env                          # Frontend environment variables
    ├── package.json                  # Node.js dependencies
    └── vite.config.js                # Vite configuration
```

---

## 🔜 Next Step

Once installed, check the [Project Architecture](ARCHITECTURE.md) to understand how the system works.
