
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

export const makeImagePath = ({ folderPathFromConfig, fileName, filePath }: { folderPathFromConfig: string; fileName: string; filePath: string; }): string => {
    // image output path
    let folderPath = path.dirname(filePath);
    let imagePath = "";

    // generate image path
    if (path.isAbsolute(folderPathFromConfig)) {
        imagePath = path.join(folderPathFromConfig, fileName);
    } else {
        imagePath = path.join(folderPath, folderPathFromConfig, fileName);
    }

    return imagePath;
}