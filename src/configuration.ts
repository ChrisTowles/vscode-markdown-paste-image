import { Constants } from "./constants";
import vscode from 'vscode';
import path from "path";
import { ILogger } from "./logger";

export interface  Configuration {
    prefixConfig: string;
    suffixConfig: string;
    forceUnixStyleSeparatorConfig:  string;
    encodePathConfig:  string;
    namePrefixConfig:  string;
    nameSuffixConfig:  string;
    insertPatternConfig:  string;
    showFilePathConfirmInputBox:  boolean,
    filePathConfirmInputBoxMode:  string;
    defaultNameConfig:  string;
    folderPathConfig:  string;
    basePathConfig:  string;

}

const PATH_VARIABLE_CURRENT_FILE_DIR = /\$\{currentFileDir\}/g;
const PATH_VARIABLE_PROJECT_ROOT = /\$\{projectRoot\}/g;
const PATH_VARIABLE_CURRENT_FILE_NAME = /\$\{currentFileName\}/g;
const PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT = /\$\{currentFileNameWithoutExt\}/g;



export const loadConfiguration = ({ projectPath, filePath }: { projectPath: string; filePath: string;}): Configuration => {
    const configuration = vscode.workspace.getConfiguration(Constants.ConfigurationName)


    let defaultNameConfig = configuration['defaultName']
    let folderPathConfig = configuration['path']
    let basePathConfig = configuration['basePath']
    let prefixConfig = configuration['prefix'];
    let suffixConfig = configuration['suffix'];
    let forceUnixStyleSeparatorConfig = configuration['forceUnixStyleSeparator'];
    
    let encodePathConfig =  configuration['encodePath'];
    let namePrefixConfig =  configuration['namePrefix'];
    let nameSuffixConfig =  configuration['nameSuffix'];
    let insertPatternConfig =  configuration['insertPattern'];
    let showFilePathConfirmInputBox=  configuration['showFilePathConfirmInputBox'] || false;
    let filePathConfirmInputBoxMode =  configuration['filePathConfirmInputBoxMode'];
    
    
  // load config pasteImage.defaultName
  
  if (!defaultNameConfig) {
      defaultNameConfig = "yyyy-LL-dd-HH-mm-ss"
  }

  // load config pasteImage.path
  
  if (!folderPathConfig) {
      folderPathConfig = "${currentFileDir}";
  }
  if (folderPathConfig.length !== folderPathConfig.trim().length) {
      const errorMsg = `The config ${Constants.ConfigurationName}.path = '${folderPathConfig}' is invalid. please check your config.`;
      throw new Error(errorMsg);
  }
    
  if (!basePathConfig) {
      basePathConfig = "";
  }

  if (basePathConfig.length !== basePathConfig.trim().length) {
      const errorMsg = `The config pasteImage.path = '${basePathConfig}' is invalid. please check your config.`;
      throw new Error(errorMsg);
  }

    forceUnixStyleSeparatorConfig = !!forceUnixStyleSeparatorConfig;

    defaultNameConfig = replacePathVariable(defaultNameConfig, projectPath, filePath, (x) => `[${x}]`);
    folderPathConfig = replacePathVariable(folderPathConfig, projectPath, filePath);
    basePathConfig = replacePathVariable(basePathConfig, projectPath, filePath);
    namePrefixConfig = replacePathVariable(namePrefixConfig, projectPath, filePath);
    nameSuffixConfig = replacePathVariable(nameSuffixConfig, projectPath, filePath);
    insertPatternConfig = replacePathVariable(insertPatternConfig, projectPath, filePath);
    

    const config: Configuration = {
  
        // load other config
        defaultNameConfig: defaultNameConfig,
        prefixConfig: prefixConfig,
        suffixConfig:  suffixConfig,
        forceUnixStyleSeparatorConfig:  forceUnixStyleSeparatorConfig,
        encodePathConfig:  encodePathConfig,
        namePrefixConfig:  namePrefixConfig,
        nameSuffixConfig:  nameSuffixConfig,
        insertPatternConfig:  insertPatternConfig,
        showFilePathConfirmInputBox:  showFilePathConfirmInputBox,
        filePathConfirmInputBoxMode:  filePathConfirmInputBoxMode,
        folderPathConfig:  folderPathConfig,
        basePathConfig:  basePathConfig,

    };

    return config;

}


export const replacePathVariable = (pathStr: string, projectRoot: string, curFilePath: string, postFunction: (val: string) => string = (x) => x): string => {
    let currentFileDir = path.dirname(curFilePath);
    let ext = path.extname(curFilePath);
    let fileName = path.basename(curFilePath);
    let fileNameWithoutExt = path.basename(curFilePath, ext);

    pathStr = pathStr.replace(PATH_VARIABLE_PROJECT_ROOT, postFunction(projectRoot));
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_DIR, postFunction(currentFileDir));
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_NAME, postFunction(fileName));
    pathStr = pathStr.replace(PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT, postFunction(fileNameWithoutExt));
    return pathStr;
}
    
