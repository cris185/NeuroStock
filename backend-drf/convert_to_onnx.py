"""
Script para convertir el modelo Keras 3 a formato ONNX.

Ejecutar UNA SOLA VEZ localmente (donde TensorFlow está instalado):
    cd backend-drf
    python convert_to_onnx.py

El archivo resultante (stock_prediction_model.onnx) debe commitearse en git.
En producción (Render) se usa onnxruntime en lugar de TensorFlow.
"""

import os

KERAS_MODEL_PATH = "stock_prediction_model.keras"
ONNX_MODEL_PATH  = "stock_prediction_model.onnx"

def convert():
    if not os.path.exists(KERAS_MODEL_PATH):
        print(f"ERROR: No se encontró {KERAS_MODEL_PATH}")
        print("Asegúrate de correr este script desde el directorio backend-drf/")
        return

    print(f"Cargando modelo desde {KERAS_MODEL_PATH} ...")
    import tensorflow as tf
    import tf2onnx

    model = tf.keras.models.load_model(KERAS_MODEL_PATH)
    print(f"  Input shape:  {model.inputs[0].shape}")
    print(f"  Output shape: {model.outputs[0].shape}")
    print(f"  Total params: {model.count_params():,}")

    # Trazar el modelo con tf.function para evitar problemas de compatibilidad
    # con Keras 3 (que eliminó output_names y cambió el formato SavedModel).
    print("\nTracando el modelo con tf.function ...")
    input_spec = tf.TensorSpec([None, 100, 1], tf.float32, name="lstm_input")

    @tf.function(input_signature=[input_spec])
    def model_fn(x):
        return model(x, training=False)

    print("Convirtiendo a ONNX ...")
    tf2onnx.convert.from_function(
        model_fn,
        input_signature=[input_spec],
        output_path=ONNX_MODEL_PATH,
        opset=13,
    )

    size_mb = os.path.getsize(ONNX_MODEL_PATH) / (1024 * 1024)
    print(f"\n✓ Conversión exitosa!")
    print(f"  Archivo: {ONNX_MODEL_PATH}")
    print(f"  Tamaño:  {size_mb:.2f} MB")
    print("\nPróximos pasos:")
    print("  1. git add stock_prediction_model.onnx stock_prediction_scaler.pkl")
    print("  2. git commit -m 'Add ONNX model for lightweight inference'")
    print("  3. git push")

if __name__ == "__main__":
    convert()
