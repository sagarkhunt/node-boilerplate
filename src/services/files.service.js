const fs = require('fs')
const httpStatus = require('http-status')
const path = require('path')
const ApiError = require('../utils/apiError')
const { FILES_FOLDER } = require('../utils/constant.helper')
const sharp = require('sharp')
const http = require('https')

// Upload images without compress
const uploadWithoutCompress = (file, uploadFolder) => {
    const ext = path.extname(file.originalname)

    // Check file formate
    if (ext != '.png' && ext != '.jpg' && ext != '.jpeg' && ext != '.webp') {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Only .png, .jpg and .jpeg format is allow.'
        )
    }

    // Check file size is greater than 10 MB?
    if (file.size > 10485760) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Maximum image size limit is 10 MB.'
        )
    }

    const dir = `./${FILES_FOLDER.public}/${uploadFolder}`
    const tempFileName = `file_${Date.now()}.${ext}`
    const fileName = `${dir}/${tempFileName}`

    // Check that if directory is present or not.
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(fileName, file.buffer, 'base64')

    return tempFileName
}

/** delete file */
const deleteFile = (file) => {
    try {
        if (fs.existsSync(`${FILES_FOLDER.public}/${file}`))
            fs.unlinkSync(`${FILES_FOLDER.public}/${file}`)
        return true
    } catch (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong.')
    }
}

/** Create webp file */
const createWebpFile = (fileName, uploadFolder) => {
    const newFileName = `${fileName.split('.')[0]}`
    const srcPath = `${FILES_FOLDER.public}/${fileName}`
    const destPath = `${FILES_FOLDER.public}/${uploadFolder}/${newFileName}.webp`
    sharp(srcPath).resize(320, 240).toFile(`${destPath}`)
    return destPath.replace(`${FILES_FOLDER.public}/`, '')
}

/** file upload from url */
const uploadUrlFile = (url, uploadFolder) => {
    const dir = `./${FILES_FOLDER.public}/${uploadFolder}`
    const newFileName = `file_${Date.now()}.jpg`
    const destPath = `${FILES_FOLDER.public}/${uploadFolder}/${newFileName}`
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const newFile = fs.createWriteStream(`${destPath}`)
    http.get(`${url}`, function (response) {
        response.pipe(newFile)

        // after download completed close file stream
        newFile.on('finish', () => {
            newFile.close()
            console.log('Download Completed')
        })
    })

    return newFileName
}

module.exports = {
    uploadWithoutCompress,
    deleteFile,
    createWebpFile,
    uploadUrlFile,
}
