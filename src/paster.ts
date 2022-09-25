import * as vscode from 'vscode';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as upath from 'upath';
import { ILogger } from './logger';
import { createImageDirWithImagePath, ensurePngAddedToFileName, makeImagePath } from './folderUtil';
import { linuxCreateImageWithXClip } from './osTools/linux';
import { DateTime } from 'luxon';
import { win32CreateImageWithPowershell } from './osTools/win32';
import { macCreateImageWithAppleScript } from './osTools/macOS';
import { SaveClipboardImageToFileResult } from './dto/SaveClipboardImageToFileResult';
import { Configuration, parseConfigurationToConfig } from './configuration';
import { Constants } from './constants';


export class Paster {


    static PATH_VARIABLE_IMAGE_FILE_PATH = /\$\{imageFilePath\}/g;
    static PATH_VARIABLE_IMAGE_ORIGINAL_FILE_PATH = /\$\{imageOriginalFilePath\}/g;
    static PATH_VARIABLE_IMAGE_FILE_NAME = /\$\{imageFileName\}/g;
    static PATH_VARIABLE_IMAGE_FILE_NAME_WITHOUT_EXT = /\$\{imageFileNameWithoutExt\}/g;
    static PATH_VARIABLE_IMAGE_SYNTAX_PREFIX = /\$\{imageSyntaxPrefix\}/g;
    static PATH_VARIABLE_IMAGE_SYNTAX_SUFFIX = /\$\{imageSyntaxSuffix\}/g;

    static FILE_PATH_CONFIRM_INPUT_BOX_MODE_ONLY_NAME = "onlyName";
    static FILE_PATH_CONFIRM_INPUT_BOX_MODE_PULL_PATH = "fullPath";


    public static async paste(logger: ILogger): Promise<void> {
        // get current edit file path
        let textEditor = vscode.window.activeTextEditor;
        if (!textEditor)
            return;

        let editor = textEditor!;

        let fileUri = editor.document.uri;
        if (!fileUri) return;
        if (fileUri.scheme === 'untitled') {
            logger.showInformationMessage('Before pasting the image, you need to save current file first.');
            return;
        }

        let filePath = fileUri.fsPath;
        let projectPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

        logger.log(`projectPath = ${projectPath}`);
        logger.log(`fileUri     = ${fileUri}`);
        if (projectPath === '')
            return;


        // get selection as image file name, need check
        var selection = editor.selection;
        var selectText = editor.document.getText(selection);
        if (selectText && /[\\:*?<>|]/.test(selectText)) {
            logger.showInformationMessage('Your selection is not a valid filename!');
            return;
        }

        // load other config
        let config: Configuration;
        try {

            config = parseConfigurationToConfig({
                projectPath,
                filePath,
                configuration: vscode.workspace.getConfiguration(Constants.ConfigurationName)
            });

            logger.debug(`config = ${JSON.stringify(config, null, 2)}`);
        } catch (err) {
            logger.showErrorMessage((err as Error).message);
            return;
        }

        // replace variable in config

        const imagePath = await this.getImagePath({ filePath, selectText, config: config, logger })
        try {
            // is the file existed?
            let fileAlreadyExisted = await fse.existsSync(imagePath);
            if (fileAlreadyExisted) {
                let choose = await logger.showInformationMessage(`File ${imagePath} existed.  Would you want to replace?`, 'Replace', 'Cancel')

                if (choose != 'Replace')
                    return;
            }
            await this.saveAndPaste({ editor, imagePath, config, logger });

        } catch (err) {
            logger.showErrorMessage(`fs.existsSync(${imagePath}) fail. message=${(err as Error).message}`);
            return;
        }


        logger.debug('Paste End');
    }

    public static async saveAndPaste({ editor, imagePath, config, logger }: { editor: vscode.TextEditor; imagePath: string; config: Configuration, logger: ILogger; }): Promise<void> {

        logger.debug(`saveAndPaste Start, imagePath = ${imagePath}`);

        try {
            const imageFolder = await createImageDirWithImagePath(imagePath)
            logger.debug(`imageFolder = ${imageFolder}`);

            // save image and insert to current edit file
            const result = await this.saveClipboardImageToFileAndGetPath({ imagePath, logger });

            if (result.success) {
                logger.debug(`saveClipboardImageToFileAndGetPath - ${result.imagePath} }`);
            } else {

                if (result.noImageInClipboard) {
                    await logger.showErrorMessage('No Image was found in the clipboard.');
                }
                return;
            }

            imagePath = this.renderFilePath(editor.document.languageId, config, imagePath);

            editor.edit((edit) => {
                let current = editor.selection;

                if (current.isEmpty) {
                    edit.insert(current.start, imagePath);
                } else {
                    edit.replace(current, imagePath);
                }
            });

        }
        catch (err) {
            logger.showErrorMessage((err as Error).message);
        }

        logger.debug('saveAndPaste end');
    }

    public static async getImagePath({ filePath, selectText, config, logger }: { filePath: string; selectText: string; config: Configuration, logger: ILogger }): Promise<string> {

        logger.debug('getImagePath start');

        // image file name
        let imageFileName = "";
        if (!selectText) {
            imageFileName = config.namePrefixConfig + DateTime.now().toFormat(config.defaultNameConfig) + config.nameSuffixConfig;

        } else {
            imageFileName = config.namePrefixConfig + selectText + config.nameSuffixConfig;
        }
        imageFileName = ensurePngAddedToFileName(imageFileName);

        let filePathOrName;
        if (config.filePathConfirmInputBoxMode == Paster.FILE_PATH_CONFIRM_INPUT_BOX_MODE_PULL_PATH) {
            filePathOrName = makeImagePath({ fileName: imageFileName, folderPathConfig: config.folderPathConfig, filePath: filePath });
        } else {
            filePathOrName = imageFileName;
        }

        if (config.showFilePathConfirmInputBox) {

            let userEnteredFileName = await vscode.window.showInputBox({
                prompt: 'Please specify the filename of the image.',
                value: filePathOrName
            });

            if (userEnteredFileName) {
                userEnteredFileName = ensurePngAddedToFileName(userEnteredFileName);

                if (config.filePathConfirmInputBoxMode == Paster.FILE_PATH_CONFIRM_INPUT_BOX_MODE_ONLY_NAME) {
                    filePathOrName = makeImagePath({ fileName: userEnteredFileName, folderPathConfig: config.folderPathConfig, filePath: filePath });
                }
            }

        } else {
            filePathOrName = makeImagePath({ fileName: imageFileName, folderPathConfig: config.folderPathConfig, filePath: filePath });
        }

        logger.debug(`filePath                    = ${filePath}`);
        logger.debug(`imageFileName               = ${imageFileName}`);
        logger.debug(`filePathOrName              = ${filePathOrName}`);
        logger.debug(`showFilePathConfirmInputBox = ${config.showFilePathConfirmInputBox}`);

        logger.debug('getImagePath end');
        return filePathOrName;
    }


    private static async saveClipboardImageToFileAndGetPath({ imagePath, logger }: { imagePath: string; logger: ILogger }): Promise<SaveClipboardImageToFileResult> {
        if (!imagePath) {
            logger.log('imagePath is empty');
            return { success: false };
        }

        let result: SaveClipboardImageToFileResult;
        let platform = process.platform;
        if (platform === 'win32') {
            result = await win32CreateImageWithPowershell({ imagePath, logger });
        }
        else if (platform === 'darwin') {
            // Mac
            result = await macCreateImageWithAppleScript({ imagePath, logger });
        } else {
            // Linux 
            result = await linuxCreateImageWithXClip({ imagePath, logger });
        }
        logger.log(`createImage result = ${JSON.stringify(result, null, 2)}`);
        return result;
    }

    /**
     * render the image file path dependent on file type
     * e.g. in markdown image file path will render to ![](path)
     */
    public static renderFilePath(languageId: string, config: Configuration, imageFilePath: string): string {
        if (config.basePathConfig) {
            imageFilePath = path.relative(config.basePathConfig, imageFilePath);
        }

        if (config.forceUnixStyleSeparatorConfig) {
            imageFilePath = upath.normalize(imageFilePath);
        }

        let originalImagePath = imageFilePath;
        let ext = path.extname(originalImagePath);
        let fileName = path.basename(originalImagePath);
        let fileNameWithoutExt = path.basename(originalImagePath, ext);

        imageFilePath = `${config.prefixConfig}${imageFilePath}${config.suffixConfig}`;

        if (config.encodePathConfig == "urlEncode") {
            imageFilePath = encodeURI(imageFilePath)
        } else if (config.encodePathConfig == "urlEncodeSpace") {
            imageFilePath = imageFilePath.replace(/ /g, "%20");
        }

        let imageSyntaxPrefix = "";
        let imageSyntaxSuffix = ""
        switch (languageId) {
            case "markdown":
                imageSyntaxPrefix = `![](`
                imageSyntaxSuffix = `)`
                break;
            case "asciidoc":
                imageSyntaxPrefix = `image::`
                imageSyntaxSuffix = `[]`
                break;
        }

        let result = config.insertPatternConfig
        result = result.replace(this.PATH_VARIABLE_IMAGE_SYNTAX_PREFIX, imageSyntaxPrefix);
        result = result.replace(this.PATH_VARIABLE_IMAGE_SYNTAX_SUFFIX, imageSyntaxSuffix);

        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_PATH, imageFilePath);
        result = result.replace(this.PATH_VARIABLE_IMAGE_ORIGINAL_FILE_PATH, originalImagePath);
        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_NAME, fileName);
        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_NAME_WITHOUT_EXT, fileNameWithoutExt);

        return result;
    }


}



