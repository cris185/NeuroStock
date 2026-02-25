# 🛠️ Guía de Instalación

Esta guía te llevará paso a paso para configurar NeuroStock en tu entorno local.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

| Software | Versión Mínima | Verificar Instalación |
|----------|----------------|----------------------|
| Python | 3.12+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.0+ | `git --version` |

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/neurostock.git
cd neurostock
```

---

### 2. Configurar el Backend (Django)

#### 2.1 Crear Entorno Virtual

```bash
# Crear entorno virtual
python -m venv env

# Activar entorno virtual
# Windows PowerShell:
.\env\Scripts\Activate.ps1

# Windows CMD:
.\env\Scripts\activate.bat

# Linux/MacOS:
source env/bin/activate
```

> 💡 **Tip**: Sabrás que el entorno está activo cuando veas `(env)` al inicio de tu línea de comandos.

#### 2.2 Instalar Dependencias

```bash
cd backend-drf
pip install -r requirements.txt
```

Las principales dependencias incluyen:
- Django 5.2
- Django REST Framework
- TensorFlow/Keras
- yfinance
- scikit-learn
- NumPy, Pandas

#### 2.3 Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend-drf/`:

```bash
# Windows PowerShell
@"
SECRET_KEY=tu-clave-secreta-super-segura-aqui
DEBUG=True
"@ | Out-File -FilePath .env -Encoding UTF8

# Linux/MacOS
cat > .env << EOF
SECRET_KEY=tu-clave-secreta-super-segura-aqui
DEBUG=True
EOF
```

> ⚠️ **Importante**: En producción, `DEBUG` debe ser `False` y `SECRET_KEY` debe ser una clave única y compleja.

#### 2.4 Ejecutar Migraciones

```bash
python manage.py migrate
```

#### 2.5 Crear Superusuario (Opcional)

```bash
python manage.py createsuperuser
```

Sigue las instrucciones para crear un usuario administrador.

#### 2.6 Verificar el Modelo ML

Asegúrate de que el archivo `stock_prediction_model.keras` existe en `backend-drf/`. Este es el modelo LSTM pre-entrenado.

#### 2.7 Iniciar el Servidor Backend

```bash
python manage.py runserver
```

El servidor estará disponible en: `http://127.0.0.1:8000/`

---

### 3. Configurar el Frontend (React)

#### 3.1 Navegar al Directorio Frontend

```bash
# Desde la raíz del proyecto
cd frontend-react
```

#### 3.2 Instalar Dependencias

```bash
npm install
```

#### 3.3 Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `frontend-react/`:

```bash
# Windows PowerShell
echo "VITE_BACKEND_BASE_API=http://127.0.0.1:8000/api/v1" | Out-File -FilePath .env -Encoding UTF8

# Linux/MacOS
echo "VITE_BACKEND_BASE_API=http://127.0.0.1:8000/api/v1" > .env
```

#### 3.4 Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173/`

---

## ✅ Verificar la Instalación

### 1. Verificar Backend

Abre tu navegador y visita:
- API Root: `http://127.0.0.1:8000/api/v1/`
- Admin Panel: `http://127.0.0.1:8000/admin/`

### 2. Verificar Frontend

Visita `http://localhost:5173/` y deberías ver la página de inicio de NeuroStock.

### 3. Prueba de Integración

1. Regístrate con un nuevo usuario
2. Inicia sesión
3. En el dashboard, ingresa un ticker (ej: `AAPL`)
4. Deberías ver los gráficos y métricas de predicción

---

## 🐛 Solución de Problemas

### Error: "Model file not found"

```
FileNotFoundError: Model file not found: stock_prediction_model.keras
```

**Solución**: Asegúrate de que el archivo `stock_prediction_model.keras` está en `backend-drf/`.

### Error: "CORS blocked"

**Solución**: Verifica que `corsheaders` está en `INSTALLED_APPS` y `CORS_ALLOW_ALL_ORIGINS = True` en desarrollo.

### Error: "Module not found"

**Solución**: Asegúrate de que el entorno virtual está activado y las dependencias están instaladas.

```bash
pip install -r requirements.txt
```

### Error: "Connection refused" en Frontend

**Solución**: Verifica que el backend está corriendo en el puerto 8000 y que la URL en `.env` del frontend es correcta.

---

## 🚀 Comandos Útiles

### Backend

```bash
# Activar entorno virtual
.\env\Scripts\Activate.ps1

# Ejecutar servidor
python manage.py runserver

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Shell de Django
python manage.py shell
```

### Frontend

```bash
# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Lint del código
npm run lint
```

---

## 📦 Estructura de Archivos de Configuración

```
NeuroStock/
├── backend-drf/
│   ├── .env                          # Variables de entorno backend
│   ├── requirements.txt              # Dependencias Python
│   ├── manage.py                     # CLI de Django
│   └── stock_prediction_model.keras  # Modelo LSTM
│
└── frontend-react/
    ├── .env                          # Variables de entorno frontend
    ├── package.json                  # Dependencias Node.js
    └── vite.config.js                # Configuración de Vite
```

---

## 🔜 Siguiente Paso

Una vez instalado, consulta la [Arquitectura del Proyecto](ARCHITECTURE.md) para entender cómo funciona el sistema.
