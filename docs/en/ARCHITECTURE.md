# 🏗️ Project Architecture

This document describes the technical architecture of NeuroStock, explaining how the different system components communicate.

---

## 📐 Overview

NeuroStock follows a **client-server architecture** with clear separation between frontend and backend:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     React + Vite (SPA)                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │   Charts    │  │  Dashboard  │  │   Auth (Login/Register) │   │  │
│  │  │  (Chart.js) │  │             │  │                         │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │  │
│  │                          │                                        │  │
│  │                    AxiosInstance                                  │  │
│  │              (Interceptors + JWT Refresh)                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              SERVER                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Django REST Framework                            │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                      API Layer                               │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │  │
│  │  │  │  /predict/   │  │   /token/    │  │   /register/     │   │  │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                   Business Logic                             │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │  │
│  │  │  │ DataPipeline │  │  MLManager   │  │ PredictionEngine │   │  │  │
│  │  │  │  (yfinance)  │  │  (Singleton) │  │  (Monte Carlo)   │   │  │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                     ML Layer                                 │  │  │
│  │  │        ┌────────────────────────────────────┐                │  │  │
│  │  │        │   LSTM Model (TensorFlow/Keras)   │                │  │  │
│  │  │        │   stock_prediction_model.keras    │                │  │  │
│  │  │        └────────────────────────────────────┘                │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Data Layer                                   │  │
│  │  ┌─────────────────┐              ┌─────────────────────────┐    │  │
│  │  │    SQLite DB    │              │   Yahoo Finance API     │    │  │
│  │  │   (Users Auth)  │              │      (yfinance)         │    │  │
│  │  └─────────────────┘              └─────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
NeuroStock/
│
├── backend-drf/                      # Django REST Framework Backend
│   │
│   ├── api/                          # Main app - Predictions
│   │   ├── __init__.py
│   │   ├── views.py                  # Endpoints: StockPredictionAPIView
│   │   ├── urls.py                   # API routes
│   │   ├── serializers.py            # Input data validation
│   │   ├── data_pipeline.py          # Data download and preparation
│   │   ├── ml_manager.py             # Singleton for model management
│   │   ├── prediction_engine.py      # Future predictions engine
│   │   └── migrations/               # Database migrations
│   │
│   ├── accounts/                     # Authentication app
│   │   ├── __init__.py
│   │   ├── views.py                  # RegisterView, ProtectedView
│   │   ├── serializers.py            # UserSerializer
│   │   └── migrations/
│   │
│   ├── stock_prediction_main/        # Django project configuration
│   │   ├── __init__.py
│   │   ├── settings.py               # Main configuration
│   │   ├── urls.py                   # Root URL
│   │   ├── wsgi.py                   # Production WSGI
│   │   └── asgi.py                   # Async support
│   │
│   ├── stock_prediction_model.keras  # Pre-trained LSTM model
│   ├── manage.py                     # Django CLI
│   ├── requirements.txt              # Python dependencies
│   └── db.sqlite3                    # SQLite database
│
├── frontend-react/                   # React + Vite Frontend
│   │
│   ├── src/
│   │   ├── App.jsx                   # Root component and routes
│   │   ├── main.jsx                  # Entry point
│   │   ├── PrivateRoute.jsx          # Protected routes
│   │   ├── PublicRoute.jsx           # Public routes
│   │   │
│   │   ├── components/
│   │   │   ├── Main.jsx              # Landing page
│   │   │   ├── axiosInstance.js      # Configured HTTP client
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx     # Main prediction panel
│   │   │   │
│   │   │   ├── Charts/
│   │   │   │   └── StockChart.jsx    # Chart component
│   │   │   │
│   │   │   ├── Login/
│   │   │   │   └── Login.jsx         # Login form
│   │   │   │
│   │   │   ├── Register/
│   │   │   │   ├── Register.jsx      # Registration page
│   │   │   │   └── RegisterForm.jsx  # Registration form
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx        # Navigation
│   │   │   │   └── Footer.jsx        # Page footer
│   │   │   │
│   │   │   ├── Hooks/
│   │   │   │   └── AuthProvider.jsx  # Authentication context
│   │   │   │
│   │   │   └── ui/                   # Reusable UI components
│   │   │       ├── PremiumButton.jsx
│   │   │       ├── PremiumCard.jsx
│   │   │       ├── MetricCard.jsx
│   │   │       ├── SkeletonLoader.jsx
│   │   │       └── EmptyState.jsx
│   │   │
│   │   └── assets/
│   │       └── css/
│   │           ├── globals.css
│   │           └── style.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── Resources_tf/                     # ML development notebooks
│   └── stock_prediction_using_LSTM.ipynb
│
├── docs/                             # Documentation
│   ├── es/                           # Spanish
│   └── en/                           # English
│
└── env/                              # Python virtual environment
```

---

## 🔄 Data Flow

### 1. Authentication Flow

```
┌──────────┐      POST /register/       ┌──────────┐
│   User   │ ─────────────────────────▶ │ Backend  │
│          │                            │          │
│          │ ◀───────────────────────── │          │
└──────────┘      { success: true }     └──────────┘

┌──────────┐      POST /token/          ┌──────────┐
│   User   │ ─────────────────────────▶ │ Backend  │
│          │   { username, password }   │          │
│          │                            │          │
│          │ ◀───────────────────────── │          │
└──────────┘   { access, refresh }      └──────────┘
                     │
                     ▼
            localStorage.setItem()
```

### 2. Prediction Flow

```
┌──────────┐      POST /predict/        ┌──────────┐
│Dashboard │ ─────────────────────────▶ │  Views   │
│          │   { ticker: "AAPL" }       │          │
└──────────┘                            └────┬─────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
           ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
           │  DataPipeline  │      │   MLManager    │      │ PredictionEngine│
           │                │      │   (Singleton)  │      │                │
           │ yf.download()  │      │   get_model()  │      │ predict_future()│
           └────────────────┘      └────────────────┘      └────────────────┘
                    │                        │                        │
                    │                        ▼                        │
                    │               ┌────────────────┐                │
                    │               │   LSTM Model   │                │
                    │               │    .predict()  │                │
                    │               └────────────────┘                │
                    │                        │                        │
                    └────────────────────────┼────────────────────────┘
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │    Response    │
                                    │  { backtesting │
                                    │    metrics,    │
                                    │    predictions}│
                                    └────────────────┘
```

---

## 🧩 Main Components

### Backend

#### 1. `MLModelManager` (Singleton Pattern)

```python
# Purpose: Load model once and cache in memory
class MLModelManager:
    _instance = None
    _lock = threading.Lock()
    _model = None
    
    @classmethod
    def get_instance(cls):
        # Thread-safe lazy initialization
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance
    
    def get_model(self):
        # Load model only if not cached
        if self._model is None:
            self._model = load_model('stock_prediction_model.keras')
        return self._model
```

**Benefits:**
- Eliminates repetitive I/O (~2-3s per request)
- Thread-safe for concurrent requests
- Single model instance in memory

#### 2. `DataPipeline`

```python
# Main functions:
def download_stock_data(ticker, years=10):
    """Download data from Yahoo Finance"""
    
def prepare_backtesting_data(close_prices, train_ratio=0.7):
    """Split data into train/test without data leakage"""
    
def create_sequences(data, sequence_length=100):
    """Create sequences for LSTM"""
```

#### 3. `FuturePredictionEngine`

```python
# Recursive prediction with Monte Carlo Dropout
def predict_future(historical_prices, horizon, confidence_level):
    """
    - Uses last 100 days as initial sequence
    - Predicts day 1, adds to sequence
    - Predicts day 2, adds to sequence
    - ... until horizon days
    - Calculates confidence intervals
    """
```

### Frontend

#### 1. `AuthProvider` (Context API)

```jsx
// Handles global authentication state
const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem('accessToken')
    );
    
    return (
        <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn}}>
            {children}
        </AuthContext.Provider>
    );
};
```

#### 2. `axiosInstance` (HTTP Client)

```javascript
// Interceptors for automatic JWT handling
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh token when expired
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response.status === 401) {
            // Refresh token and retry
        }
    }
);
```

---

## 🔐 Security

### JWT Authentication

```
┌─────────────────────────────────────────────────────────────┐
│                    JWT Token Flow                            │
│                                                              │
│  1. Successful login → Backend generates access + refresh   │
│  2. Frontend stores tokens in localStorage                   │
│  3. Each request includes: Authorization: Bearer <access>   │
│  4. Access token expires (15 min)                           │
│  5. Frontend uses refresh token to get new access           │
│  6. If refresh expires → Automatic logout                   │
└─────────────────────────────────────────────────────────────┘
```

### JWT Configuration (settings.py)

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

---

## 📊 Database

### Data Model (Auth)

```
┌─────────────────────────────────────┐
│              User                    │
├─────────────────────────────────────┤
│ id          │ INTEGER (PK)          │
│ username    │ VARCHAR(150)          │
│ email       │ VARCHAR(254)          │
│ password    │ VARCHAR(128) (hashed) │
│ date_joined │ DATETIME              │
│ last_login  │ DATETIME              │
└─────────────────────────────────────┘
```

> 📝 **Note**: Stock data is not stored. It's fetched in real-time from Yahoo Finance.

---

## 🔜 Next Step

Check the [Machine Learning Methodology](ML_METHODOLOGY.md) to understand how the LSTM model works.
