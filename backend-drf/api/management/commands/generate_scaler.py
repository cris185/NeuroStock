"""
Django Management Command: Generate Training Scaler

This command generates the training scaler by downloading AAPL historical data
and fitting a MinMaxScaler on the first 70% (training portion only).

This scaler is then used across all predictions to prevent data leakage.

Usage:
    python manage.py generate_scaler
"""

from django.core.management.base import BaseCommand
import yfinance as yf
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
import joblib
import pandas as pd


class Command(BaseCommand):
    help = 'Generate training scaler from AAPL data (70% split, no data leakage)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING('Generating Training Scaler'))
        self.stdout.write('This scaler will be used for all predictions to prevent data leakage.\n')

        try:
            # 1. Download AAPL data (same as model training)
            self.stdout.write('Step 1: Downloading AAPL historical data (10 years)...')
            now = datetime.now()
            start = datetime(now.year - 10, now.month, now.day)

            df = yf.download('AAPL', start=start, end=now, progress=False)

            if df.empty:
                self.stdout.write(self.style.ERROR(
                    '✗ Failed to download AAPL data. Check internet connection.'
                ))
                return

            # Handle MultiIndex columns
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            close_prices = df['Close'].squeeze()

            self.stdout.write(self.style.SUCCESS(
                f'  [OK] Downloaded {len(close_prices)} days of data '
                f'({df.index[0].strftime("%Y-%m-%d")} to {df.index[-1].strftime("%Y-%m-%d")})'
            ))

            # 2. Take only 70% as training (same division as notebook)
            self.stdout.write('\nStep 2: Splitting data (70% training)...')
            split_idx = int(len(close_prices) * 0.7)
            training_data = close_prices[:split_idx]

            self.stdout.write(self.style.SUCCESS(
                f'  [OK] Training data: {len(training_data)} days '
                f'({close_prices.index[0].strftime("%Y-%m-%d")} to '
                f'{close_prices.index[split_idx-1].strftime("%Y-%m-%d")})'
            ))

            # 3. Fit scaler ONLY on training data
            self.stdout.write('\nStep 3: Fitting MinMaxScaler on training data only...')
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaler.fit(training_data.values.reshape(-1, 1))

            data_min = scaler.data_min_[0]
            data_max = scaler.data_max_[0]

            self.stdout.write(self.style.SUCCESS(
                f'  [OK] Scaler fitted:'
            ))
            self.stdout.write(f'    - Min price: ${data_min:.2f}')
            self.stdout.write(f'    - Max price: ${data_max:.2f}')
            self.stdout.write(f'    - Range: ${data_max - data_min:.2f}')

            # 4. Save scaler
            self.stdout.write('\nStep 4: Saving scaler to disk...')
            scaler_path = 'stock_prediction_scaler.pkl'
            joblib.dump(scaler, scaler_path)

            self.stdout.write(self.style.SUCCESS(
                f'  [OK] Scaler saved to: {scaler_path}'
            ))

            # 5. Verification
            self.stdout.write('\nStep 5: Verifying scaler...')
            loaded_scaler = joblib.load(scaler_path)

            test_value = training_data.values[0].reshape(-1, 1)
            scaled = loaded_scaler.transform(test_value)

            self.stdout.write(self.style.SUCCESS(
                f'  [OK] Scaler verified: ${test_value[0][0]:.2f} -> {scaled[0][0]:.6f}'
            ))

            # Summary
            self.stdout.write('\n' + '=' * 70)
            self.stdout.write(self.style.SUCCESS('SUCCESS: Training scaler generated!'))
            self.stdout.write('=' * 70)
            self.stdout.write(f'\nScaler Details:')
            self.stdout.write(f'  File: {scaler_path}')
            self.stdout.write(f'  Training Period: {close_prices.index[0].strftime("%Y-%m-%d")} '
                            f'to {close_prices.index[split_idx-1].strftime("%Y-%m-%d")}')
            self.stdout.write(f'  Training Days: {len(training_data)}')
            self.stdout.write(f'  Price Range: ${data_min:.2f} - ${data_max:.2f}')
            self.stdout.write(f'\nNext Steps:')
            self.stdout.write(f'  1. Commit the scaler: git add {scaler_path}')
            self.stdout.write(f'  2. Test the API endpoint')
            self.stdout.write(f'  3. Verify no data leakage in backtesting metrics\n')

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'\n[ERROR] Error generating scaler: {str(e)}'
            ))
            import traceback
            traceback.print_exc()
