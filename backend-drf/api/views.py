from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import StockPredictionSerializers
from rest_framework import status
from rest_framework.response import Response
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime
from .utils import save_plot, plot_line_chart
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
from sklearn.metrics import mean_squared_error, r2_score


class StockPredictionAPIView(APIView):
    def post(self, request):
        serializer = StockPredictionSerializers(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid input.'}, status=status.HTTP_400_BAD_REQUEST)

        ticker = serializer.validated_data['ticker']

        # 1. Descargar datos
        now = datetime.now()
        start = datetime(now.year - 10, now.month, now.day)
        df = yf.download(ticker, start=start, end=now)
        if df.empty:
            return Response({'error': 'Ticker not found or no data available'},
                            status=status.HTTP_404_NOT_FOUND)

        # 2. Gráfico base
        plot_img = plot_line_chart(
            [df.Close],
            ['Closing Price'],
            f'Closing Price of {ticker}',
            'Days', 'Price',
            f'{ticker}_plot.png'
        )

        # 3. 100 DMA
        ma100 = df.Close.rolling(100).mean()
        plot_100_dma = plot_line_chart(
            [{'data': df.Close, 'label': 'Closing Price'},
             {'data': ma100, 'label': '100 Days Moving Average', 'color': 'r'}],
            [],
            f'100 Days Moving Average of {ticker}',
            'Days', 'Price',
            f'{ticker}_100dma_plot.png'
        )

        # 4. 200 DMA
        ma200 = df.Close.rolling(200).mean()
        plot_200_dma = plot_line_chart(
            [{'data': df.Close, 'label': 'Closing Price'},
             {'data': ma100, 'label': '100 DMA', 'color': 'r'},
             {'data': ma200, 'label': '200 DMA', 'color': 'g'}],
            [],
            f'200 Days Moving Average of {ticker}',
            'Days', 'Close Price',
            f'{ticker}_200dma_plot.png'
        )

        # 5. Preparar datos
        data_training = df.Close[:int(len(df) * 0.7)]
        data_testing = df.Close[int(len(df) * 0.7):]

        scaler = MinMaxScaler(feature_range=(0, 1))

        # 6. Cargar modelo
        model = load_model('stock_prediction_model.keras')

        past_100_days = data_training.tail(100)
        final_df = pd.concat([past_100_days, data_testing], ignore_index=True)
        input_data = scaler.fit_transform(final_df.values.reshape(-1, 1))

        x_test, y_test = [], []
        for i in range(100, input_data.shape[0]):
            x_test.append(input_data[i - 100:i, 0])
            y_test.append(input_data[i, 0])

        x_test, y_test = np.array(x_test), np.array(y_test)

        # 7. Predicción
        y_predicted = model.predict(x_test)
        y_predicted = scaler.inverse_transform(y_predicted.reshape(-1, 1)).flatten()
        y_test = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

        # 8. Gráfico de predicción
        plot_prediction = plot_line_chart(
            [y_test, y_predicted],
            ['Original Price', 'Predicted Price'],
            f'Predicted Closing Price of {ticker}',
            'Days', 'Price',
            f'{ticker}_predicted_plot.png'
        )

        # 9. Métricas
        mse = mean_squared_error(y_test, y_predicted)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_predicted)

        return Response({
            'status': 'success',
            'plot_img': plot_img,
            'plot_100_dma': plot_100_dma,
            'plot_200_dma': plot_200_dma,
            'plot_prediction': plot_prediction,
            'mse': mse,
            'rmse': rmse,
            'r2': r2,
            'ticker': ticker,
        })
