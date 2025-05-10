import { diskStorage } from "multer"
import { extname, join } from "path"

export const multerConfig = {
  storage: diskStorage({
    destination: join(__dirname, '../../public/upload-img'),
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = extname(file.originalname)
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`
      callback(null, filename)
    }
  })
}