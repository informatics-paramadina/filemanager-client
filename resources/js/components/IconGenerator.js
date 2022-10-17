import { FcLock, FcFolder, FcImageFile, FcQuestions, FcSafe } from "react-icons/fc"
import {Image} from "@mantine/core";
import {zipLogo, winrarLogo, javascriptLogo, javaLogo, jsonLogo} from "../images/programming";
import {
    docsLogo,
    excelLogo,
    exeLogo,
    formsLogo, imageLogo,
    movLogo,
    pdfLogo,
    powerPointLogo,
    sevenZipLogo, sheetsLogo,
    wordLogo
} from "../images";
const IconGenerator = ({ mime_type, size }) => {
    // console.log(mime_type)
    switch (mime_type) {
        case "directory":
            return <FcFolder size={size} />
        case "image/jpeg":
        case "image/png":
        case "image/jpg":
            return <Image src={imageLogo} />
        case "video/mp4":
        case "video/webm":
        case "video/x-m4v":
        case "video/quicktime":
            return <Image src={movLogo} />
        case "application/x-msdownload":
            return <Image src={exeLogo} />
        case "application/x-rar":
            return <Image src={winrarLogo} />
        case "application/pdf":
            return <Image src={pdfLogo} />
        case "application/zip":
            return <Image src={zipLogo} />
        case "application/x-7z-compressed":
            return <Image src={sevenZipLogo} />
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return <Image src={wordLogo} />
        case "application/vnd.ms-excel":
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return <Image src={excelLogo} />
        case "application/vnd.ms-powerpoint":
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return <Image src={powerPointLogo} />
        case "application/vnd.google-apps.document":
            return <Image src={docsLogo} />
        case "application/vnd.google-apps.form":
            return <Image src={formsLogo} />
        case "application/vnd.google-apps.spreadsheet":
            return <Image src={sheetsLogo} />

        // programming
        case "text/javascript":
            return <Image src={javascriptLogo} />
        case "application/java-archive":
            return <Image src={javaLogo} />
        case "application/json":
            return <Image src={jsonLogo} />

        default:
            return <FcQuestions size={size} />
            break;
    }
}

export default IconGenerator
