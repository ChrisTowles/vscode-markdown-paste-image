import * as upath from 'upath';
import * as fse from 'fs-extra';
import type { ILogger } from './logger';

export const ensureFileAndGetItsDirectory = async (filePath: string): Promise<string> => {
  if (await fse.pathExists(filePath)) {
    const folderStat = await fse.stat(filePath);
    if (folderStat.isDirectory())
      throw new Error(`Not a file but instead a directory: ${filePath}`);
  }
  else {
    throw new Error(`File not found: ${filePath}`);
  }
  return upath.dirname(filePath);
};

export const ensurePathIsDirectory = async (dirPath: string): Promise<string> => {
  if (await fse.pathExists(dirPath)) {
    const folderStat = await fse.stat(dirPath);
    if (!folderStat.isDirectory())
      throw new Error(`Path is file instead of a directory: ${dirPath}`);
  }
  else {
    throw new Error(`Path not found: ${dirPath}`);
  }
  return dirPath;
};

export const createImageDirWithImagePath = async (imagePath: string): Promise<string> => {
  const imageDir = upath.dirname(imagePath);

  let createDirectory = true;
  if (await fse.pathExists(imageDir)) {
    const folderStat = await fse.stat(imageDir);
    if (folderStat.isDirectory())
      createDirectory = false;
  }

  if (createDirectory)
    await fse.mkdir(imageDir, { recursive: true });

  return imageDir;
};

export async function ensureFileExistsOrThrow(scriptPath: string, logger: ILogger): Promise<boolean> {
  if (!await fse.pathExists(scriptPath)) {
    const errorMsg = `Script file not found: ${scriptPath}`;
    logger.showErrorMessage(errorMsg);
    throw new Error(errorMsg);
  }
  return true;
}

/**
   * create directory for image when directory does not exist
   */

export const ensurePngAddedToFileName = (userEnteredFileName: string): string => {
  if (!userEnteredFileName.toLowerCase().endsWith('.png'))
    userEnteredFileName += '.png';
  return userEnteredFileName;
};

export const ensureImageExtensionAddedToFileName = (userEnteredFileName: string, defaultExtension: string = '.png'): string => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', '.tif'];
  const hasImageExtension = imageExtensions.some(ext => 
    userEnteredFileName.toLowerCase().endsWith(ext)
  );
  
  if (!hasImageExtension) {
    userEnteredFileName += defaultExtension;
  }
  return userEnteredFileName;
};

export const makeImagePath = ({ imageFolderPath, fileName, editorOpenFilePath }: { imageFolderPath: string; fileName: string; editorOpenFilePath: string }): string => {
  // image output path
  const folderPath = upath.dirname(editorOpenFilePath);
  let imagePath = '';

  // generate image path
  if (upath.isAbsolute(imageFolderPath)) {
    imagePath = upath.join(imageFolderPath, fileName);
  }
  else {
    // incase its relative path
    imagePath = upath.join(folderPath, imageFolderPath, fileName);
  }

  return imagePath;
};
