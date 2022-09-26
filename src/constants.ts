
export class Constants {
    public static ExtensionName = 'vscode-markdown-paste-image';
    public static vsCommandName = 'extension.pasteImage'; // match the command in package.json
    public static ConfigurationName = 'pasteImage'; // match the command in package.json
    public static ChannelLogName = 'Markdown Paste Image'; // match the command in package.json


    // Configuration Params constants
    public static Config_DefaultImageName = 'defaultImageName';
    public static Config_ImageFolderPath = 'imageFolderPath';
    
    
    public static Config_EncodePath =  'encodePath';
    public static Config_ImageNamePrefix =  'imageNamePrefix';
    public static Config_ImageNameSuffix =  'imageNameSuffix';
    public static Config_InsertPattern =  'insertPattern';
    public static Config_ShowFilePathConfirmInputBox=  'showFilePathConfirmInputBox';
    public static Config_FilePathConfirmInputBoxMode =  'filePathConfirmInputBoxMode';

    public static Config_ImageUriPathPrefix = 'imageUriPathPrefix';
    public static Config_ImageUriPathSuffix = 'imageUriPathSuffix';

}