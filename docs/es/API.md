# 📡 Documentación de la API

Este documento describe todos los endpoints disponibles en la API REST de NeuroStock.

---

## 📋 Información General

| Propiedad | Valor |
|-----------|-------|
| Base URL | `http://127.0.0.1:8000/api/v1/` |
| Formato | JSON |
| Autenticación | JWT (Bearer Token) |
| Content-Type | `application/json` |

---

## 🔐 Autenticación

NeuroStock utiliza **JWT (JSON Web Tokens)** para autenticación.

### Flujo de Autenticación

```
1. POST /register/     → Crear cuenta
2. POST /token/        → Obtener access + refresh tokens
3. Usar access token   → Authorization: Bearer <token>
4. Token expira        → POST /token/refresh/ para renovar
```

### Headers Requeridos

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

---

## 📝 Endpoints

### Autenticación

#### POST `/register/`

Registra un nuevo usuario.

**Request Body:**
```json
{
    "username": "usuario123",
    "email": "usuario@email.com",
    "password": "contraseña_segura"
}
```

**Validaciones:**
- `username`: Requerido, único
- `email`: Formato válido de email
- `password`: Mínimo 8 caracteres

**Response (201 Created):**
```json
{
    "username": "usuario123",
    "email": "usuario@email.com"
}
```

**Errores:**
```json
// 400 Bad Request
{
    "username": ["A user with that username already exists."],
    "password": ["This password is too short."]
}
```

---

#### POST `/token/`

Obtiene tokens de acceso y refresco.

**Request Body:**
```json
{
    "username": "usuario123",
    "password": "contraseña_segura"
}
```

**Response (200 OK):**
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
```json
// 401 Unauthorized
{
    "detail": "No active account found with the given credentials"
}
```

**Duración de Tokens:**
| Token | Duración |
|-------|----------|
| Access | 15 minutos |
| Refresh | 7 días |

---

#### POST `/token/refresh/`

Renueva el token de acceso usando el token de refresco.

**Request Body:**
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
```json
// 401 Unauthorized
{
    "detail": "Token is invalid or expired",
    "code": "token_not_valid"
}
```

---

#### GET `/protected-view/`

Endpoint de prueba para verificar autenticación.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "status": "Request was permitted"
}
```

**Errores:**
```json
// 401 Unauthorized
{
    "detail": "Authentication credentials were not provided."
}
```

---

### Predicciones

#### POST `/predict/`

Realiza predicción de precios de acciones.

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "ticker": "AAPL",
    "future_days": 30,
    "confidence_level": 0.95
}
```

**Parámetros:**

| Campo | Tipo | Requerido | Default | Descripción |
|-------|------|-----------|---------|-------------|
| `ticker` | string | ✅ | - | Símbolo del ticker (ej: AAPL, TSLA, MSFT) |
| `future_days` | integer | ❌ | 0 | Días a predecir (0-365). 0 = solo backtesting |
| `confidence_level` | float | ❌ | 0.95 | Nivel de confianza para intervalos (0.80-0.99) |

---

### Response Completo (200 OK)

#### Estructura General

```json
{
    "status": "success",
    "ticker": "AAPL",
    "historical_data": { ... },
    "ma_data": { ... },
    "backtesting": { ... },
    "future_predictions": { ... }  // Solo si future_days > 0
}
```

---

#### `historical_data` - Datos Históricos

10 años de precios de cierre.

```json
{
    "historical_data": {
        "dates": [
            "2015-02-24",
            "2015-02-25",
            "2015-02-26",
            ...
            "2026-02-24"
        ],
        "close_prices": [
            32.18,
            32.45,
            32.67,
            ...
             228.75
        ]
    }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `dates` | string[] | Fechas en formato YYYY-MM-DD |
| `close_prices` | number[] | Precios de cierre (redondeados a 2 decimales) |

---

#### `ma_data` - Medias Móviles

```json
{
    "ma_data": {
        "ma100": [
            0, 0, 0, ..., 30.25, 30.45, ...
        ],
        "ma200": [
            0, 0, 0, ..., 29.18, 29.35, ...
        ]
    }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ma100` | number[] | Media móvil de 100 días (0 para los primeros 99 días) |
| `ma200` | number[] | Media móvil de 200 días (0 para los primeros 199 días) |

---

#### `backtesting` - Resultados de Backtesting

Predicciones sobre datos históricos reservados (30% del dataset).

```json
{
    "backtesting": {
        "test_dates": [
            "2023-05-15",
            "2023-05-16",
            ...
            "2026-02-24"
        ],
        "test_prices": [
            167.45,
            168.23,
            ...
            228.75
        ],
        "predicted_prices": [
            166.89,
            167.95,
            ...
            229.12
        ],
        "metrics": {
            "mse": 12.45,
            "rmse": 3.53,
            "r2": 0.9876
        }
    }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `test_dates` | string[] | Fechas del período de prueba |
| `test_prices` | number[] | Precios reales durante el período de prueba |
| `predicted_prices` | number[] | Precios predichos por el modelo |
| `metrics.mse` | number | Mean Squared Error |
| `metrics.rmse` | number | Root Mean Squared Error (en $) |
| `metrics.r2` | number | R-squared (coeficiente de determinación) |

**Interpretación de Métricas:**

| Métrica | Valor Bueno | Interpretación |
|---------|-------------|----------------|
| MSE | < 20 | Error cuadrático medio bajo |
| RMSE | < $5 | Error promedio menor a $5 |
| R² | > 0.95 | El modelo explica >95% de variabilidad |

---

#### `future_predictions` - Predicciones Futuras

Solo presente si `future_days > 0`.

```json
{
    "future_predictions": {
        "dates": [
            "2026-02-25",
            "2026-02-26",
            "2026-02-27",
            ...
            "2026-04-08"
        ],
        "predicted_prices": [
            229.45,
            230.12,
            231.34,
            ...
            245.67
        ],
        "lower_bound": [
            224.32,
            223.89,
            222.45,
            ...
            201.23
        ],
        "upper_bound": [
            234.58,
            236.35,
            240.23,
            ...
            290.11
        ],
        "uncertainty": [
            2.54,
            3.12,
            4.45,
            ...
            22.34
        ],
        "confidence_level": 0.95,
        "warning": "Predicciones más allá de 60 días tienen alta incertidumbre. Use con precaución."
    }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `dates` | string[] | Fechas futuras (solo días de trading, excluye fines de semana) |
| `predicted_prices` | number[] | Precios predichos |
| `lower_bound` | number[] | Límite inferior del intervalo de confianza |
| `upper_bound` | number[] | Límite superior del intervalo de confianza |
| `uncertainty` | number[] | Desviación estándar de la predicción |
| `confidence_level` | number | Nivel de confianza utilizado |
| `warning` | string | Advertencia para horizontes largos (>60 días) |

---

### Errores

#### 400 Bad Request - Validación

```json
{
    "error": "Invalid input.",
    "details": {
        "ticker": ["This field is required."],
        "future_days": ["Ensure this value is less than or equal to 365."],
        "confidence_level": ["Ensure this value is greater than or equal to 0.8."]
    }
}
```

#### 404 Not Found - Ticker inválido

```json
{
    "error": "Ticker 'INVALID' not found or no data available. Verify ticker symbol is correct (e.g., AAPL, TSLA, MSFT)."
}
```

#### 404 Not Found - Datos insuficientes

```json
{
    "error": "Insufficient data for ticker 'XYZ': 150 days available, minimum 200 required (100 for LSTM sequence + training data)."
}
```

#### 500 Internal Server Error

```json
{
    "error": "Prediction failed: Failed to load model from stock_prediction_model.keras: [details]"
}
```

---

## 💻 Ejemplos de Uso

### cURL

#### Registro
```bash
curl -X POST http://127.0.0.1:8000/api/v1/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "email": "demo@test.com", "password": "password123"}'
```

#### Login
```bash
curl -X POST http://127.0.0.1:8000/api/v1/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "password123"}'
```

#### Predicción
```bash
curl -X POST http://127.0.0.1:8000/api/v1/predict/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"ticker": "AAPL", "future_days": 30}'
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1'
});

// Login
const login = async () => {
    const response = await api.post('/token/', {
        username: 'demo',
        password: 'password123'
    });
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
};

// Predicción
const predict = async (ticker, futureDays = 0) => {
    const token = localStorage.getItem('accessToken');
    const response = await api.post('/predict/', 
        { ticker, future_days: futureDays },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};
```

### Python (Requests)

```python
import requests

BASE_URL = 'http://127.0.0.1:8000/api/v1'

# Login
response = requests.post(f'{BASE_URL}/token/', json={
    'username': 'demo',
    'password': 'password123'
})
tokens = response.json()
access_token = tokens['access']

# Predicción
headers = {'Authorization': f'Bearer {access_token}'}
response = requests.post(f'{BASE_URL}/predict/', 
    json={'ticker': 'AAPL', 'future_days': 30},
    headers=headers
)
prediction = response.json()

print(f"MSE: {prediction['backtesting']['metrics']['mse']}")
print(f"R²: {prediction['backtesting']['metrics']['r2']}")
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Usuario registrado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 404 | Not Found | Ticker no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## 🔒 Límites y Restricciones

| Restricción | Valor | Motivo |
|-------------|-------|--------|
| Máximo `future_days` | 365 | Precisión disminuye con el tiempo |
| Mínimo `future_days` | 0 | Solo backtesting |
| Rango `confidence_level` | 0.80 - 0.99 | Intervalos estadísticos válidos |
| Datos mínimos | 200 días | Requerido para secuencias LSTM |
| Ventana LSTM | 100 días | Configuración del modelo |

---

## 🔜 Siguiente Paso

Volver a la [Guía de Instalación](INSTALLATION.md) o al [README principal](../../README.md).
