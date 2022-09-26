
import * as path from 'path';
import * as fse from 'fs-extra';


export const ensureFileAndGetItsDirectory = async (filePath: string): Promise<string> => {

    if (await fse.pathExists (filePath)) {
        
        let folderStat = await fse.stat(filePath)
        if (folderStat.isDirectory()){
            throw new Error(`Not a file but instead a directory: ${filePath}`);
        }
    } else {
        throw new Error(`File not found: ${filePath}`);
    }
    return path.dirname(filePath);

}


export const ensurePathIsDirectory = async (dirPath: string): Promise<string> => {

    if (await fse.pathExists (dirPath)) {
        
        let folderStat = await fse.stat(dirPath)
        if (!folderStat.isDirectory()){
            throw new Error(`Path is file instead of a directory: ${dirPath}`);
        }
    } else {
        throw new Error(`Path not found: ${dirPath}`);
    }
    return dirPath;

}


export const createImageDirWithImagePath = async (imagePath: string): Promise<string> => {

    let imageDir = path.dirname(imagePath);

    let createDirectory = true;
    if (await fse.pathExists (imageDir)) {
        
        let folderStat = await fse.stat(imageDir)
        if (folderStat.isDirectory()){
            createDirectory = false;
        }
    }

    if(createDirectory) {
        await fse.mkdir(imageDir, { recursive: true });
    }

    return imageDir;

}

  /**
     * create directory for image when directory does not exist
     */




export const ensurePngAddedToFileName = (userEnteredFileName: string): string => {
    if (!userEnteredFileName.toLowerCase().endsWith('.png'))
        userEnteredFileName += '.png';
    return userEnteredFileName;
}



export const makeImagePath = ({ imageFolderPath, fileName, editorOpenFilePath }: { imageFolderPath: string; fileName: string; editorOpenFilePath: string; }): string => {
    // image output path
    let folderPath = path.dirname(editorOpenFilePath);
    let imagePath = "";

    // generate image path
    if (path.isAbsolute(imageFolderPath)) {
        imagePath = path.join(imageFolderPath, fileName);
    } else {
        // incase its relative path
        imagePath = path.join(folderPath, imageFolderPath, fileName);
    }

    return imagePath;
}