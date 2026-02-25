# 🧠 NeuroStock - Stock Prediction Platform

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![Django](https://img.shields.io/badge/Django-5.2-green?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras-FF6F00?style=for-the-badge&logo=tensorflow)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Plataforma de predicción de precios de acciones utilizando redes neuronales LSTM y Machine Learning**

🌐 **[English Version](README_EN.md)**

[Características](#-características) •
[Arquitectura](#-arquitectura) •
[Instalación](#-instalación) •
[API](#-api-endpoints) •
[Modelo ML](#-modelo-de-machine-learning)

</div>

---

## 📚 Documentación Detallada

| Documento | Descripción |
|-----------|-------------|
| 📥 **[Guía de Instalación](docs/es/INSTALLATION.md)** | Configuración completa paso a paso |
| 🏗️ **[Arquitectura](docs/es/ARCHITECTURE.md)** | Estructura del proyecto y flujo de datos |
| 🧠 **[Metodología ML](docs/es/ML_METHODOLOGY.md)** | Explicación detallada del modelo LSTM y entrenamiento |
| 📡 **[API Reference](docs/es/API.md)** | Documentación completa de endpoints |

---

## 📖 Descripción

**NeuroStock** es una aplicación web full-stack diseñada para predecir precios de acciones del mercado financiero utilizando técnicas avanzadas de Machine Learning. El sistema emplea redes neuronales LSTM (Long Short-Term Memory) entrenadas con datos históricos obtenidos de Yahoo Finance (yfinance) para realizar:

- **Backtesting**: Evaluación del modelo con datos históricos de prueba
- **Predicciones Futuras**: Pronósticos recursivos con intervalos de confianza

El proyecto implementa buenas prácticas de ML como la prevención de data leakage, cuantificación de incertidumbre mediante Monte Carlo Dropout, y un sistema de caché singleton para optimizar el rendimiento.

---

## ✨ Características

### 🎯 Predicción de Acciones
- Soporte para cualquier ticker del mercado (AAPL, TSLA, GOOGL, AMZN, etc.)
- Análisis de hasta 10 años de datos históricos
- Predicciones de 1 a 365 días en el futuro
- Intervalos de confianza configurables (80% - 99%)

### 📊 Visualización de Datos
- Gráficos interactivos con Chart.js
- Precios históricos y predichos
- Medias móviles de 100 y 200 días
- Bandas de incertidumbre para predicciones futuras

### 📈 Métricas de Evaluación
- **MSE** (Mean Squared Error): Error cuadrático medio
- **RMSE** (Root Mean Squared Error): Raíz del error cuadrático medio
- **R²** (R-Squared): Coeficiente de determinación

### 🔐 Autenticación Segura
- Registro de usuarios con contraseñas encriptadas
- Sistema JWT (JSON Web Tokens) con refresh tokens
- Rutas protegidas y públicas
- Interceptores de Axios para manejo automático de tokens

### 🚀 Rendimiento Optimizado
- Patrón Singleton para gestión del modelo ML
- Caché en memoria del modelo LSTM
- Thread-safe para peticiones concurrentes

---

## 🏗 Arquitectura

```
NeuroStock/
├── backend-drf/                 # Backend Django REST Framework
│   ├── api/                     # App principal de predicciones
│   │   ├── views.py             # Endpoints de predicción
│   │   ├── data_pipeline.py     # Descarga y preparación de datos
│   │   ├── prediction_engine.py # Motor de predicciones futuras
│   │   ├── ml_manager.py        # Singleton para gestión del modelo
│   │   ├── serializers.py       # Validación de requests
│   │   └── urls.py              # Rutas de la API
│   ├── accounts/                # App de autenticación
│   │   ├── views.py             # Registro y login
│   │   └── serializers.py       # Serialización de usuarios
│   ├── stock_prediction_main/   # Configuración Django
│   │   └── settings.py          # Settings del proyecto
│   └── stock_prediction_model.keras  # Modelo LSTM entrenado
│
├── frontend-react/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Panel de predicciones
│   │   │   ├── Charts/          # Gráficos con Chart.js
│   │   │   ├── Login/           # Componente de login
│   │   │   ├── Register/        # Componente de registro
│   │   │   ├── Layout/          # Header y Footer
│   │   │   ├── Hooks/           # AuthProvider
│   │   │   └── ui/              # Componentes UI reutilizables
│   │   ├── App.jsx              # Rutas principales
│   │   └── axiosInstance.js     # Configuración HTTP
│   └── package.json
│
├── Resources_tf/                # Notebooks de desarrollo
│   └── stock_prediction_using_LSTM.ipynb
│
└── env/                         # Entorno virtual Python
```

---

## 🛠 Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Python | 3.12 | Lenguaje principal |
| Django | 5.2 | Framework web |
| Django REST Framework | 3.16 | API REST |
| TensorFlow/Keras | 3.10 | Modelo LSTM |
| yfinance | - | Datos de mercado |
| scikit-learn | - | Preprocesamiento |
| NumPy/Pandas | - | Manipulación de datos |
| SimpleJWT | 5.5 | Autenticación JWT |

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.0 | Framework UI |
| Vite | - | Build tool |
| Chart.js | 4.5 | Gráficos |
| Axios | 1.9 | HTTP client |
| TailwindCSS | - | Estilos |
| Radix UI | - | Componentes |
| React Router | 7.5 | Navegación |
| React Hook Form | 7.56 | Formularios |

---

## 📦 Instalación

### Prerrequisitos
- Python 3.12+
- Node.js 18+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/neurostock.git
cd neurostock
```

### 2. Configurar Backend

```bash
# Crear entorno virtual
python -m venv env

# Activar entorno virtual
# Windows:
.\env\Scripts\Activate.ps1
# Linux/Mac:
source env/bin/activate

# Instalar dependencias
cd backend-drf
pip install -r requirements.txt

# Crear archivo .env
echo "SECRET_KEY=tu-clave-secreta-aqui" > .env
echo "DEBUG=True" >> .env

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

### 3. Configurar Frontend

```bash
cd frontend-react

# Instalar dependencias
npm install

# Crear archivo .env
echo "VITE_BACKEND_BASE_API=http://127.0.0.1:8000/api/v1" > .env

# Iniciar servidor de desarrollo
npm run dev
```

---

## 🚀 Uso

### 1. Acceder a la aplicación
- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000/api/v1/`

### 2. Flujo de usuario
1. **Registrarse** con username, email y contraseña
2. **Iniciar sesión** para obtener acceso
3. **Dashboard**: 
   - Ingresar un ticker (ej: AAPL, TSLA)
   - Ver análisis de backtesting automático
   - Configurar días de predicción futura (1-365)
   - Analizar métricas y gráficos

### 3. Ejemplo de uso
```
1. Ticker: AAPL
2. Sistema descarga 10 años de datos históricos
3. División 70% training / 30% testing
4. Backtesting con métricas (MSE, RMSE, R²)
5. Predicción futura con intervalos de confianza
```

---

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/register/` | Registro de usuario |
| POST | `/api/v1/token/` | Obtener tokens JWT |
| POST | `/api/v1/token/refresh/` | Renovar access token |
| GET | `/api/v1/protected-view/` | Verificar autenticación |

### Predicciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/predict/` | Realizar predicción |

#### Request Body - Predicción
```json
{
    "ticker": "AAPL",
    "future_days": 30,
    "confidence_level": 0.95
}
```

#### Response - Predicción
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

---

## 🤖 Modelo de Machine Learning

### Arquitectura LSTM

El modelo utiliza una red neuronal LSTM (Long Short-Term Memory) optimizada para series temporales:

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

### Especificaciones del Modelo

| Parámetro | Valor |
|-----------|-------|
| Secuencia de entrada | 100 días |
| Capas LSTM | 2 (128 + 64 unidades) |
| Función de activación | tanh |
| Optimizador | Adam |
| Función de pérdida | Mean Squared Error |
| Épocas de entrenamiento | 50 |
| Normalización | MinMaxScaler (0, 1) |

### Prevención de Data Leakage

El sistema implementa una separación estricta entre datos de entrenamiento y prueba:

```python
# ✅ CORRECTO: Scaler ajustado SOLO en datos de entrenamiento
train_scaler = MinMaxScaler(feature_range=(0, 1))
train_scaler.fit(data_split['train'].values.reshape(-1, 1))

# ✅ Transformar test data con el scaler de training
test_scaled = train_scaler.transform(test_data)
```

### Cuantificación de Incertidumbre

Se utiliza **Monte Carlo Dropout** para estimar la incertidumbre en las predicciones:

- 50 iteraciones de Monte Carlo por predicción
- Factor de incertidumbre creciente (+2% por día)
- Intervalos de confianza configurables (80%, 95%, 99%)

---

## 📊 Visualizaciones

### Dashboard Principal
- **Gráfico de Precios Históricos**: 10 años de datos con medias móviles
- **Gráfico de Backtesting**: Precios reales vs predichos
- **Gráfico de Predicción Futura**: Pronóstico con bandas de confianza
- **Tarjetas de Métricas**: MSE, RMSE, R² en tiempo real

---

## 🔧 Configuración Avanzada

### Variables de Entorno - Backend (.env)
```env
SECRET_KEY=tu-clave-secreta-super-segura
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Variables de Entorno - Frontend (.env)
```env
VITE_BACKEND_BASE_API=http://127.0.0.1:8000/api/v1
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

## 🧪 Testing

### Backend
```bash
cd backend-drf
python manage.py test
```

### Frontend
```bash
cd frontend-react
npm run lint
```

---

## 📈 Roadmap

- [ ] Soporte para múltiples modelos (GRU, Transformer)
- [ ] Comparación de múltiples acciones
- [ ] Análisis de sentimiento de noticias
- [ ] Alertas de predicción por email
- [ ] Portfolio tracker
- [ ] Modo oscuro/claro
- [ ] PWA (Progressive Web App)
- [ ] Despliegue en Docker

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👤 Autor

**Cristian** - Desarrollo Full-Stack & Machine Learning

---

## ⚠️ Disclaimer

> **AVISO LEGAL**: Este proyecto es exclusivamente con fines educativos y de aprendizaje. 
> Las predicciones generadas por el modelo NO constituyen asesoramiento financiero. 
> El trading de acciones conlleva riesgos significativos de pérdida de capital. 
> Nunca invierta dinero que no pueda permitirse perder basándose en predicciones algorítmicas.

---

<div align="center">

Hecho con ❤️ usando Python, React y TensorFlow

</div>
