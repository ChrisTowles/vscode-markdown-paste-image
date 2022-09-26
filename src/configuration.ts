import { Constants } from "./constants";
import { WorkspaceConfiguration } from 'vscode';
import path from "path";
import { ILogger } from "./logger";

export interface Configuration {
    prefixConfig: string;
    suffixConfig: string;
    forceUnixStyleSeparatorConfig: boolean;
    encodePathConfig: string;
    namePrefixConfig: string;
    nameSuffixConfig: string;
    insertPatternConfig: string;
    showFilePathConfirmInputBox: boolean,
    filePathConfirmInputBoxMode: string;
    defaultNameConfig: string;
    folderPathConfig: string;
    basePathConfig: string;

}

export const parseConfigurationToConfig = ({ projectPath, editorOpenFilePath, configuration }: { projectPath: string; editorOpenFilePath: string; configuration: WorkspaceConfiguration }): Configuration => {

    let defaultNameConfig = configuration.get<string>(Constants.Config_DefaultName);
    let folderPathConfig = configuration.get<string>(Constants.Config_FolderPath);
    let basePathConfig = configuration.get<string>(Constants.Config_BasePath);
    let prefixConfig = configuration.get<string>(Constants.Config_Prefix, '');
    let suffixConfig = configuration.get<string>(Constants.Config_Suffix, '');
    let forceUnixStyleSeparatorConfig = configuration.get<boolean>(Constants.Config_ForceUnixStyleSeparator);

    let encodePathConfig = configuration.get<string>(Constants.Config_EncodePath, '');
    let namePrefixConfig = configuration.get<string>(Constants.Config_NamePrefix, '');
    let nameSuffixConfig = configuration.get<string>(Constants.Config_NameSuffix, '');
    let insertPatternConfig = configuration.get<string>(Constants.Config_InsertPattern, '');
    let showFilePathConfirmInputBox = configuration.get<boolean>(Constants.Config_ShowFilePathConfirmInputBox) || false;
    let filePathConfirmInputBoxMode = configuration.get<string>(Constants.Config_FilePathConfirmInputBoxMode) || "inputBox";

    // load config pasteImage.defaultName

    if (!defaultNameConfig) {
        defaultNameConfig = "yyyy-LL-dd-HH-mm-ss" //https://moment.github.io/luxon/#/formatting?id=table-of-tokens
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

    defaultNameConfig = replacePathVariable({ pathStr: defaultNameConfig, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    folderPathConfig = replacePathVariable({ pathStr: folderPathConfig, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    basePathConfig = replacePathVariable({ pathStr: basePathConfig, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    namePrefixConfig = replacePathVariable({ pathStr: namePrefixConfig, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    nameSuffixConfig = replacePathVariable({ pathStr: nameSuffixConfig, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });
    insertPatternConfig = replacePathVariable({ pathStr: insertPatternConfig, projectRoot: projectPath, editorOpenFilePath: editorOpenFilePath });


    const config: Configuration = {

        // load other config
        defaultNameConfig: defaultNameConfig,
        prefixConfig: prefixConfig,
        suffixConfig: suffixConfig,
        forceUnixStyleSeparatorConfig: forceUnixStyleSeparatorConfig,
        encodePathConfig: encodePathConfig,
        namePrefixConfig: namePrefixConfig,
        nameSuffixConfig: nameSuffixConfig,
        insertPatternConfig: insertPatternConfig,
        showFilePathConfirmInputBox: showFilePathConfirmInputBox,
        filePathConfirmInputBoxMode: filePathConfirmInputBoxMode,
        folderPathConfig: folderPathConfig,
        basePathConfig: basePathConfig,

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

