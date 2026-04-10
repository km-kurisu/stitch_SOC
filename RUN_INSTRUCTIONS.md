# Running Stitch SOC Application

This guide provides step-by-step instructions on how to install dependencies and run the Stitch SOC Desktop Application.

## Prerequisites
- **Python 3.10+** (ensure `python` or `python3` is available in your PATH)
- **Node.js 18+** (ensure `npm` is available in your PATH)

## Step 1: Install Backend Dependencies

The backend is built with Python and FastAPI. It requires several system monitoring libraries.

Open a terminal and run the following commands to create a virtual environment and install the dependencies:

**For Windows:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
python -m pip install -r requirements.txt
```

**For Linux/macOS:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Step 2: Install Frontend Dependencies

The frontend is a Next.js application styled with Tailwind CSS.

Open a new terminal and run:
```bash
cd frontend
npm install
```

## Step 3: Install Electron Dependencies

The Electron shell wraps the application into a desktop environment.

Open a new terminal and run:
```bash
cd electron
npm install
```

## Step 4: Run the Application

The application consists of three parts. The Electron shell is configured to automatically launch the backend, but you can also run all pieces separately for debugging.

### Option A: Run via Electron (Auto-starts backend)

1. **Start the Next.js Frontend:**
   ```bash
   # From the project root
   cd frontend
   npm run dev
   ```
   *Wait a few seconds for Next.js to compile on `http://localhost:3000`.*

2. **Start the Electron Desktop App:**
   Open a separate terminal window:
   ```bash
   # From the project root
   cd electron
   npm start
   ```
   *This will automatically spawn the Python backend in the background and open the application window.*

### Option B: Run Backend Manually (For Debugging)

If you need to see backend output or if the auto-start fails, run the backend manually:

1. **Start the Python Backend:**
   Open a terminal and ensure your virtual environment is activated.
   ```bash
   # From the project root
   cd backend
   # Ensure venv is activated (see Step 1)
   python -m uvicorn main:app --port 8000 --reload
   ```
   
2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **View in Browser:**
   Open `http://localhost:3000` in your web browser.

## Packaging for Production (Optional)

If you wish to build standalone executables (.exe for Windows, .deb/AppImage for Linux):

1. Build the Next.js static files (requires configuring Next.js for static export).
2. Use electron-builder:
   ```bash
   cd electron
   npm run dist
   ```
