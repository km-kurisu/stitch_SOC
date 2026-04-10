const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const os = require('os')

let mainWindow
let backendProcess

function startBackend() {
    const isWindows = os.platform() === 'win32'
    const backendDir = path.join(__dirname, '..', 'backend')

    // Resolve venv Python executable directly — bypasses PATH entirely
    const pythonExe = isWindows
        ? path.join(backendDir, 'venv', 'Scripts', 'python.exe')
        : path.join(backendDir, 'venv', 'bin', 'python')

    // On Windows, quote the path in case of spaces, pass via cmd shell
    const args = ['-m', 'uvicorn', 'main:app', '--port', '8000']

    backendProcess = spawn(pythonExe, args, {
        cwd: backendDir,
        shell: isWindows,  // needed on Windows for .exe resolution
        env: { ...process.env, PYTHONPATH: backendDir }
    })

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`)
    })

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`)
    })
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true
    })

    // Load the Next.js app
    // In dev: mainWindow.loadURL('http://localhost:3000')
    // In prod: load from frontend/.next/server/app or custom server
    mainWindow.loadURL('http://localhost:3000')
}

app.whenReady().then(() => {
    startBackend()

    // Wait a moment for Next.js to start in dev, or just load directly 
    setTimeout(() => {
        createWindow()
    }, 2000)

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
    // Kill backend process when electron quits
    if (backendProcess) {
        if (os.platform() === 'win32') {
            spawn("taskkill", ["/pid", backendProcess.pid, '/f', '/t'])
        } else {
            backendProcess.kill('SIGTERM')
        }
    }
})

// Example IPC handler
ipcMain.handle('get-os-info', () => {
    return {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch()
    }
})
