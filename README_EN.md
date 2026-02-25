# 🧠 NeuroStock - Stock Prediction Platform

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![Django](https://img.shields.io/badge/Django-5.2-green?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras-FF6F00?style=for-the-badge&logo=tensorflow)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Stock price prediction platform using LSTM neural networks and Machine Learning**

🌐 **[Versión en Español](README.md)**

[Features](#-features) •
[Architecture](#-architecture) •
[Installation](#-installation) •
[API](#-api-endpoints) •
[ML Model](#-machine-learning-model)

</div>

---

## 📚 Detailed Documentation

| Document | Description |
|----------|-------------|
| 📥 **[Installation Guide](docs/en/INSTALLATION.md)** | Complete step-by-step setup |
| 🏗️ **[Architecture](docs/en/ARCHITECTURE.md)** | Project structure and data flow |
| 🧠 **[ML Methodology](docs/en/ML_METHODOLOGY.md)** | Detailed LSTM model and training explanation |
| 📡 **[API Reference](docs/en/API.md)** | Complete endpoints documentation |

---

## 📖 Description

**NeuroStock** is a full-stack web application designed to predict stock market prices using advanced Machine Learning techniques. The system employs LSTM (Long Short-Term Memory) neural networks trained with historical data from Yahoo Finance (yfinance) to perform:

- **Backtesting**: Model evaluation with historical test data
- **Future Predictions**: Recursive forecasts with confidence intervals

The project implements ML best practices such as data leakage prevention, uncertainty quantification via Monte Carlo Dropout, and a singleton cache system to optimize performance.

---

## ✨ Features

### 🎯 Stock Prediction
- Support for any market ticker (AAPL, TSLA, GOOGL, AMZN, etc.)
- Analysis of up to 10 years of historical data
- Predictions from 1 to 365 days into the future
- Configurable confidence intervals (80% - 99%)

### 📊 Data Visualization
- Interactive charts with Chart.js
- Historical and predicted prices
- 100 and 200-day moving averages
- Uncertainty bands for future predictions

### 📈 Evaluation Metrics
- **MSE** (Mean Squared Error)
- **RMSE** (Root Mean Squared Error)
- **R²** (R-Squared): Coefficient of determination

### 🔐 Secure Authentication
- User registration with encrypted passwords
- JWT (JSON Web Tokens) system with refresh tokens
- Protected and public routes
- Axios interceptors for automatic token handling

### 🚀 Optimized Performance
- Singleton pattern for ML model management
- In-memory LSTM model cache
- Thread-safe for concurrent requests

---

## 🏗 Architecture

```
NeuroStock/
├── backend-drf/                 # Django REST Framework Backend
│   ├── api/                     # Main predictions app
│   │   ├── views.py             # Prediction endpoints
│   │   ├── data_pipeline.py     # Data download and preparation
│   │   ├── prediction_engine.py # Future predictions engine
│   │   ├── ml_manager.py        # Singleton for model management
│   │   ├── serializers.py       # Request validation
│   │   └── urls.py              # API routes
│   ├── accounts/                # Authentication app
│   │   ├── views.py             # Registration and login
│   │   └── serializers.py       # User serialization
│   ├── stock_prediction_main/   # Django configuration
│   │   └── settings.py          # Project settings
│   └── stock_prediction_model.keras  # Trained LSTM model
│
├── frontend-react/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Predictions panel
│   │   │   ├── Charts/          # Chart.js charts
│   │   │   ├── Login/           # Login component
│   │   │   ├── Register/        # Registration component
│   │   │   ├── Layout/          # Header and Footer
│   │   │   ├── Hooks/           # AuthProvider
│   │   │   └── ui/              # Reusable UI components
│   │   ├── App.jsx              # Main routes
│   │   └── axiosInstance.js     # HTTP configuration
│   └── package.json
│
├── docs/                        # Documentation
│   ├── es/                      # Spanish
│   └── en/                      # English
│
├── Resources_tf/                # Development notebooks
│   └── stock_prediction_using_LSTM.ipynb
│
└── env/                         # Python virtual environment
```

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Use |
|------------|---------|-----|
| Python | 3.12 | Main language |
| Django | 5.2 | Web framework |
| Django REST Framework | 3.16 | REST API |
| TensorFlow/Keras | 3.10 | LSTM Model |
| yfinance | - | Market data |
| scikit-learn | - | Preprocessing |
| NumPy/Pandas | - | Data manipulation |
| SimpleJWT | 5.5 | JWT Authentication |

### Frontend
| Technology | Version | Use |
|------------|---------|-----|
| React | 19.0 | UI Framework |
| Vite | - | Build tool |
| Chart.js | 4.5 | Charts |
| Axios | 1.9 | HTTP client |
| TailwindCSS | - | Styles |
| Radix UI | - | Components |
| React Router | 7.5 | Navigation |
| React Hook Form | 7.56 | Forms |

---

## 📦 Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/neurostock.git
cd neurostock
```

### 2. Configure Backend

```bash
# Create virtual environment
python -m venv env

# Activate virtual environment
# Windows:
.\env\Scripts\Activate.ps1
# Linux/Mac:
source env/bin/activate

# Install dependencies
cd backend-drf
pip install -r requirements.txt

# Create .env file
echo "SECRET_KEY=your-secret-key-here" > .env
echo "DEBUG=True" >> .env

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### 3. Configure Frontend

```bash
cd frontend-react

# Install dependencies
npm install

# Create .env file
echo "VITE_BACKEND_BASE_API=http://127.0.0.1:8000/api/v1" > .env

# Start development server
npm run dev
```

> 📖 For detailed instructions, see the [Installation Guide](docs/en/INSTALLATION.md)

---

## 🚀 Usage

### 1. Access the application
- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000/api/v1/`

### 2. User flow
1. **Register** with username, email and password
2. **Login** to get access
3. **Dashboard**: 
   - Enter a ticker (e.g., AAPL, TSLA)
   - View automatic backtesting analysis
   - Configure future prediction days (1-365)
   - Analyze metrics and charts

### 3. Usage example
```
1. Ticker: AAPL
2. System downloads 10 years of historical data
3. 70% training / 30% testing split
4. Backtesting with metrics (MSE, RMSE, R²)
5. Future prediction with confidence intervals
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/register/` | User registration |
| POST | `/api/v1/token/` | Get JWT tokens |
| POST | `/api/v1/token/refresh/` | Renew access token |
| GET | `/api/v1/protected-view/` | Verify authentication |

### Predictions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/predict/` | Perform prediction |

#### Request Body - Prediction
```json
{
    "ticker": "AAPL",
    "future_days": 30,
    "confidence_level": 0.95
}
```

#### Response - Prediction
```json
{
    "status": "success",
    "ticker": "AAPL",
    "historical_data": {
        "dates": ["2015-01-02", "..."],
        "close_prices": [27.33, "..."]
    },
    "ma_data": {
        "ma100": [0, "...", 28.5],
        "ma200": [0, "...", 29.1]
    },
    "backtesting": {
        "test_dates": ["2023-01-03", "..."],
        "test_prices": [125.07, "..."],
        "predicted_prices": [124.89, "..."],
        "metrics": {
            "mse": 12.45,
            "rmse": 3.53,
            "r2": 0.9876
        }
    },
    "future_predictions": {
        "dates": ["2026-02-25", "..."],
        "predicted_prices": [185.23, "..."],
        "lower_bound": [180.12, "..."],
        "upper_bound": [190.34, "..."],
        "uncertainty": [2.54, "..."],
        "confidence_level": 0.95
    }
}
```

> 📖 For complete API documentation, see [API Reference](docs/en/API.md)

---

## 🤖 Machine Learning Model

### LSTM Architecture

The model uses an LSTM (Long Short-Term Memory) neural network optimized for time series:

```
┌─────────────────────────────────────────┐
│            Input Layer                   │
│         (100 timesteps, 1 feature)       │
├─────────────────────────────────────────┤
│          LSTM Layer 1                    │
│    (128 units, tanh, return_sequences)   │
├─────────────────────────────────────────┤
│          LSTM Layer 2                    │
│          (64 units, tanh)                │
├─────────────────────────────────────────┤
│          Dense Layer                     │
│            (25 units)                    │
├─────────────────────────────────────────┤
│          Output Layer                    │
│            (1 unit)                      │
└─────────────────────────────────────────┘
```

### Model Specifications

| Parameter | Value |
|-----------|-------|
| Input sequence | 100 days |
| LSTM layers | 2 (128 + 64 units) |
| Activation function | tanh |
| Optimizer | Adam |
| Loss function | Mean Squared Error |
| Training epochs | 50 |
| Normalization | MinMaxScaler (0, 1) |

### Data Leakage Prevention

The system implements strict separation between training and testing data:

```python
# ✅ CORRECT: Scaler fitted ONLY on training data
train_scaler = MinMaxScaler(feature_range=(0, 1))
train_scaler.fit(data_split['train'].values.reshape(-1, 1))

# ✅ Transform test data with training scaler
test_scaled = train_scaler.transform(test_data)
```

### Uncertainty Quantification

**Monte Carlo Dropout** is used to estimate prediction uncertainty:

- 50 Monte Carlo iterations per prediction
- Growing uncertainty factor (+2% per day)
- Configurable confidence intervals (80%, 95%, 99%)

> 📖 For complete methodology, see [ML Methodology](docs/en/ML_METHODOLOGY.md)

---

## 📈 Roadmap

- [ ] Support for multiple models (GRU, Transformer)
- [ ] Multiple stock comparison
- [ ] News sentiment analysis
- [ ] Prediction alerts via email
- [ ] Portfolio tracker
- [ ] Dark/light mode
- [ ] PWA (Progressive Web App)
- [ ] Docker deployment

---

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add: AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is under the MIT License. See the `LICENSE` file for details.

---

## 👤 Author

**Cristian** - Full-Stack Development & Machine Learning

---

## ⚠️ Disclaimer

> **LEGAL NOTICE**: This project is exclusively for educational and learning purposes. 
> The predictions generated by the model do NOT constitute financial advice. 
> Stock trading carries significant risks of capital loss. 
> Never invest money you cannot afford to lose based on algorithmic predictions.

---

<div align="center">

Made with ❤️ using Python, React and TensorFlow

**[⬆ Back to top](#-neurostock---stock-prediction-platform)**

</div>
