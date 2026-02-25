# 🧠 Metodología de Machine Learning

Este documento explica en detalle la metodología utilizada para construir, entrenar y evaluar el modelo LSTM de predicción de acciones. Se basa en el notebook `Resources_tf/stock_prediction_using_LSTM.ipynb`.

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Recolección de Datos](#2-recolección-de-datos)
3. [Exploración y Visualización](#3-exploración-y-visualización)
4. [Ingeniería de Features](#4-ingeniería-de-features)
5. [Preprocesamiento](#5-preprocesamiento)
6. [Creación de Secuencias](#6-creación-de-secuencias)
7. [Arquitectura del Modelo](#7-arquitectura-del-modelo)
8. [Entrenamiento](#8-entrenamiento)
9. [Evaluación](#9-evaluación)
10. [Predicción en Producción](#10-predicción-en-producción)

---

## 1. Visión General

### ¿Por qué LSTM?

Las redes **LSTM (Long Short-Term Memory)** son un tipo especial de red neuronal recurrente (RNN) diseñadas para aprender dependencias a largo plazo en secuencias de datos.

**Ventajas para series temporales financieras:**
- Capturan patrones temporales complejos
- Mantienen memoria de eventos pasados relevantes
- Manejan el problema del "vanishing gradient" de las RNN tradicionales

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Arquitectura LSTM                                 │
│                                                                          │
│   Input (t-100) ──▶ LSTM ──▶ LSTM ──▶ ... ──▶ LSTM ──▶ Output (t)      │
│                      │        │                 │                        │
│                      ▼        ▼                 ▼                        │
│                   Hidden   Hidden            Hidden                      │
│                    State    State             State                      │
│                                                                          │
│   "El modelo aprende qué información del pasado es relevante            │
│    para predecir el precio futuro"                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Recolección de Datos

### Fuente de Datos: Yahoo Finance

Utilizamos la librería `yfinance` para obtener datos históricos del mercado:

```python
import yfinance as yf
from datetime import datetime

# Configurar rango de 10 años
now = datetime.now()
start = datetime(now.year - 10, now.month, now.day)
end = now

# Descargar datos del ticker
ticker = 'AAPL'
df = yf.download(ticker, start, end)
```

### Estructura de los Datos

| Columna | Descripción |
|---------|-------------|
| Date | Fecha del trading (índice) |
| Open | Precio de apertura |
| High | Precio más alto del día |
| Low | Precio más bajo del día |
| **Close** | Precio de cierre (usado para predicción) |
| Adj Close | Precio ajustado por dividendos/splits |
| Volume | Volumen de transacciones |

> 📌 **Nota**: Usamos el precio de **Close** (cierre) como variable objetivo por ser el más representativo del valor de la acción al final del día.

### Validación de Datos

```python
# Verificar datos faltantes
df.isna().sum()

# Estadísticas descriptivas
df.describe()

# Tipos de datos
df.dtypes
```

---

## 3. Exploración y Visualización

### Visualización del Precio de Cierre

```python
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 5))
plt.plot(df.Close)
plt.title(f'{ticker} - Precio de Cierre')
plt.xlabel('Días')
plt.ylabel('Precio ($)')
plt.show()
```

**Resultado típico (AAPL):**

```
Precio ($)
│
250 │                                          ╭───────────╮
    │                                     ╭────╯           │
200 │                               ╭─────╯                ╰──
    │                          ╭────╯
150 │                     ╭────╯
    │               ╭─────╯
100 │          ╭────╯
    │     ╭────╯
 50 │─────╯
    │
    └─────────────────────────────────────────────────────────▶ Días
          2015      2017      2019      2021      2023      2025
```

---

## 4. Ingeniería de Features

### Medias Móviles (Moving Averages)

Las medias móviles suavizan las fluctuaciones de precio y revelan tendencias:

```python
# Media móvil de 100 días
df['MA_100'] = df.Close.rolling(100).mean()

# Media móvil de 200 días
df['MA_200'] = df.Close.rolling(200).mean()
```

**Interpretación:**
- **MA corta (100) > MA larga (200)**: Tendencia alcista (bullish)
- **MA corta (100) < MA larga (200)**: Tendencia bajista (bearish)
- **Cruce de MAs**: Señal de posible cambio de tendencia

### Cálculo de Cambio Porcentual

```python
# Porcentaje de cambio diario
df['Percentage Changed'] = df.Close.pct_change()
```

**¿Por qué es útil?**
- Normaliza los cambios independientemente del precio absoluto
- Muestra volatilidad del mercado
- Permite comparar diferentes acciones

---

## 5. Preprocesamiento

### División Train/Test

```python
# 70% para entrenamiento, 30% para testing
data_training = pd.DataFrame(df.Close[0:int(len(df)*0.7)])
data_testing = pd.DataFrame(df.Close[int(len(df)*0.7):])
```

**Ejemplo con 2500 días de datos:**
- Training: 1750 días (70%)
- Testing: 750 días (30%)

```
┌────────────────────────────────────────────────────────────────────┐
│                         Dataset Completo                            │
├──────────────────────────────────┬─────────────────────────────────┤
│         TRAINING (70%)           │           TESTING (30%)          │
│      Días 0 - 1749               │        Días 1750 - 2499          │
│                                  │                                  │
│  ✓ Usado para entrenar modelo    │  ✓ Usado para evaluar modelo    │
│  ✓ Scaler fitted AQUÍ            │  ✗ Scaler NO fitted aquí        │
└──────────────────────────────────┴─────────────────────────────────┘
```

### Normalización (Scaling)

Los precios pueden variar de $10 a $250, pero las redes neuronales funcionan mejor con valores entre 0 y 1:

```python
from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler(feature_range=(0, 1))
data_training_array = scaler.fit_transform(data_training)
```

**Fórmula MinMaxScaler:**

$$X_{scaled} = \frac{X - X_{min}}{X_{max} - X_{min}}$$

**Ejemplo:**
- Precio mínimo en training: $27.00
- Precio máximo en training: $183.00
- Precio actual: $105.00

$$X_{scaled} = \frac{105 - 27}{183 - 27} = \frac{78}{156} = 0.5$$

### ⚠️ CRÍTICO: Prevención de Data Leakage

```python
# ❌ INCORRECTO - Data Leakage
scaler.fit_transform(df.Close)  # Incluye datos de testing!

# ✅ CORRECTO - Sin Data Leakage
scaler.fit(data_training)  # Solo datos de training
scaler.transform(data_testing)  # Aplicar a testing
```

**¿Por qué es importante?**
- El scaler "conoce" los valores mínimo y máximo
- Si incluye datos de testing, el modelo "ve el futuro"
- Las métricas serían artificialmente buenas pero irreales

---

## 6. Creación de Secuencias

### El Concepto

LSTM necesita secuencias de tiempo como entrada. Usamos los **últimos 100 días** para predecir el **día siguiente**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Creación de Secuencias (Window Sliding)               │
│                                                                          │
│  Datos: [P₀, P₁, P₂, P₃, P₄, P₅, P₆, ..., P₁₀₀, P₁₀₁, P₁₀₂, ...]       │
│                                                                          │
│  Secuencia 1:  x = [P₀  ... P₉₉]   →  y = P₁₀₀                          │
│  Secuencia 2:  x = [P₁  ... P₁₀₀]  →  y = P₁₀₁                          │
│  Secuencia 3:  x = [P₂  ... P₁₀₁]  →  y = P₁₀₂                          │
│  ...                                                                     │
│                                                                          │
│  El modelo aprende: "Dados 100 días, ¿cuál es el precio del día 101?"   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementación

```python
x_train = []
y_train = []

for i in range(100, data_training_array.shape[0]):
    x_train.append(data_training_array[i-100:i])  # 100 precios anteriores
    y_train.append(data_training_array[i, 0])     # Precio actual (target)

x_train, y_train = np.array(x_train), np.array(y_train)
```

### Ejemplo Simplificado

```python
# Supongamos precios: [10, 20, 30, 40, 50, 60]
# Con ventana de 3 días:

precios = [10, 20, 30, 40, 50, 60]

# Secuencia 1: x = [10, 20, 30], y = 40
# Secuencia 2: x = [20, 30, 40], y = 50
# Secuencia 3: x = [30, 40, 50], y = 60
```

### Dimensiones de los Datos

```python
x_train.shape  # (1650, 100, 1) = (muestras, timesteps, features)
y_train.shape  # (1650,) = (muestras,)
```

- **Muestras**: ~1650 secuencias de entrenamiento
- **Timesteps**: 100 días por secuencia
- **Features**: 1 (solo precio de cierre)

---

## 7. Arquitectura del Modelo

### Diseño de la Red LSTM

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Input

model = Sequential()

# Capa de entrada
model.add(Input(shape=(100, 1)))

# Primera capa LSTM
model.add(LSTM(units=128, activation='tanh', return_sequences=True))

# Segunda capa LSTM
model.add(LSTM(units=64))

# Capa oculta densa
model.add(Dense(25))

# Capa de salida
model.add(Dense(1))
```

### Visualización de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Arquitectura del Modelo                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Input Layer                                 │    │
│  │                   Shape: (100, 1)                                │    │
│  │           100 timesteps × 1 feature (precio)                     │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     LSTM Layer 1                                 │    │
│  │                    128 unidades                                  │    │
│  │               activation: tanh                                   │    │
│  │            return_sequences: True                                │    │
│  │                                                                  │    │
│  │  "Procesa secuencia y pasa estados ocultos a la siguiente capa" │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     LSTM Layer 2                                 │    │
│  │                     64 unidades                                  │    │
│  │               activation: tanh                                   │    │
│  │            return_sequences: False                               │    │
│  │                                                                  │    │
│  │  "Extrae representación final de la secuencia"                   │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Dense Layer                                  │    │
│  │                    25 neuronas                                   │    │
│  │                                                                  │    │
│  │  "Transforma features LSTM en representación más compacta"       │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Output Layer                                 │    │
│  │                     1 neurona                                    │    │
│  │                                                                  │    │
│  │  "Predice el precio del día siguiente (normalizado 0-1)"         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Total de parámetros: ~120,000                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### ¿Por qué estos hiperparámetros?

| Hiperparámetro | Valor | Justificación |
|----------------|-------|---------------|
| Secuencia | 100 días | ~5 meses de trading, captura tendencias medias |
| LSTM 1 | 128 unidades | Capacidad suficiente para patrones complejos |
| LSTM 2 | 64 unidades | Reducción dimensional, evita overfitting |
| Activación | tanh | Estándar para LSTM, valores (-1, 1) |
| return_sequences | True/False | True para pasar a otra LSTM, False para Dense |

---

## 8. Entrenamiento

### Configuración del Entrenamiento

```python
model.compile(
    optimizer='adam',
    loss='mean_squared_error'
)

model.fit(
    x_train, 
    y_train, 
    epochs=50
)
```

### Detalles del Proceso

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Optimizer | Adam | Adaptive learning rate, rápido convergencia |
| Loss | MSE | Mean Squared Error, penaliza errores grandes |
| Epochs | 50 | Iteraciones completas sobre el dataset |
| Batch Size | 32 (default) | Muestras por actualización de pesos |

### Curva de Pérdida Típica

```
Loss
│
0.05 │█
     │ █
0.04 │  █
     │   █
0.03 │    █
     │     █
0.02 │      █
     │       ██
0.01 │         ███████████████████████████
     │
0.00 │────────────────────────────────────▶ Epochs
     0    10    20    30    40    50
```

### Guardar el Modelo

```python
model.save('stock_prediction_model.keras')
```

---

## 9. Evaluación

### Preparación de Datos de Test

```python
# Tomar últimos 100 días del training para iniciar secuencias de test
past_100_days = data_training.tail(100)

# Concatenar con datos de test
final_df = pd.concat([past_100_days, data_testing], ignore_index=True)

# Escalar usando el scaler de training (¡NO fit_transform!)
input_data = scaler.transform(final_df)

# Crear secuencias de test
x_test, y_test = [], []
for i in range(100, input_data.shape[0]):
    x_test.append(input_data[i-100:i])
    y_test.append(input_data[i, 0])

x_test, y_test = np.array(x_test), np.array(y_test)
```

### Predicción y Desnormalización

```python
# Predecir
y_predicted = model.predict(x_test)

# Volver a escala original
y_predicted = scaler.inverse_transform(y_predicted).flatten()
y_test = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()
```

### Métricas de Evaluación

#### 1. Mean Squared Error (MSE)

$$MSE = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$

```python
from sklearn.metrics import mean_squared_error
mse = mean_squared_error(y_test, y_predicted)
```

**Interpretación:**
- Mide el promedio de los errores al cuadrado
- Penaliza errores grandes más que pequeños
- En la misma escala que el precio al cuadrado

#### 2. Root Mean Squared Error (RMSE)

$$RMSE = \sqrt{MSE}$$

```python
rmse = np.sqrt(mse)
```

**Interpretación:**
- En la misma escala que el precio ($)
- RMSE = 3.5 significa error promedio de ~$3.50

#### 3. R-Squared (R²)

$$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

```python
from sklearn.metrics import r2_score
r2 = r2_score(y_test, y_predicted)
```

**Interpretación:**
- Porcentaje de varianza explicada por el modelo
- R² = 0.98 significa que el modelo explica 98% de la variabilidad
- Valores cercanos a 1.0 son excelentes

### Resultados Típicos

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| MSE | ~12-15 | - |
| RMSE | ~$3.5-4.0 | Excelente para predicción diaria |
| R² | ~0.97-0.99 | Muy alto, buen ajuste |

### Visualización de Resultados

```python
plt.figure(figsize=(12, 6))
plt.plot(y_test, 'b', label='Precio Real')
plt.plot(y_predicted, 'r', label='Precio Predicho')
plt.xlabel('Días')
plt.ylabel('Precio ($)')
plt.legend()
```

```
Precio ($)
│
200 │   ╭─────╮                    ╭──────
    │  ╱      ╲                  ╭╯
180 │ ╱        ╲      ╭─────╮   ╱
    │╱          ╲    ╱      ╲  ╱       ── Real
160 │            ╲──╯        ╲╱        ── Predicho
    │
140 │
    │
    └─────────────────────────────────────▶ Días Test
            200       400       600
```

---

## 10. Predicción en Producción

### Backtesting vs Predicción Futura

| Modo | Descripción | Uso |
|------|-------------|-----|
| **Backtesting** | Evalúa modelo con datos históricos reservados | Validar precisión |
| **Predicción Futura** | Predice días que aún no han ocurrido | Pronóstico real |

### Predicción Recursiva

Para predecir múltiples días en el futuro, usamos predicción recursiva:

```
Día 0: [P₁, P₂, ..., P₁₀₀] → Predice P̂₁₀₁
Día 1: [P₂, P₃, ..., P̂₁₀₁] → Predice P̂₁₀₂
Día 2: [P₃, P₄, ..., P̂₁₀₂] → Predice P̂₁₀₃
...
```

### Cuantificación de Incertidumbre

Usamos **Monte Carlo Dropout** para estimar la incertidumbre:

```python
mc_iterations = 50
predictions = []

for _ in range(mc_iterations):
    pred = model(X, training=True)  # training=True activa dropout
    predictions.append(pred)

mean_pred = np.mean(predictions)
std_pred = np.std(predictions)

# Intervalo de confianza 95%
lower = mean_pred - 1.96 * std_pred
upper = mean_pred + 1.96 * std_pred
```

### Factor de Incertidumbre Creciente

```python
# La incertidumbre crece con el horizonte de predicción
uncertainty_factor = 1.0 + (0.02 * day)  # +2% por día
adjusted_std = std_pred * uncertainty_factor
```

**Visualización:**

```
Precio ($)
│
│                              ╱╲
│                            ╱    ╲  ← Banda superior (95%)
│                          ╱        ╲
│                        ╱   ────────  ← Predicción media
│                      ╱    ╲
│                    ╱        ╲  ← Banda inferior (95%)
│──────────────────╱
│     Histórico    │  Predicción Futura
│                  │
└───────────────────────────────────────▶ Días
                   Hoy
```

---

## 📚 Referencias

- [Understanding LSTM Networks](https://colah.github.io/posts/2015-08-Understanding-LSTMs/) - Chris Olah
- [Keras Documentation](https://keras.io/api/layers/recurrent_layers/lstm/)
- [yfinance Documentation](https://pypi.org/project/yfinance/)

---

## 🔜 Siguiente Paso

Consulta la [Documentación de la API](API.md) para ver cómo usar estas predicciones en la aplicación.
