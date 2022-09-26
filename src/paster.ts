import * as vscode from 'vscode';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as upath from 'upath';
import { ILogger, Logger } from './logger';
import { createImageDirWithImagePath, ensurePngAddedToFileName, makeImagePath } from './folderUtil';
import { linuxCreateImageWithXClip } from './osTools/linux';
import { DateTime } from 'luxon';
import { win32CreateImageWithPowershell } from './osTools/win32';
import { macCreateImageWithAppleScript } from './osTools/macOS';
import { SaveClipboardImageToFileResult } from './dto/SaveClipboardImageToFileResult';
import { Configuration, FilePathConfirmInputBoxModeEnum, parseConfigurationToConfig } from './configuration';
import { Constants } from './constants';
import { renderTextWithImagePath } from './renderTextWithImagePath';


export class Paster {


  

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

        let editorOpenFilePath = fileUri.fsPath;
        let projectRootDirPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

        logger.log(`projectPath            = ${projectRootDirPath}`);
        logger.log(`editorOpenFilePath     = ${editorOpenFilePath}`);
        if (projectRootDirPath === '')
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

            config = await parseConfigurationToConfig({
                projectRootDirPath,
                editorOpenFilePath,
                configuration: vscode.workspace.getConfiguration(Constants.ConfigurationName)
            });

            logger.debug(`config = ${JSON.stringify(config, null, 2)}`);
        } catch (err) {
            logger.showErrorMessage((err as Error).message);
            return;
        }

        // replace variable in config

        const imagePath = await this.getImagePath({ editorOpenFilePath, selectText, config: config, logger })
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

            imagePath = await renderTextWithImagePath({ languageId: editor.document.languageId, config, imageFilePath: imagePath, logger });

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

    public static async getImagePath({ editorOpenFilePath, selectText, config, logger }: { editorOpenFilePath: string; selectText: string; config: Configuration, logger: ILogger }): Promise<string> {

        logger.debug('getImagePath start');

        // image file name
        let imageFileName = "";
        if (selectText && selectText.trim().length > 0) {
            imageFileName = selectText
        } else {
            imageFileName = DateTime.now().toFormat(config.defaultImageName);
        }
        
        // add prefix and suffix
        imageFileName = config.imageNamePrefix + imageFileName + config.imageNameSuffix; 

        // ensure ends with ".png"
        imageFileName = ensurePngAddedToFileName(imageFileName);

        let filePathOrName;
        if (config.filePathConfirmInputBoxMode === FilePathConfirmInputBoxModeEnum.FULL_PATH) {
            filePathOrName = makeImagePath({ fileName: imageFileName, imageFolderPath: config.imageFolderPath, editorOpenFilePath: editorOpenFilePath });
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
                
                
                logger.debug(`userEnteredFileName          = ${userEnteredFileName}`);
                if (config.filePathConfirmInputBoxMode === FilePathConfirmInputBoxModeEnum.ONLY_NAME) {
                    filePathOrName = makeImagePath({ fileName: userEnteredFileName, imageFolderPath: config.imageFolderPath, editorOpenFilePath: editorOpenFilePath });
                } else {
                    filePathOrName = userEnteredFileName
                }

            }

        } else {
            filePathOrName = makeImagePath({ fileName: imageFileName, imageFolderPath: config.imageFolderPath, editorOpenFilePath: editorOpenFilePath });
        }

        logger.debug(`editorOpenFilePath          = ${editorOpenFilePath}`);
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

    

}



