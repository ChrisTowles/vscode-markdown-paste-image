import fse from 'fs-extra';
import { DateTime } from 'luxon';
import vscode from 'vscode';
import type { Configuration } from './configuration';
import { FilePathConfirmInputBoxModeEnum, parseConfigurationToConfig } from './configuration';
import { Constants } from './constants';
import type { SaveClipboardImageToFileResult } from './dto/SaveClipboardImageToFileResult';
import { createImageDirWithImagePath, ensureImageExtensionAddedToFileName, makeImagePath } from './folderUtil';
import type { ILogger } from './logger';
import { linuxCreateImageWithClipboard } from './osTools/linux';
import { macCreateImageWithAppleScript } from './osTools/macOS';
import { win32CreateImageWithPowershell } from './osTools/win32';
import { encodeImagePath, renderTextWithImagePath } from './renderTextWithImagePath';

export class Paster {
  public static async paste(logger: ILogger): Promise<void> {
    // get current edit file path
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor)
      return;

    const editor = textEditor!;

    const fileUri = editor.document.uri;
    if (!fileUri)
      return;
    if (fileUri.scheme === 'untitled') {
      logger.showInformationMessage('Before pasting the image, you need to save current file first.');
      return;
    }

    const editorOpenFilePath = fileUri.fsPath;
    const projectRootDirPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';

    logger.log(`projectPath            = ${projectRootDirPath}`);
    logger.log(`editorOpenFilePath     = ${editorOpenFilePath}`);
    if (projectRootDirPath === '')
      return;

    // get selection as image file name, need check
    const selection = editor.selection;
    const selectText = editor.document.getText(selection);
    if (selectText && /[\\:*?<>|]/.test(selectText)) {
      logger.showInformationMessage('Your selection is not a valid filename!');
      return;
    }

    // load config
    let config: Configuration;
    try {
      config = await parseConfigurationToConfig({
        projectRootDirPath,
        editorOpenFilePath,
        configuration: vscode.workspace.getConfiguration(Constants.ConfigurationName),
      });

      logger.debug(`config = ${JSON.stringify(config, null, 2)}`);
    }
    catch (err) {
      logger.showErrorMessage((err as Error).message);
      return;
    }

    // replace variable in config
    const imagePath = await this.getImagePath({ editorOpenFilePath, selectText, config, logger });
    
    // Check if user cancelled the operation (empty path)
    if (!imagePath) {
      return;
    }
    
    try {
      // is the file existed?
      const fileAlreadyExisted = await fse.existsSync(imagePath);
      if (fileAlreadyExisted) {
        const choose = await logger.showInformationMessage(`File ${imagePath} existed.  Would you want to replace?`, 'Replace', 'Cancel');

        if (choose !== 'Replace')
          return;
      }
      await this.saveAndPaste({ editor, imagePath, config, logger });
    }
    catch (err) {
      logger.showErrorMessage(`fs.existsSync(${imagePath}) fail. message=${(err as Error).message}`);
      return;
    }

    logger.debug('Paste End');
  }

  public static async saveAndPaste({ editor, imagePath, config, logger }: { editor: vscode.TextEditor; imagePath: string; config: Configuration; logger: ILogger }): Promise<void> {
    logger.debug(`saveAndPaste Start, imagePath = ${imagePath}`);

    try {
      const imageFolder = await createImageDirWithImagePath(imagePath);
      logger.debug(`imageFolder = ${imageFolder}`);

      // save image and insert to current edit file
      const result = await this.saveClipboardImageToFileAndGetPath({ imagePath, logger });

      if (result.success) {
        logger.debug(`saveClipboardImageToFileAndGetPath - ${result.imagePath} }`);
        // Use the actual image path returned by the script (which may have a different extension)
        if (result.imagePath) {
          imagePath = result.imagePath;
        }
      }
      else {
        if (result.noImageInClipboard)
          await logger.showErrorMessage('No Image was found in the clipboard.');

        return;
      }

      imagePath = await renderTextWithImagePath({ languageId: editor.document.languageId, config, imageFilePath: imagePath, logger });

      editor.edit((edit) => {
        const current = editor.selection;

        if (current.isEmpty)
          edit.insert(current.start, imagePath);
        else
          edit.replace(current, imagePath);
      });
    }
    catch (err) {
      logger.showErrorMessage((err as Error).message);
    }

    logger.debug('saveAndPaste end');
  }

  public static async getImagePath({ editorOpenFilePath, selectText, config, logger }: { editorOpenFilePath: string; selectText: string; config: Configuration; logger: ILogger }): Promise<string> {
    logger.debug('getImagePath start');

    // image file name
    let imageFileName = '';
    if (selectText && selectText.trim().length > 0)
      imageFileName = selectText;
    else
      // luxon DateTime
      imageFileName = DateTime.now().toFormat(config.defaultImageName);

    // add prefix and suffix
    imageFileName = config.imageNamePrefix + imageFileName + config.imageNameSuffix;
    imageFileName = encodeImagePath({ imageFilePath: imageFileName, encodePath: config.encodePath });

    // ensure ends with an image extension (defaulting to ".png")
    imageFileName = ensureImageExtensionAddedToFileName(imageFileName);

    let filePathOrName;
    if (config.filePathConfirmInputBoxMode === FilePathConfirmInputBoxModeEnum.FullPath)
      filePathOrName = makeImagePath({ fileName: imageFileName, imageFolderPath: config.imageFolderPath, editorOpenFilePath });
    else
      filePathOrName = imageFileName;

    if (config.showFilePathConfirmInputBox) {
      let userEnteredFileName = await vscode.window.showInputBox({
        prompt: 'Please specify the filename of the image.',
        value: filePathOrName,
      });

      if (userEnteredFileName) {
        userEnteredFileName = ensureImageExtensionAddedToFileName(userEnteredFileName);

        logger.debug(`userEnteredFileName          = ${userEnteredFileName}`);
        if (config.filePathConfirmInputBoxMode === FilePathConfirmInputBoxModeEnum.OnlyName)
          filePathOrName = makeImagePath({ fileName: userEnteredFileName, imageFolderPath: config.imageFolderPath, editorOpenFilePath });
        else
          filePathOrName = userEnteredFileName;
      }
      else {
        // User cancelled the input box
        return '';
      }
    }
    else {
      filePathOrName = makeImagePath({ fileName: imageFileName, imageFolderPath: config.imageFolderPath, editorOpenFilePath });
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
    const platform = process.platform;
    if (platform === 'win32') {
      result = await win32CreateImageWithPowershell({ imagePath, logger });
    }
    else if (platform === 'darwin') {
      // Mac
      result = await macCreateImageWithAppleScript({ imagePath, logger });
    }
    else {
      // Linux
      result = await linuxCreateImageWithClipboard({ imagePath, logger });
    }
    logger.log(`createImage result = ${JSON.stringify(result, null, 2)}`);
    return result;
  }
}

