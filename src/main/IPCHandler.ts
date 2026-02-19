const { ipcMain } = require('electron')
const { getFiles } = require('./ScreenshotWatcher.js')

function setupIPCHandlers() {
  // Handle get files request
  ipcMain.handle('get-files', async () => {
    return new Promise((resolve, reject) => {
      getFiles().then(files => resolve(files)).catch(err => reject(err))
    })
  })

  // Handle get stats request
  ipcMain.handle('get-stats', async () => {
    return {
      screenshotsToday: 0,
      totalOrganized: 0,
      lastFile: null,
      lastOrganized: null,
      nextFile: null,
      isAutoOrganize: true,
      diskUsage: 0.28
    }
  })

  // Handle set auto organize
  ipcMain.handle('set-auto-organize', async (event, value) => {
    console.log('Auto organize set to:', value)
    return true
  })

  // Handle start watcher
  ipcMain.handle('start-watcher', async () => {
    console.log('Watcher started')
    return true
  })
}

module.exports = { setupIPCHandlers }
