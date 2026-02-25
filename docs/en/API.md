# 📡 API Documentation

This document describes all available endpoints in the NeuroStock REST API.

---

## 📋 General Information

| Property | Value |
|----------|-------|
| Base URL | `http://127.0.0.1:8000/api/v1/` |
| Format | JSON |
| Authentication | JWT (Bearer Token) |
| Content-Type | `application/json` |

---

## 🔐 Authentication

NeuroStock uses **JWT (JSON Web Tokens)** for authentication.

### Authentication Flow

```
1. POST /register/     → Create account
2. POST /token/        → Get access + refresh tokens
3. Use access token    → Authorization: Bearer <token>
4. Token expires       → POST /token/refresh/ to renew
```

### Required Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

---

## 📝 Endpoints

### Authentication

#### POST `/register/`

Registers a new user.

**Request Body:**
```json
{
    "username": "user123",
    "email": "user@email.com",
    "password": "secure_password"
}
```

**Validations:**
- `username`: Required, unique
- `email`: Valid email format
- `password`: Minimum 8 characters

**Response (201 Created):**
```json
{
    "username": "user123",
    "email": "user@email.com"
}
```

**Errors:**
```json
// 400 Bad Request
{
    "username": ["A user with that username already exists."],
    "password": ["This password is too short."]
}
```

---

#### POST `/token/`

Gets access and refresh tokens.

**Request Body:**
```json
{
    "username": "user123",
    "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
```json
// 401 Unauthorized
{
    "detail": "No active account found with the given credentials"
}
```

**Token Duration:**
| Token | Duration |
|-------|----------|
| Access | 15 minutes |
| Refresh | 7 days |

---

#### POST `/token/refresh/`

Renews the access token using the refresh token.

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

**Errors:**
```json
// 401 Unauthorized
{
    "detail": "Token is invalid or expired",
    "code": "token_not_valid"
}
```

---

#### GET `/protected-view/`

Test endpoint to verify authentication.

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

**Errors:**
```json
// 401 Unauthorized
{
    "detail": "Authentication credentials were not provided."
}
```

---

### Predictions

#### POST `/predict/`

Performs stock price prediction.

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

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ticker` | string | ✅ | - | Ticker symbol (e.g., AAPL, TSLA, MSFT) |
| `future_days` | integer | ❌ | 0 | Days to predict (0-365). 0 = backtesting only |
| `confidence_level` | float | ❌ | 0.95 | Confidence level for intervals (0.80-0.99) |

---

### Complete Response (200 OK)

#### General Structure

```json
{
    "status": "success",
    "ticker": "AAPL",
    "historical_data": { ... },
    "ma_data": { ... },
    "backtesting": { ... },
    "future_predictions": { ... }  // Only if future_days > 0
}
```

---

#### `historical_data` - Historical Data

10 years of closing prices.

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

| Field | Type | Description |
|-------|------|-------------|
| `dates` | string[] | Dates in YYYY-MM-DD format |
| `close_prices` | number[] | Closing prices (rounded to 2 decimals) |

---

#### `ma_data` - Moving Averages

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

| Field | Type | Description |
|-------|------|-------------|
| `ma100` | number[] | 100-day moving average (0 for first 99 days) |
| `ma200` | number[] | 200-day moving average (0 for first 199 days) |

---

#### `backtesting` - Backtesting Results

Predictions on reserved historical data (30% of dataset).

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

| Field | Type | Description |
|-------|------|-------------|
| `test_dates` | string[] | Test period dates |
| `test_prices` | number[] | Actual prices during test period |
| `predicted_prices` | number[] | Model predicted prices |
| `metrics.mse` | number | Mean Squared Error |
| `metrics.rmse` | number | Root Mean Squared Error (in $) |
| `metrics.r2` | number | R-squared (coefficient of determination) |

**Metrics Interpretation:**

| Metric | Good Value | Interpretation |
|--------|------------|----------------|
| MSE | < 20 | Low mean squared error |
| RMSE | < $5 | Average error less than $5 |
| R² | > 0.95 | Model explains >95% of variability |

---

#### `future_predictions` - Future Predictions

Only present if `future_days > 0`.

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
        "warning": "Predictions beyond 60 days have high uncertainty. Use with caution."
    }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `dates` | string[] | Future dates (trading days only, excludes weekends) |
| `predicted_prices` | number[] | Predicted prices |
| `lower_bound` | number[] | Lower confidence interval bound |
| `upper_bound` | number[] | Upper confidence interval bound |
| `uncertainty` | number[] | Prediction standard deviation |
| `confidence_level` | number | Confidence level used |
| `warning` | string | Warning for long horizons (>60 days) |

---

### Errors

#### 400 Bad Request - Validation

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

#### 404 Not Found - Invalid Ticker

```json
{
    "error": "Ticker 'INVALID' not found or no data available. Verify ticker symbol is correct (e.g., AAPL, TSLA, MSFT)."
}
```

#### 404 Not Found - Insufficient Data

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

## 💻 Usage Examples

### cURL

#### Register
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

#### Prediction
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

// Prediction
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

# Prediction
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

## 📊 HTTP Status Codes

| Code | Meaning | When it occurs |
|------|---------|----------------|
| 200 | OK | Successful request |
| 201 | Created | User registered successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid or expired token |
| 404 | Not Found | Ticker not found |
| 500 | Internal Server Error | Server error |

---

## 🔒 Limits and Restrictions

| Restriction | Value | Reason |
|-------------|-------|--------|
| Maximum `future_days` | 365 | Accuracy decreases over time |
| Minimum `future_days` | 0 | Backtesting only |
| Range `confidence_level` | 0.80 - 0.99 | Valid statistical intervals |
| Minimum data | 200 days | Required for LSTM sequences |
| LSTM window | 100 days | Model configuration |

---

## 🔜 Next Step

Return to the [Installation Guide](INSTALLATION.md) or the [main README](../../README_EN.md).
