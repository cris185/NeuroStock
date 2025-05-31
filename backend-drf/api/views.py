from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import StockPredictionSerializers
from rest_framework import status
from rest_framework.response import Response
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import os
from django.conf import settings
from .utils import save_plot
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
from sklearn.metrics import mean_squared_error, r2_score


class StockPredictionAPIView(APIView):
    def post(self, request):
        serializer = StockPredictionSerializers(data=request.data)
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker']

            # Buscar la data desde Yahoo Finance
            now = datetime.now()
            start = datetime(now.year - 10, now.month, now.day)
            end = now
            df = yf.download(ticker, start=start, end=end)
            if df.empty:
                return Response({'error': 'Ticker not found or no data available',
                                 'status': status.HTTP_404_NOT_FOUND})

            # Generate Basic Plot
            plt.switch_backend('AGG')
            plt.figure(figsize=(12, 5))
            plt.plot(df.Close, label='Closing Price')
            plt.title(f'Closing price of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()

            # Save the plot to a file
            plot_img_path = f'{ticker}_plot.png'

            plot_img = save_plot(plot_img_path)


            # 100 days moving average
            ma100 = df.Close.rolling(100).mean()
            plt.switch_backend('AGG')
            plt.figure(figsize=(12, 5))
            plt.plot(df.Close, label='Closing Price')
            plt.title(f'100 Days Moving Average of {ticker}')
            plt.plot(ma100, label='100 Days Moving Average', color='r')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_img_path = f'{ticker}_100dma_plot.png'
            plot_100_dma = save_plot(plot_img_path)
            
            # 200 days moving average
            ma200 = df.Close.rolling(200).mean()
            plt.switch_backend('AGG')
            plt.figure(figsize=(12, 5))
            plt.plot(df.Close, label='Closing Price')
            plt.plot(ma100, label='100 Days Moving Average', color='r')
            plt.plot(ma200, label='200 Days Moving Average', color='g')
            plt.title(f'200 Days Moving Average of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Close Price')
            plt.legend()
            plot_img_path = f'{ticker}_200dma_plot.png'
            plot_200_dma = save_plot(plot_img_path)
            
            
            #Splitting the data into training and testing datasets
            data_training = pd.DataFrame(df.Close[0:int(len(df)*0.7)])
            data_testing = pd.DataFrame(df.Close[int(len(df)*0.7): int(len(df))])
            
            
            # Scaling down the data between 0 and 1
            scaler = MinMaxScaler(feature_range=(0,1))
            
            
            #Load ML model
            model = load_model('stock_prediction_model.keras')
            
            #Preparing Test Data
            past_100_days = data_training.tail(100)
            final_df = pd.concat([past_100_days, data_testing], ignore_index=True)
            input_data = scaler.fit_transform(final_df)
            
            x_test = []
            y_test = []
            
            for i in range(100, input_data.shape[0]):
                x_test.append(input_data[i-100:i, 0])
                y_test.append(input_data[i, 0])
            
            x_test, y_test = np.array(x_test), np.array(y_test)
            
            
            # Making Predictions
            y_predicted = model.predict(x_test)
            
            # Revert the scaled prices to original price
            y_predicted = scaler.inverse_transform(y_predicted.reshape(-1, 1)).flatten()
            y_test = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()
            

            # Plot the final prediction
            plt.switch_backend('AGG')
            plt.figure(figsize=(12, 5))
            plt.plot(y_test, 'b', label='Original Price')
            plt.plot(y_predicted, 'r', label='Predicted Price')
            plt.title(f'Predicted Closing Price of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_img_path = f'{ticker}_predicted_plot.png'
            plot_prediction = save_plot(plot_img_path)
            
            # Model Evaluation
            # Mean Square Error (MSE)
            mse = mean_squared_error(y_test, y_predicted)
            
            # Root Mean Squared Error (RMSE)
            rmse = np.sqrt(mse)
            
            # R-Squared (R2)
            r2 = r2_score(y_test, y_predicted)
            
            
            
            
            return Response({'status':'success',
                             'plot_img': plot_img,
                             'plot_100_dma': plot_100_dma,
                             'plot_200_dma': plot_200_dma,
                             'plot_prediction': plot_prediction,
                             'mse': mse,
                             'rmse': rmse,
                             'r2': r2,
                             'ticker': ticker,
                             })
