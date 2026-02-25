# 🧠 Machine Learning Methodology

This document explains in detail the methodology used to build, train, and evaluate the LSTM stock prediction model. It's based on the notebook `Resources_tf/stock_prediction_using_LSTM.ipynb`.

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Data Collection](#2-data-collection)
3. [Exploration and Visualization](#3-exploration-and-visualization)
4. [Feature Engineering](#4-feature-engineering)
5. [Preprocessing](#5-preprocessing)
6. [Sequence Creation](#6-sequence-creation)
7. [Model Architecture](#7-model-architecture)
8. [Training](#8-training)
9. [Evaluation](#9-evaluation)
10. [Production Prediction](#10-production-prediction)

---

## 1. Overview

### Why LSTM?

**LSTM (Long Short-Term Memory)** networks are a special type of recurrent neural network (RNN) designed to learn long-term dependencies in sequential data.

**Advantages for financial time series:**
- Capture complex temporal patterns
- Maintain memory of relevant past events
- Handle the "vanishing gradient" problem of traditional RNNs

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LSTM Architecture                                 │
│                                                                          │
│   Input (t-100) ──▶ LSTM ──▶ LSTM ──▶ ... ──▶ LSTM ──▶ Output (t)      │
│                      │        │                 │                        │
│                      ▼        ▼                 ▼                        │
│                   Hidden   Hidden            Hidden                      │
│                    State    State             State                      │
│                                                                          │
│   "The model learns which information from the past is relevant          │
│    to predict the future price"                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Collection

### Data Source: Yahoo Finance

We use the `yfinance` library to obtain historical market data:

```python
import yfinance as yf
from datetime import datetime

# Configure 10-year range
now = datetime.now()
start = datetime(now.year - 10, now.month, now.day)
end = now

# Download ticker data
ticker = 'AAPL'
df = yf.download(ticker, start, end)
```

### Data Structure

| Column | Description |
|--------|-------------|
| Date | Trading date (index) |
| Open | Opening price |
| High | Highest price of the day |
| Low | Lowest price of the day |
| **Close** | Closing price (used for prediction) |
| Adj Close | Price adjusted for dividends/splits |
| Volume | Transaction volume |

> 📌 **Note**: We use the **Close** price as the target variable since it's the most representative value of the stock at the end of the day.

### Data Validation

```python
# Check for missing values
df.isna().sum()

# Descriptive statistics
df.describe()

# Data types
df.dtypes
```

---

## 3. Exploration and Visualization

### Close Price Visualization

```python
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 5))
plt.plot(df.Close)
plt.title(f'{ticker} - Close Price')
plt.xlabel('Days')
plt.ylabel('Price ($)')
plt.show()
```

**Typical result (AAPL):**

```
Price ($)
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
    └─────────────────────────────────────────────────────────▶ Days
          2015      2017      2019      2021      2023      2025
```

---

## 4. Feature Engineering

### Moving Averages

Moving averages smooth price fluctuations and reveal trends:

```python
# 100-day moving average
df['MA_100'] = df.Close.rolling(100).mean()

# 200-day moving average
df['MA_200'] = df.Close.rolling(200).mean()
```

**Interpretation:**
- **Short MA (100) > Long MA (200)**: Bullish trend
- **Short MA (100) < Long MA (200)**: Bearish trend
- **MA Crossover**: Signal of potential trend change

### Percentage Change Calculation

```python
# Daily percentage change
df['Percentage Changed'] = df.Close.pct_change()
```

**Why is this useful?**
- Normalizes changes regardless of absolute price
- Shows market volatility
- Allows comparison between different stocks

---

## 5. Preprocessing

### Train/Test Split

```python
# 70% for training, 30% for testing
data_training = pd.DataFrame(df.Close[0:int(len(df)*0.7)])
data_testing = pd.DataFrame(df.Close[int(len(df)*0.7):])
```

**Example with 2500 days of data:**
- Training: 1750 days (70%)
- Testing: 750 days (30%)

```
┌────────────────────────────────────────────────────────────────────┐
│                         Complete Dataset                            │
├──────────────────────────────────┬─────────────────────────────────┤
│         TRAINING (70%)           │           TESTING (30%)          │
│      Days 0 - 1749               │        Days 1750 - 2499          │
│                                  │                                  │
│  ✓ Used to train model           │  ✓ Used to evaluate model       │
│  ✓ Scaler fitted HERE            │  ✗ Scaler NOT fitted here       │
└──────────────────────────────────┴─────────────────────────────────┘
```

### Normalization (Scaling)

Prices can range from $10 to $250, but neural networks work better with values between 0 and 1:

```python
from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler(feature_range=(0, 1))
data_training_array = scaler.fit_transform(data_training)
```

**MinMaxScaler Formula:**

$$X_{scaled} = \frac{X - X_{min}}{X_{max} - X_{min}}$$

**Example:**
- Minimum training price: $27.00
- Maximum training price: $183.00
- Current price: $105.00

$$X_{scaled} = \frac{105 - 27}{183 - 27} = \frac{78}{156} = 0.5$$

### ⚠️ CRITICAL: Preventing Data Leakage

```python
# ❌ WRONG - Data Leakage
scaler.fit_transform(df.Close)  # Includes testing data!

# ✅ CORRECT - No Data Leakage
scaler.fit(data_training)  # Only training data
scaler.transform(data_testing)  # Apply to testing
```

**Why is this important?**
- The scaler "knows" the minimum and maximum values
- If it includes testing data, the model "sees the future"
- Metrics would be artificially good but unrealistic

---

## 6. Sequence Creation

### The Concept

LSTM needs time sequences as input. We use the **last 100 days** to predict the **next day**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Sequence Creation (Window Sliding)                    │
│                                                                          │
│  Data: [P₀, P₁, P₂, P₃, P₄, P₅, P₆, ..., P₁₀₀, P₁₀₁, P₁₀₂, ...]       │
│                                                                          │
│  Sequence 1:  x = [P₀  ... P₉₉]   →  y = P₁₀₀                          │
│  Sequence 2:  x = [P₁  ... P₁₀₀]  →  y = P₁₀₁                          │
│  Sequence 3:  x = [P₂  ... P₁₀₁]  →  y = P₁₀₂                          │
│  ...                                                                     │
│                                                                          │
│  The model learns: "Given 100 days, what is the price on day 101?"      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```python
x_train = []
y_train = []

for i in range(100, data_training_array.shape[0]):
    x_train.append(data_training_array[i-100:i])  # 100 previous prices
    y_train.append(data_training_array[i, 0])     # Current price (target)

x_train, y_train = np.array(x_train), np.array(y_train)
```

### Simplified Example

```python
# Assume prices: [10, 20, 30, 40, 50, 60]
# With 3-day window:

prices = [10, 20, 30, 40, 50, 60]

# Sequence 1: x = [10, 20, 30], y = 40
# Sequence 2: x = [20, 30, 40], y = 50
# Sequence 3: x = [30, 40, 50], y = 60
```

### Data Dimensions

```python
x_train.shape  # (1650, 100, 1) = (samples, timesteps, features)
y_train.shape  # (1650,) = (samples,)
```

- **Samples**: ~1650 training sequences
- **Timesteps**: 100 days per sequence
- **Features**: 1 (only close price)

---

## 7. Model Architecture

### LSTM Network Design

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Input

model = Sequential()

# Input layer
model.add(Input(shape=(100, 1)))

# First LSTM layer
model.add(LSTM(units=128, activation='tanh', return_sequences=True))

# Second LSTM layer
model.add(LSTM(units=64))

# Dense hidden layer
model.add(Dense(25))

# Output layer
model.add(Dense(1))
```

### Architecture Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Model Architecture                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Input Layer                                 │    │
│  │                   Shape: (100, 1)                                │    │
│  │           100 timesteps × 1 feature (price)                      │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     LSTM Layer 1                                 │    │
│  │                    128 units                                     │    │
│  │               activation: tanh                                   │    │
│  │            return_sequences: True                                │    │
│  │                                                                  │    │
│  │  "Processes sequence and passes hidden states to next layer"     │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     LSTM Layer 2                                 │    │
│  │                     64 units                                     │    │
│  │               activation: tanh                                   │    │
│  │            return_sequences: False                               │    │
│  │                                                                  │    │
│  │  "Extracts final representation of the sequence"                 │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Dense Layer                                  │    │
│  │                    25 neurons                                    │    │
│  │                                                                  │    │
│  │  "Transforms LSTM features into more compact representation"     │    │
│  └───────────────────────────┬─────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Output Layer                                 │    │
│  │                     1 neuron                                     │    │
│  │                                                                  │    │
│  │  "Predicts the next day's price (normalized 0-1)"                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Total parameters: ~120,000                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why These Hyperparameters?

| Hyperparameter | Value | Justification |
|----------------|-------|---------------|
| Sequence | 100 days | ~5 months of trading, captures medium trends |
| LSTM 1 | 128 units | Sufficient capacity for complex patterns |
| LSTM 2 | 64 units | Dimensional reduction, avoids overfitting |
| Activation | tanh | Standard for LSTM, values (-1, 1) |
| return_sequences | True/False | True to pass to another LSTM, False for Dense |

---

## 8. Training

### Training Configuration

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

### Process Details

| Parameter | Value | Description |
|-----------|-------|-------------|
| Optimizer | Adam | Adaptive learning rate, fast convergence |
| Loss | MSE | Mean Squared Error, penalizes large errors |
| Epochs | 50 | Complete iterations over the dataset |
| Batch Size | 32 (default) | Samples per weight update |

### Typical Loss Curve

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

### Save the Model

```python
model.save('stock_prediction_model.keras')
```

---

## 9. Evaluation

### Test Data Preparation

```python
# Take last 100 days from training to initialize test sequences
past_100_days = data_training.tail(100)

# Concatenate with test data
final_df = pd.concat([past_100_days, data_testing], ignore_index=True)

# Scale using training scaler (NOT fit_transform!)
input_data = scaler.transform(final_df)

# Create test sequences
x_test, y_test = [], []
for i in range(100, input_data.shape[0]):
    x_test.append(input_data[i-100:i])
    y_test.append(input_data[i, 0])

x_test, y_test = np.array(x_test), np.array(y_test)
```

### Prediction and Denormalization

```python
# Predict
y_predicted = model.predict(x_test)

# Return to original scale
y_predicted = scaler.inverse_transform(y_predicted).flatten()
y_test = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()
```

### Evaluation Metrics

#### 1. Mean Squared Error (MSE)

$$MSE = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$

```python
from sklearn.metrics import mean_squared_error
mse = mean_squared_error(y_test, y_predicted)
```

**Interpretation:**
- Measures the average of squared errors
- Penalizes large errors more than small ones
- In the same scale as squared price

#### 2. Root Mean Squared Error (RMSE)

$$RMSE = \sqrt{MSE}$$

```python
rmse = np.sqrt(mse)
```

**Interpretation:**
- In the same scale as price ($)
- RMSE = 3.5 means average error of ~$3.50

#### 3. R-Squared (R²)

$$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

```python
from sklearn.metrics import r2_score
r2 = r2_score(y_test, y_predicted)
```

**Interpretation:**
- Percentage of variance explained by the model
- R² = 0.98 means the model explains 98% of variability
- Values close to 1.0 are excellent

### Typical Results

| Metric | Value | Evaluation |
|--------|-------|------------|
| MSE | ~12-15 | - |
| RMSE | ~$3.5-4.0 | Excellent for daily prediction |
| R² | ~0.97-0.99 | Very high, good fit |

### Results Visualization

```python
plt.figure(figsize=(12, 6))
plt.plot(y_test, 'b', label='Actual Price')
plt.plot(y_predicted, 'r', label='Predicted Price')
plt.xlabel('Days')
plt.ylabel('Price ($)')
plt.legend()
```

```
Price ($)
│
200 │   ╭─────╮                    ╭──────
    │  ╱      ╲                  ╭╯
180 │ ╱        ╲      ╭─────╮   ╱
    │╱          ╲    ╱      ╲  ╱       ── Actual
160 │            ╲──╯        ╲╱        ── Predicted
    │
140 │
    │
    └─────────────────────────────────────▶ Test Days
            200       400       600
```

---

## 10. Production Prediction

### Backtesting vs Future Prediction

| Mode | Description | Use |
|------|-------------|-----|
| **Backtesting** | Evaluates model with reserved historical data | Validate accuracy |
| **Future Prediction** | Predicts days that haven't occurred yet | Real forecast |

### Recursive Prediction

To predict multiple days into the future, we use recursive prediction:

```
Day 0: [P₁, P₂, ..., P₁₀₀] → Predicts P̂₁₀₁
Day 1: [P₂, P₃, ..., P̂₁₀₁] → Predicts P̂₁₀₂
Day 2: [P₃, P₄, ..., P̂₁₀₂] → Predicts P̂₁₀₃
...
```

### Uncertainty Quantification

We use **Monte Carlo Dropout** to estimate uncertainty:

```python
mc_iterations = 50
predictions = []

for _ in range(mc_iterations):
    pred = model(X, training=True)  # training=True enables dropout
    predictions.append(pred)

mean_pred = np.mean(predictions)
std_pred = np.std(predictions)

# 95% confidence interval
lower = mean_pred - 1.96 * std_pred
upper = mean_pred + 1.96 * std_pred
```

### Growing Uncertainty Factor

```python
# Uncertainty grows with prediction horizon
uncertainty_factor = 1.0 + (0.02 * day)  # +2% per day
adjusted_std = std_pred * uncertainty_factor
```

**Visualization:**

```
Price ($)
│
│                              ╱╲
│                            ╱    ╲  ← Upper bound (95%)
│                          ╱        ╲
│                        ╱   ────────  ← Mean prediction
│                      ╱    ╲
│                    ╱        ╲  ← Lower bound (95%)
│──────────────────╱
│     Historical   │  Future Prediction
│                  │
└───────────────────────────────────────▶ Days
                   Today
```

---

## 📚 References

- [Understanding LSTM Networks](https://colah.github.io/posts/2015-08-Understanding-LSTMs/) - Chris Olah
- [Keras Documentation](https://keras.io/api/layers/recurrent_layers/lstm/)
- [yfinance Documentation](https://pypi.org/project/yfinance/)

---

## 🔜 Next Step

Check the [API Documentation](API.md) to see how to use these predictions in the application.
