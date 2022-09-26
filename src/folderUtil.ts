
import * as path from 'path';
import * as fse from 'fs-extra';

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