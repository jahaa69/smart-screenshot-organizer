const newPath = `${process.env.HOME || process.env.USERPROFILE}/Pictures/ScreenshotsOrganized`
const oldPath = `${process.env.HOME || process.env.USERPROFILE}/Pictures/Screenshots`
const fs = require('fs')
const path = require('path')

function mooveFile(file) {
    const oldFilePath = path.join(oldPath, file)
    const newFilePath = path.join(newPath, file)
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath)
    }
    fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
            console.error('Error moving file:', err)
        } else {
            console.log(`File ${file} moved to ${newPath}`)
        }
    })
}


module.exports = {
    mooveFile
}