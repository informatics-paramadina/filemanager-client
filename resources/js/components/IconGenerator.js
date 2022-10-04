import { FcLock, FcFolder, FcImageFile, FcQuestions, FcSafe } from "react-icons/fc"
const IconGenerator = ({ mime_type, size }) => {
    // console.log(mime_type)
    switch (mime_type) {
        case "directory":
            return <FcFolder size={size} />
        case "image/jpeg":
        case "image/png":
        case "image/jpg":
            return <FcImageFile size={size} />
        case "application/x-rar":
        case "application/zip":
            return <FcSafe size={size} />
        default:
            return <FcQuestions size={size} />
            break;
    }
}

export default IconGenerator
