"""
ML Model Manager - Singleton Pattern for Multi-Model and Scaler Lifecycle Management

Supports multiple ONNX model variants (LSTM, GRU, BiLSTM) with per-architecture caching.
Models are loaded lazily on first use and cached in memory for all subsequent requests.

Model files (place in backend-drf/):
  - stock_prediction_model.onnx          (LSTM — default, always present)
  - stock_prediction_model_gru.onnx      (GRU — optional, train locally)
  - stock_prediction_model_bilstm.onnx   (Bidirectional LSTM — optional, train locally)
"""

import threading
import os
import onnxruntime as ort
from sklearn.preprocessing import MinMaxScaler
import joblib


class MLModelManager:
    """
    Singleton manager for ML models and training scaler.

    Usage:
        manager = MLModelManager.get_instance()
        model = manager.get_model(architecture='lstm')
        scaler = manager.get_training_scaler()
    """

    _instance = None
    _lock = threading.Lock()

    MODEL_PATHS = {
        'lstm': 'stock_prediction_model.onnx',
        'gru': 'stock_prediction_model_gru.onnx',
        'bilstm': 'stock_prediction_model_bilstm.onnx',
    }
    SCALER_PATH = 'stock_prediction_scaler.pkl'

    def __init__(self):
        if MLModelManager._instance is not None:
            raise Exception(
                "MLModelManager is a singleton. Use get_instance() instead."
            )
        self._models = {}
        self._training_scaler = None

    @classmethod
    def get_instance(cls):
        """Thread-safe singleton accessor."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def get_model(self, architecture='lstm'):
        """
        Get ONNX model for the given architecture, loading from disk if not cached.

        Args:
            architecture (str): One of 'lstm', 'gru', 'bilstm' (default: 'lstm')

        Returns:
            ort.InferenceSession: Loaded ONNX inference session

        Raises:
            FileNotFoundError: If model file doesn't exist
            RuntimeError: If model loading fails
        """
        if architecture not in self._models:
            with self._lock:
                if architecture not in self._models:
                    model_path = self.MODEL_PATHS.get(architecture)
                    if not model_path:
                        raise ValueError(
                            f"Unknown architecture '{architecture}'. "
                            f"Supported: {', '.join(self.MODEL_PATHS.keys())}"
                        )
                    if not os.path.exists(model_path):
                        if architecture == 'lstm':
                            raise FileNotFoundError(
                                f"Model file not found: {model_path}. "
                                f"Ensure the model is in the backend-drf/ directory."
                            )
                        else:
                            raise FileNotFoundError(
                                f"Model file '{model_path}' not found. "
                                f"Train a {architecture.upper()} model locally using the notebook "
                                f"in Resources_tf/ and place the exported .onnx file here."
                            )
                    try:
                        sess_options = ort.SessionOptions()
                        sess_options.inter_op_num_threads = 1
                        sess_options.intra_op_num_threads = 1
                        model = ort.InferenceSession(
                            model_path,
                            sess_options=sess_options,
                            providers=['CPUExecutionProvider'],
                        )
                        input_shape = model.get_inputs()[0].shape
                        print(
                            f"✓ ONNX {architecture.upper()} model loaded from {model_path} "
                            f"| input shape: {input_shape}"
                        )
                        self._models[architecture] = model
                    except Exception as e:
                        raise RuntimeError(
                            f"Failed to load {architecture} model from {model_path}: {str(e)}"
                        )
        return self._models[architecture]

    def get_training_scaler(self):
        """
        Get training scaler, loading from disk if not cached.

        Returns:
            MinMaxScaler: Scaler fitted on AAPL training data (70% split)

        Raises:
            FileNotFoundError: If scaler file doesn't exist
            RuntimeError: If scaler loading fails
        """
        if self._training_scaler is None:
            with self._lock:
                if self._training_scaler is None:
                    try:
                        if not os.path.exists(self.SCALER_PATH):
                            raise FileNotFoundError(
                                f"Scaler file not found: {self.SCALER_PATH}. "
                                f"Generate it by running: python manage.py generate_scaler"
                            )
                        self._training_scaler = joblib.load(self.SCALER_PATH)
                        if not isinstance(self._training_scaler, MinMaxScaler):
                            raise TypeError(
                                f"Expected MinMaxScaler, got {type(self._training_scaler)}"
                            )
                        print(
                            f"✓ Scaler loaded from {self.SCALER_PATH} "
                            f"| range: [{self._training_scaler.data_min_[0]:.2f}, "
                            f"{self._training_scaler.data_max_[0]:.2f}]"
                        )
                    except Exception as e:
                        raise RuntimeError(
                            f"Failed to load scaler from {self.SCALER_PATH}: {str(e)}"
                        )
        return self._training_scaler

    def is_architecture_available(self, architecture: str) -> bool:
        """Check if a model file exists for the given architecture."""
        path = self.MODEL_PATHS.get(architecture, '')
        return bool(path) and os.path.exists(path)

    @classmethod
    def reset(cls):
        """Reset singleton (for testing). Forces reload on next access."""
        with cls._lock:
            cls._instance = None
