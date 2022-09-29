import type { WorkspaceConfiguration } from 'vscode';
import upath from 'upath';
import { Constants } from './constants';
import { ensureFileAndGetItsDirectory } from './folderUtil';

export interface Configuration {

  readonly defaultImageName: string
  readonly imageFolderPath: string

  readonly insertPattern: string
  readonly showFilePathConfirmInputBox: boolean
  readonly filePathConfirmInputBoxMode: FilePathConfirmInputBoxModeEnum
  readonly encodePath: EncodePathEnum

  // used to prefix and suffix the image name
  readonly imageNamePrefix: string
  readonly imageNameSuffix: string

  // used for image url prefix and suffix
  readonly imageUriPathPrefix: string
  readonly imageUriPathSuffix: string
  readonly projectRootDirPath: string
  readonly editorOpenFolderPath: string

}

export enum FilePathConfirmInputBoxModeEnum {
  OnlyName = 'onlyName',
  FullPath = 'fullPath',
}

export enum EncodePathEnum {
  None = 'none',
  UrlEncode = 'urlEncode',
  UrlEncodeSpace = 'urlEncodeSpace',
}

// Variables that can be used to replace values in config paths
const PATH_VARIABLE_CURRENT_FILE_DIR = /\$\{currentFileDir\}/g;
const PATH_VARIABLE_PROJECT_ROOT_DIR = /\$\{projectRoot\}/g;
const PATH_VARIABLE_CURRENT_FILE_NAME = /\$\{currentFileName\}/g;
const PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT = /\$\{currentFileNameWithoutExt\}/g;

export const replacePathVariable = ({ pathStr, projectRootDirPath, editorOpenFilePath }: { pathStr: string; projectRootDirPath: string; editorOpenFilePath: string }): string => {
  const currentFileDir = upath.dirname(editorOpenFilePath);
  const ext = upath.extname(editorOpenFilePath);
  const fileName = upath.basename(editorOpenFilePath);
  const fileNameWithoutExt = upath.basename(editorOpenFilePath, ext);

  pathStr = pathStr.replace(PATH_VARIABLE_PROJECT_ROOT_DIR, projectRootDirPath);
  pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_DIR, currentFileDir);
  pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_NAME, fileName);
  pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT, fileNameWithoutExt);
  return pathStr;
};

export const parseConfigurationToConfig = async ({ projectRootDirPath, editorOpenFilePath, configuration }: { projectRootDirPath: string; editorOpenFilePath: string; configuration: WorkspaceConfiguration }): Promise<Configuration> => {
  const editorOpenFolderPath = await ensureFileAndGetItsDirectory(editorOpenFilePath);

  // Luxon Values used in ImageName = https://moment.github.io/luxon/#/formatting?id=table-of-tokens
  let defaultImageName = configuration.get<string>(Constants.Config_DefaultImageName, 'yyyy-LL-dd-HH-mm-ss');

  // eslint-disable-next-line no-template-curly-in-string
  let imageFolderPath = configuration.get<string>(Constants.Config_ImageFolderPath, '${currentFileDir}');

  const encodePath = configuration.get<EncodePathEnum>(Constants.Config_EncodePath, EncodePathEnum.UrlEncodeSpace);
  let insertPattern = configuration.get<string>(Constants.Config_InsertPattern, '');

  const imageUriPathPrefix = configuration.get<string>(Constants.Config_ImageUriPathPrefix, '');
  const imageUriPathSuffix = configuration.get<string>(Constants.Config_ImageUriPathSuffix, '');
  let imageNamePrefix = configuration.get<string>(Constants.Config_ImageNamePrefix, '');
  let imageNameSuffix = configuration.get<string>(Constants.Config_ImageNameSuffix, '');

  const showFilePathConfirmInputBox = configuration.get<boolean>(Constants.Config_ShowFilePathConfirmInputBox, true);
  const filePathConfirmInputBoxMode = configuration.get<FilePathConfirmInputBoxModeEnum>(Constants.Config_FilePathConfirmInputBoxMode, FilePathConfirmInputBoxModeEnum.FullPath);

  if (imageFolderPath.length !== imageFolderPath.trim().length) {
    const errorMsg = `The config ${Constants.ConfigurationName}.path = '${imageFolderPath}' is invalid. please check your config.`;
    throw new Error(errorMsg);
  }

  defaultImageName = replacePathVariable({ pathStr: defaultImageName, projectRootDirPath, editorOpenFilePath });
  imageFolderPath = replacePathVariable({ pathStr: imageFolderPath, projectRootDirPath, editorOpenFilePath });
  imageNamePrefix = replacePathVariable({ pathStr: imageNamePrefix, projectRootDirPath, editorOpenFilePath });
  imageNameSuffix = replacePathVariable({ pathStr: imageNameSuffix, projectRootDirPath, editorOpenFilePath });
  insertPattern = replacePathVariable({ pathStr: insertPattern, projectRootDirPath, editorOpenFilePath });

  const config: Configuration = {

    // load other config
    defaultImageName,
    imageFolderPath,

    encodePath,

    insertPattern,
    showFilePathConfirmInputBox,
    filePathConfirmInputBoxMode,

    imageNamePrefix,
    imageNameSuffix,

    imageUriPathPrefix,
    imageUriPathSuffix,
    projectRootDirPath,
    editorOpenFolderPath,

  };

  return config;
};

