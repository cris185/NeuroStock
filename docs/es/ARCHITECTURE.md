# 🏗️ Arquitectura del Proyecto

Este documento describe la arquitectura técnica de NeuroStock, explicando cómo se comunican los diferentes componentes del sistema.

---

## 📐 Visión General

NeuroStock sigue una arquitectura **cliente-servidor** con separación clara entre frontend y backend:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                     │
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
│                              SERVIDOR                                    │
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

## 📁 Estructura de Directorios

```
NeuroStock/
│
├── backend-drf/                      # Backend Django REST Framework
│   │
│   ├── api/                          # App principal - Predicciones
│   │   ├── __init__.py
│   │   ├── views.py                  # Endpoints: StockPredictionAPIView
│   │   ├── urls.py                   # Rutas de la API
│   │   ├── serializers.py            # Validación de datos de entrada
│   │   ├── data_pipeline.py          # Descarga y preparación de datos
│   │   ├── ml_manager.py             # Singleton para gestión del modelo
│   │   ├── prediction_engine.py      # Motor de predicciones futuras
│   │   └── migrations/               # Migraciones de base de datos
│   │
│   ├── accounts/                     # App de autenticación
│   │   ├── __init__.py
│   │   ├── views.py                  # RegisterView, ProtectedView
│   │   ├── serializers.py            # UserSerializer
│   │   └── migrations/
│   │
│   ├── stock_prediction_main/        # Configuración del proyecto Django
│   │   ├── __init__.py
│   │   ├── settings.py               # Configuración principal
│   │   ├── urls.py                   # URL raíz
│   │   ├── wsgi.py                   # Producción WSGI
│   │   └── asgi.py                   # Async support
│   │
│   ├── stock_prediction_model.keras  # Modelo LSTM pre-entrenado
│   ├── manage.py                     # CLI de Django
│   ├── requirements.txt              # Dependencias Python
│   └── db.sqlite3                    # Base de datos SQLite
│
├── frontend-react/                   # Frontend React + Vite
│   │
│   ├── src/
│   │   ├── App.jsx                   # Componente raíz y rutas
│   │   ├── main.jsx                  # Entry point
│   │   ├── PrivateRoute.jsx          # Rutas protegidas
│   │   ├── PublicRoute.jsx           # Rutas públicas
│   │   │
│   │   ├── components/
│   │   │   ├── Main.jsx              # Landing page
│   │   │   ├── axiosInstance.js      # Cliente HTTP configurado
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx     # Panel principal de predicciones
│   │   │   │
│   │   │   ├── Charts/
│   │   │   │   └── StockChart.jsx    # Componente de gráficos
│   │   │   │
│   │   │   ├── Login/
│   │   │   │   └── Login.jsx         # Formulario de login
│   │   │   │
│   │   │   ├── Register/
│   │   │   │   ├── Register.jsx      # Página de registro
│   │   │   │   └── RegisterForm.jsx  # Formulario de registro
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx        # Navegación
│   │   │   │   └── Footer.jsx        # Pie de página
│   │   │   │
│   │   │   ├── Hooks/
│   │   │   │   └── AuthProvider.jsx  # Contexto de autenticación
│   │   │   │
│   │   │   └── ui/                   # Componentes UI reutilizables
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
├── Resources_tf/                     # Notebooks de desarrollo ML
│   └── stock_prediction_using_LSTM.ipynb
│
├── docs/                             # Documentación
│   ├── es/                           # Español
│   └── en/                           # English
│
└── env/                              # Entorno virtual Python
```

---

## 🔄 Flujo de Datos

### 1. Flujo de Autenticación

```
┌──────────┐      POST /register/       ┌──────────┐
│  Usuario │ ─────────────────────────▶ │ Backend  │
│          │                            │          │
│          │ ◀───────────────────────── │          │
└──────────┘      { success: true }     └──────────┘

┌──────────┐      POST /token/          ┌──────────┐
│  Usuario │ ─────────────────────────▶ │ Backend  │
│          │   { username, password }   │          │
│          │                            │          │
│          │ ◀───────────────────────── │          │
└──────────┘   { access, refresh }      └──────────┘
                     │
                     ▼
            localStorage.setItem()
```

### 2. Flujo de Predicción

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

## 🧩 Componentes Principales

### Backend

#### 1. `MLModelManager` (Patrón Singleton)

```python
# Propósito: Cargar modelo una sola vez y cachear en memoria
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
        # Cargar modelo solo si no está en caché
        if self._model is None:
            self._model = load_model('stock_prediction_model.keras')
        return self._model
```

**Beneficios:**
- Elimina I/O repetitivo (~2-3s por request)
- Thread-safe para requests concurrentes
- Una sola instancia del modelo en memoria

#### 2. `DataPipeline`

```python
# Funciones principales:
def download_stock_data(ticker, years=10):
    """Descarga datos de Yahoo Finance"""
    
def prepare_backtesting_data(close_prices, train_ratio=0.7):
    """Divide datos en train/test sin data leakage"""
    
def create_sequences(data, sequence_length=100):
    """Crea secuencias para LSTM"""
```

#### 3. `FuturePredictionEngine`

```python
# Predicción recursiva con Monte Carlo Dropout
def predict_future(historical_prices, horizon, confidence_level):
    """
    - Usa últimos 100 días como secuencia inicial
    - Predice día 1, añade a secuencia
    - Predice día 2, añade a secuencia
    - ... hasta horizon días
    - Calcula intervalos de confianza
    """
```

### Frontend

#### 1. `AuthProvider` (Context API)

```jsx
// Maneja estado de autenticación global
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
// Interceptores para manejo automático de JWT
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh del token cuando expira
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response.status === 401) {
            // Refresh token y reintentar
        }
    }
);
```

---

## 🔐 Seguridad

### Autenticación JWT

```
┌─────────────────────────────────────────────────────────────┐
│                    JWT Token Flow                            │
│                                                              │
│  1. Login exitoso → Backend genera access + refresh tokens   │
│  2. Frontend almacena tokens en localStorage                 │
│  3. Cada request incluye: Authorization: Bearer <access>    │
│  4. Access token expira (15 min)                            │
│  5. Frontend usa refresh token para obtener nuevo access     │
│  6. Si refresh expira → Logout automático                   │
└─────────────────────────────────────────────────────────────┘
```

### Configuración JWT (settings.py)

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

---

## 📊 Base de Datos

### Modelo de Datos (Auth)

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

> 📝 **Nota**: Los datos de acciones no se almacenan. Se obtienen en tiempo real de Yahoo Finance.

---

## 🔜 Siguiente Paso

Consulta la [Metodología de Machine Learning](ML_METHODOLOGY.md) para entender cómo funciona el modelo LSTM.
