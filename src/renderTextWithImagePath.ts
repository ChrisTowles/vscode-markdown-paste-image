import { Configuration } from "./configuration";
import * as path from 'path';
import * as upath from 'upath';
import { ILogger } from './logger';


const PATH_VARIABLE_IMAGE_FILE_PATH = /\$\{imageFilePath\}/g;
const PATH_VARIABLE_IMAGE_ORIGINAL_FILE_PATH = /\$\{imageOriginalFilePath\}/g;
const PATH_VARIABLE_IMAGE_FILE_NAME = /\$\{imageFileName\}/g;
const PATH_VARIABLE_IMAGE_FILE_NAME_WITHOUT_EXT = /\$\{imageFileNameWithoutExt\}/g;
const PATH_VARIABLE_IMAGE_SYNTAX_PREFIX = /\$\{imageSyntaxPrefix\}/g;
const PATH_VARIABLE_IMAGE_SYNTAX_SUFFIX = /\$\{imageSyntaxSuffix\}/g;

/**
     * render the image file path dependent on file type
     * e.g. in markdown image file path will render to ![](path)
     */
export const renderTextWithImagePath = ({ languageId, config, imageFilePath, logger }: { languageId: string; config: Configuration; imageFilePath: string; logger: ILogger; }): string => {

    logger.debug('renderFilePath start');
    logger.debug('config.imageFolderPath         = ' + config.imageFolderPath);
    logger.debug('imageFilePath                  = ' + imageFilePath);
    imageFilePath = path.relative(config.imageFolderPath, imageFilePath);
    
    logger.debug('imageFilePath  after relative  = ' + imageFilePath);
    //Normalize a string path, reducing '..' and '.' parts.
    // * When multiple slashes are found, they're replaced by a single one; when the path contains a trailing slash, it is preserved. On Windows backslashes are used.
    imageFilePath = upath.normalize(imageFilePath);
    logger.debug('imageFilePath  after normalize = ' + imageFilePath);
    

    let originalImagePath = imageFilePath;
    let ext = path.extname(originalImagePath);
    let fileName = path.basename(originalImagePath);
    let fileNameWithoutExt = path.basename(originalImagePath, ext);
    
    imageFilePath = `${config.imageUriPathPrefix}${imageFilePath}${config.imageUriPathSuffix}`;

    if (config.encodePathConfig == "urlEncode") {
        imageFilePath = encodeURI(imageFilePath)
    } else if (config.encodePathConfig == "urlEncodeSpace") {
        imageFilePath = imageFilePath.replace(/ /g, "%20");
    }

    let imageSyntaxPrefix = "";
    let imageSyntaxSuffix = ""
    switch (languageId) {
        case "markdown":
            imageSyntaxPrefix = `![](`
            imageSyntaxSuffix = `)`
            break;
        case "asciidoc":
            imageSyntaxPrefix = `image::`
            imageSyntaxSuffix = `[]`
            break;
    }

    let result = config.insertPatternConfig
    result = result.replace(PATH_VARIABLE_IMAGE_SYNTAX_PREFIX, imageSyntaxPrefix);
    result = result.replace(PATH_VARIABLE_IMAGE_SYNTAX_SUFFIX, imageSyntaxSuffix);

    result = result.replace(PATH_VARIABLE_IMAGE_FILE_PATH, imageFilePath);
    result = result.replace(PATH_VARIABLE_IMAGE_ORIGINAL_FILE_PATH, originalImagePath);
    result = result.replace(PATH_VARIABLE_IMAGE_FILE_NAME, fileName);
    result = result.replace(PATH_VARIABLE_IMAGE_FILE_NAME_WITHOUT_EXT, fileNameWithoutExt);

    return result;
}
