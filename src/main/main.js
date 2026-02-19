const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const { setupIPCHandlers } = require('./IPCHandler.js')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('src/renderer/views/main.html')
  return win
}

let mainWindow;

app.whenReady().then(() => {
  mainWindow = createWindow()
  setupIPCHandlers(mainWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})