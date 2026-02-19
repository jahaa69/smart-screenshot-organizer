// Path to the directory screenshots default on Windows ingnore user's namme pc
const pathImg = `${process.env.HOME || process.env.USERPROFILE}/Pictures/Screenshots`
const fs = require('fs')
const chokidar = require('chokidar')

// Initialize watcher.
const watcher = chokidar.watch(pathImg, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
})

// recupere le nom des fichiers dans le dossier
function getFiles() {
  return new Promise((resolve, reject) => {
    fs.readdir(pathImg, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err)
        reject(err)
        return
      }
      console.log('Files in directory:', files)
      resolve(files)
    }) 
  })
}


//export la fonction getFiles pour pouvoir l'utiliser dans mainPage.js
module.exports = {
  getFiles
}
