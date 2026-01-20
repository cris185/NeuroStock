"""
ML Model Manager - Singleton Pattern for Model and Scaler Lifecycle Management

This module provides efficient management of the LSTM model and training scaler
by loading them once at server startup and caching in memory for all requests.

Benefits:
- Eliminates expensive I/O operations (saves ~2-3s per request)
- Thread-safe for concurrent requests
- Ensures consistent scaler across all predictions
"""

import threading
import os
from keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import joblib


class MLModelManager:
    """
    Singleton pattern for managing ML model and scaler lifecycle.

    Usage:
        manager = MLModelManager.get_instance()
        model = manager.get_model()
        scaler = manager.get_training_scaler()
    """

    _instance = None
    _lock = threading.Lock()
    _model = None
    _training_scaler = None

    def __init__(self):
        """
        Private constructor. Use get_instance() instead.

        Raises:
            Exception: If called directly instead of through get_instance()
        """
        if MLModelManager._instance is not None:
            raise Exception(
                "MLModelManager is a singleton. Use get_instance() instead."
            )

        # Paths relative to Django project root (backend-drf/)
        self.model_path = 'stock_prediction_model.keras'
        self.scaler_path = 'stock_prediction_scaler.pkl'

    @classmethod
    def get_instance(cls):
        """
        Get singleton instance of MLModelManager.

        Thread-safe lazy initialization.

        Returns:
            MLModelManager: Singleton instance
        """
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def get_model(self):
        """
        Get LSTM model, loading from disk if not already cached.

        Returns:
            keras.Model: Loaded LSTM model

        Raises:
            FileNotFoundError: If model file doesn't exist
            RuntimeError: If model loading fails
        """
        if self._model is None:
            with self._lock:
                if self._model is None:
                    try:
                        if not os.path.exists(self.model_path):
                            raise FileNotFoundError(
                                f"Model file not found: {self.model_path}. "
                                f"Ensure the model is in the backend-drf/ directory."
                            )

                        self._model = load_model(self.model_path)

                        # Validate model architecture
                        if len(self._model.inputs) != 1:
                            raise ValueError(
                                f"Expected 1 input, got {len(self._model.inputs)}"
                            )

                        input_shape = self._model.inputs[0].shape
                        if input_shape[1:] != (100, 1):
                            raise ValueError(
                                f"Expected input shape (None, 100, 1), "
                                f"got {input_shape}"
                            )

                        print(f"✓ Model loaded successfully from {self.model_path}")
                        print(f"  Input shape: {input_shape}")
                        print(f"  Total params: {self._model.count_params():,}")

                    except Exception as e:
                        raise RuntimeError(
                            f"Failed to load model from {self.model_path}: {str(e)}"
                        )

        return self._model

    def get_training_scaler(self):
        """
        Get training scaler, loading from disk if not already cached.

        The training scaler is fitted ONLY on AAPL training data (70% split)
        to prevent data leakage in backtesting and future predictions.

        Returns:
            MinMaxScaler: Scaler fitted on training data

        Raises:
            FileNotFoundError: If scaler file doesn't exist
            RuntimeError: If scaler loading fails
        """
        if self._training_scaler is None:
            with self._lock:
                if self._training_scaler is None:
                    try:
                        if not os.path.exists(self.scaler_path):
                            raise FileNotFoundError(
                                f"Scaler file not found: {self.scaler_path}. "
                                f"Generate it by running: "
                                f"python manage.py generate_scaler"
                            )

                        self._training_scaler = joblib.load(self.scaler_path)

                        # Validate scaler
                        if not isinstance(self._training_scaler, MinMaxScaler):
                            raise TypeError(
                                f"Expected MinMaxScaler, got "
                                f"{type(self._training_scaler)}"
                            )

                        if self._training_scaler.feature_range != (0, 1):
                            raise ValueError(
                                f"Expected feature_range (0, 1), got "
                                f"{self._training_scaler.feature_range}"
                            )

                        print(f"✓ Scaler loaded successfully from {self.scaler_path}")
                        print(f"  Data range: "
                              f"[{self._training_scaler.data_min_[0]:.2f}, "
                              f"{self._training_scaler.data_max_[0]:.2f}]")

                    except Exception as e:
                        raise RuntimeError(
                            f"Failed to load scaler from {self.scaler_path}: {str(e)}"
                        )

        return self._training_scaler

    @classmethod
    def reset(cls):
        """
        Reset singleton instance (for testing purposes).

        This clears cached model and scaler, forcing reload on next access.
        Use only in tests or when model/scaler files are updated.
        """
        with cls._lock:
            cls._instance = None
            cls._model = None
            cls._training_scaler = None
