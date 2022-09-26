import { Constants } from "./constants";
import { WorkspaceConfiguration } from 'vscode';
import path from "path";
import { ILogger } from "./logger";

export interface Configuration {
    
    encodePathConfig: string;

    insertPatternConfig: string;
    showFilePathConfirmInputBox: boolean,
    filePathConfirmInputBoxMode: string;
    

    defaultImageName: string;
    imageFolderPath: string;

    // used to prefix and suffix the image name
    imageNamePrefix: string;
    imageNameSuffix: string;
    
    // used for image url prefix and suffix
    imageUriPathPrefix: string;
    imageUriPathSuffix: string;

}

export const parseConfigurationToConfig = ({ projectPath, editorOpenFilePath, configuration }: { projectPath: string; editorOpenFilePath: string; configuration: WorkspaceConfiguration }): Configuration => {

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
    let filePathConfirmInputBoxMode = configuration.get<string>(Constants.Config_FilePathConfirmInputBoxMode, "inputBox");


    if (imageFolderPath.length !== imageFolderPath.trim().length) {
        const errorMsg = `The config ${Constants.ConfigurationName}.path = '${imageFolderPath}' is invalid. please check your config.`;
        throw new Error(errorMsg);
    }
    

    defaultImageName = replacePathVariable({ pathStr: defaultImageName, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    imageFolderPath = replacePathVariable({ pathStr: imageFolderPath, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    imageNamePrefix = replacePathVariable({ pathStr: imageNamePrefix, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    imageNameSuffix = replacePathVariable({ pathStr: imageNameSuffix, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    insertPatternConfig = replacePathVariable({ pathStr: insertPatternConfig, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });


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

    };

    return config;

}

// Variables that can be used to replace values in config paths
const PATH_VARIABLE_CURRENT_FILE_DIR = /\$\{currentFileDir\}/g;
const PATH_VARIABLE_PROJECT_ROOT = /\$\{projectRoot\}/g;
const PATH_VARIABLE_CURRENT_FILE_NAME = /\$\{currentFileName\}/g;
const PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT = /\$\{currentFileNameWithoutExt\}/g;

export const replacePathVariable = ({ pathStr, projectRoot, editorOpenFilePath }: { pathStr: string; projectRoot: string; editorOpenFilePath: string }): string => {
    let currentFileDir = path.dirname(editorOpenFilePath);
    let ext = path.extname(editorOpenFilePath);
    let fileName = path.basename(editorOpenFilePath);
    let fileNameWithoutExt = path.basename(editorOpenFilePath, ext);

    pathStr = pathStr.replace(PATH_VARIABLE_PROJECT_ROOT, projectRoot);
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_DIR, currentFileDir);
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_NAME, fileName);
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT, fileNameWithoutExt);
    return pathStr;
}

