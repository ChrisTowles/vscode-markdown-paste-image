import { Constants } from "./constants";
import { WorkspaceConfiguration } from 'vscode';
import path from "path";
import { ILogger } from "./logger";
import { ensureFileAndGetItsDirectory } from "./folderUtil";

export interface Configuration {
    
    readonly encodePathConfig: string;

    readonly insertPatternConfig: string;
    readonly showFilePathConfirmInputBox: boolean,
    readonly filePathConfirmInputBoxMode: FilePathConfirmInputBoxModeEnum;
    

    readonly defaultImageName: string;
    readonly imageFolderPath: string;

    // used to prefix and suffix the image name
    readonly imageNamePrefix: string;
    readonly imageNameSuffix: string;
    
    // used for image url prefix and suffix
    readonly imageUriPathPrefix: string;
    readonly imageUriPathSuffix: string;
    readonly projectRootDirPath: string;
    readonly editorOpenFolderPath: string;

}

export enum  FilePathConfirmInputBoxModeEnum {
    ONLY_NAME = "onlyName",
    FULL_PATH = "fullPath",
}

export const parseConfigurationToConfig = async ({ projectRootDirPath, editorOpenFilePath, configuration }: { projectRootDirPath: string; editorOpenFilePath: string; configuration: WorkspaceConfiguration }): Promise<Configuration> => {

    const editorOpenFolderPath = await ensureFileAndGetItsDirectory(editorOpenFilePath)
    

    // Luxon Values used in ImageName = https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    let defaultImageName = configuration.get<string>(Constants.Config_DefaultImageName, "yyyy-LL-dd-HH-mm-ss");
    let imageFolderPath = configuration.get<string>(Constants.Config_ImageFolderPath, "${currentFileDir}");
       

    let encodePathConfig = configuration.get<string>(Constants.Config_EncodePath, '');
    let insertPatternConfig = configuration.get<string>(Constants.Config_InsertPattern, '');


    let imageUriPathPrefix = configuration.get<string>(Constants.Config_ImageUriPathPrefix, '');
    let imageUriPathSuffix = configuration.get<string>(Constants.Config_ImageUriPathSuffix, '');
    let imageNamePrefix = configuration.get<string>(Constants.Config_ImageNamePrefix, '');
    let imageNameSuffix = configuration.get<string>(Constants.Config_ImageNameSuffix, '');
    
    let showFilePathConfirmInputBox = configuration.get<boolean>(Constants.Config_ShowFilePathConfirmInputBox, true);
    let filePathConfirmInputBoxMode = configuration.get<FilePathConfirmInputBoxModeEnum>(Constants.Config_FilePathConfirmInputBoxMode, FilePathConfirmInputBoxModeEnum.FULL_PATH);


    if (imageFolderPath.length !== imageFolderPath.trim().length) {
        const errorMsg = `The config ${Constants.ConfigurationName}.path = '${imageFolderPath}' is invalid. please check your config.`;
        throw new Error(errorMsg);
    }
    

    defaultImageName = replacePathVariable({ pathStr: defaultImageName, projectRootDirPath: projectRootDirPath, editorOpenFilePath: editorOpenFilePath });
    imageFolderPath = replacePathVariable({ pathStr: imageFolderPath, projectRootDirPath: projectRootDirPath, editorOpenFilePath: editorOpenFilePath });
    imageNamePrefix = replacePathVariable({ pathStr: imageNamePrefix, projectRootDirPath: projectRootDirPath, editorOpenFilePath: editorOpenFilePath });
    imageNameSuffix = replacePathVariable({ pathStr: imageNameSuffix, projectRootDirPath: projectRootDirPath, editorOpenFilePath: editorOpenFilePath });
    insertPatternConfig = replacePathVariable({ pathStr: insertPatternConfig, projectRootDirPath: projectRootDirPath, editorOpenFilePath: editorOpenFilePath });

    
    const config: Configuration = {

        // load other config
        defaultImageName: defaultImageName,
        imageFolderPath: imageFolderPath,

        encodePathConfig: encodePathConfig,
        
        insertPatternConfig: insertPatternConfig,
        showFilePathConfirmInputBox: showFilePathConfirmInputBox,
        filePathConfirmInputBoxMode: filePathConfirmInputBoxMode,
        
        

        imageNamePrefix: imageNamePrefix,
        imageNameSuffix: imageNameSuffix,

        imageUriPathPrefix: imageUriPathPrefix,
        imageUriPathSuffix: imageUriPathSuffix,
        projectRootDirPath: projectRootDirPath,
        editorOpenFolderPath: editorOpenFolderPath,

    };

    return config;

}

// Variables that can be used to replace values in config paths
const PATH_VARIABLE_CURRENT_FILE_DIR = /\$\{currentFileDir\}/g;
const PATH_VARIABLE_PROJECT_ROOT_DIR = /\$\{projectRoot\}/g;
const PATH_VARIABLE_CURRENT_FILE_NAME = /\$\{currentFileName\}/g;
const PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT = /\$\{currentFileNameWithoutExt\}/g;

export const replacePathVariable = ({ pathStr, projectRootDirPath, editorOpenFilePath }: { pathStr: string; projectRootDirPath: string; editorOpenFilePath: string }): string => {
    let currentFileDir = path.dirname(editorOpenFilePath);
    let ext = path.extname(editorOpenFilePath);
    let fileName = path.basename(editorOpenFilePath);
    let fileNameWithoutExt = path.basename(editorOpenFilePath, ext);

    pathStr = pathStr.replace(PATH_VARIABLE_PROJECT_ROOT_DIR, projectRootDirPath);
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_DIR, currentFileDir);
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_NAME, fileName);
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT, fileNameWithoutExt);
    return pathStr;
}

