const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { FILES_FOLDER } = require('../utils/constant.helper')
const { translateResponseMessage } = require('../utils/functions')

// const upload = multer({ storage: multer.memoryStorage() });

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (!fs.existsSync(path.join(__dirname, '../../public'))) {
            fs.mkdirSync(path.join(__dirname, '../../public'))
        }

        let folderName
        if (file.fieldname === 'user_image')
            folderName = FILES_FOLDER.profilePicture

        if (!fs.existsSync(`./${FILES_FOLDER.public}/${folderName}`)) {
            fs.mkdirSync(`./${FILES_FOLDER.public}/${folderName}`)
        }
        cb(null, `${FILES_FOLDER.public}/${folderName}`)
    },
    filename(req, file, cb) {
        if (file) {
            const fileExt = path.extname(file.originalname).toLowerCase()
            if (
                file.fieldname === 'user_image' &&
                !['.jpeg', '.jpg', '.png'].includes(fileExt)
            ) {
                cb({
                    statusCode: 400,
                    message: translateResponseMessage(
                        req,
                        'invalid_file',
                        'image_type'
                    ),
                })
            }

            cb(null, Date.now() + fileExt)
            return file
        }
    },
})

const upload = multer({
    storage,
    limits: { files: 50, fileSize: 10196090 },
})

module.exports = upload
