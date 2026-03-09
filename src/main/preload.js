// Expose IPC API to renderer
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getFiles: () => ipcRenderer.invoke('get-files'),
  getOrganizedFiles: () => ipcRenderer.invoke('get-organized-files'),
  moveFile: (file) => ipcRenderer.invoke('move-file', file),
  setAutoOrganize: (value) => ipcRenderer.invoke('set-auto-organize', value),
  getStats: () => ipcRenderer.invoke('get-stats'),
  startWatcher: () => ipcRenderer.invoke('start-watcher'),
  onStatsUpdated: (callback) => ipcRenderer.on('stats-updated', (event, stats) => callback(stats)),
  onFileOrganized: (callback) => ipcRenderer.on('file-organized', (event, data) => callback(data))
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})