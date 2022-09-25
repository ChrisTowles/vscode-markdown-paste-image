import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as upath from 'upath';
import { ILogger } from './logger';
import { createImageDirWithImagePath, makeImagePath } from './folderUtil';
import { linuxCreateImageWithXClip } from './osTools/linux';
import { DateTime } from 'luxon';
import { win32CreateImageWithPowershell } from './osTools/win32';
import { macCreateImageWithAppleScript } from './osTools/mac-os';
import { SaveClipboardImageToFileResult } from './dto/SaveClipboardImageToFileResult';
import util from 'util';


export class Paster {
    static PATH_VARIABLE_CURRENT_FILE_DIR = /\$\{currentFileDir\}/g;
    static PATH_VARIABLE_PROJECT_ROOT = /\$\{projectRoot\}/g;
    static PATH_VARIABLE_CURRENT_FILE_NAME = /\$\{currentFileName\}/g;
    static PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT = /\$\{currentFileNameWithoutExt\}/g;

    static PATH_VARIABLE_IMAGE_FILE_PATH = /\$\{imageFilePath\}/g;
    static PATH_VARIABLE_IMAGE_ORIGINAL_FILE_PATH = /\$\{imageOriginalFilePath\}/g;
    static PATH_VARIABLE_IMAGE_FILE_NAME = /\$\{imageFileName\}/g;
    static PATH_VARIABLE_IMAGE_FILE_NAME_WITHOUT_EXT = /\$\{imageFileNameWithoutExt\}/g;
    static PATH_VARIABLE_IMAGE_SYNTAX_PREFIX = /\$\{imageSyntaxPrefix\}/g;
    static PATH_VARIABLE_IMAGE_SYNTAX_SUFFIX = /\$\{imageSyntaxSuffix\}/g;

    static FILE_PATH_CONFIRM_INPUT_BOX_MODE_ONLY_NAME = "onlyName";
    static FILE_PATH_CONFIRM_INPUT_BOX_MODE_PULL_PATH = "fullPath";

    static defaultNameConfig: string;
    static folderPathConfig: string;
    static basePathConfig: string;
    static prefixConfig: string;
    static suffixConfig: string;
    static forceUnixStyleSeparatorConfig: boolean;
    static encodePathConfig: string;
    static namePrefixConfig: string;
    static nameSuffixConfig: string;
    static insertPatternConfig: string;
    static showFilePathConfirmInputBox: boolean;
    static filePathConfirmInputBoxMode: string;

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

        // load config pasteImage.defaultName
        this.defaultNameConfig = vscode.workspace.getConfiguration('pasteImage')['defaultName'];
        if (!this.defaultNameConfig) {
            this.defaultNameConfig = "Y-MM-DD-HH-mm-ss"
        }

        // load config pasteImage.path
        this.folderPathConfig = vscode.workspace.getConfiguration('pasteImage')['path'];
        if (!this.folderPathConfig) {
            this.folderPathConfig = "${currentFileDir}";
        }
        if (this.folderPathConfig.length !== this.folderPathConfig.trim().length) {
            logger.showErrorMessage(`The config pasteImage.path = '${this.folderPathConfig}' is invalid. please check your config.`);
            return;
        }
        // load config pasteImage.basePath
        this.basePathConfig = vscode.workspace.getConfiguration('pasteImage')['basePath'];
        if (!this.basePathConfig) {
            this.basePathConfig = "";
        }
        if (this.basePathConfig.length !== this.basePathConfig.trim().length) {
            logger.showErrorMessage(`The config pasteImage.path = '${this.basePathConfig}' is invalid. please check your config.`);
            return;
        }
        logger.log('load other config');

        // load other config
        this.prefixConfig = vscode.workspace.getConfiguration('pasteImage')['prefix'];
        this.suffixConfig = vscode.workspace.getConfiguration('pasteImage')['suffix'];
        this.forceUnixStyleSeparatorConfig = vscode.workspace.getConfiguration('pasteImage')['forceUnixStyleSeparator'];
        this.forceUnixStyleSeparatorConfig = !!this.forceUnixStyleSeparatorConfig;
        this.encodePathConfig = vscode.workspace.getConfiguration('pasteImage')['encodePath'];
        this.namePrefixConfig = vscode.workspace.getConfiguration('pasteImage')['namePrefix'];
        this.nameSuffixConfig = vscode.workspace.getConfiguration('pasteImage')['nameSuffix'];
        this.insertPatternConfig = vscode.workspace.getConfiguration('pasteImage')['insertPattern'];
        this.showFilePathConfirmInputBox = vscode.workspace.getConfiguration('pasteImage')['showFilePathConfirmInputBox'] || false;
        this.filePathConfirmInputBoxMode = vscode.workspace.getConfiguration('pasteImage')['filePathConfirmInputBoxMode'];

        // replace variable in config
        this.defaultNameConfig = this.replacePathVariable(this.defaultNameConfig, projectPath, filePath, (x) => `[${x}]`);
        this.folderPathConfig = this.replacePathVariable(this.folderPathConfig, projectPath, filePath);
        this.basePathConfig = this.replacePathVariable(this.basePathConfig, projectPath, filePath);
        this.namePrefixConfig = this.replacePathVariable(this.namePrefixConfig, projectPath, filePath);
        this.nameSuffixConfig = this.replacePathVariable(this.nameSuffixConfig, projectPath, filePath);
        this.insertPatternConfig = this.replacePathVariable(this.insertPatternConfig, projectPath, filePath);

        // "this" is lost when coming back from the callback, thus we need to store it here.
        const instance = this;



        try {
            const imagePath = await this.getImagePath({ filePath, selectText, folderPathFromConfig: this.folderPathConfig, showFilePathConfirmInputBox: this.showFilePathConfirmInputBox, filePathConfirmInputBoxMode: this.filePathConfirmInputBoxMode, logger })

            // is the file existed?
            let existed = fs.existsSync(imagePath);
            if (existed) {
                let choose = await logger.showInformationMessage(`File ${imagePath} existed.  Would you want to replace?`, 'Replace', 'Cancel')

                if (choose != 'Replace')
                    return;

                await instance.saveAndPaste({ editor, imagePath, logger });
            } else {
                await instance.saveAndPaste({ editor, imagePath, logger });
            }
        } catch (err) {
            logger.showErrorMessage(`fs.existsSync(${filePath}) fail. message=${(err as Error).message}`);
            return;
        }


        logger.debug('Paste End');
    }

    public static async saveAndPaste({ editor, imagePath, logger }: { editor: vscode.TextEditor; imagePath: string; logger: ILogger; }): Promise<void> {

        logger.debug('saveAndPaste Start');

        try {
            imagePath = await createImageDirWithImagePath(imagePath)

            logger.debug('createImageDirWithImagePath: ' + imagePath);
            // save image and insert to current edit file
            const result = await this.saveClipboardImageToFileAndGetPath({ imagePath, logger });


            if (result.success) {
                logger.debug(`saveClipboardImageToFileAndGetPath - ${imagePath} - imagePath: ${result.paths?.imagePath}`);
            } else {
                logger.debug('There is not an image path returned By script.');
                return;
            }

            // TODO this includes is wrong.
            if (result.paths?.imagePathFromScript.includes('no image')) {
                logger.showInformationMessage('There is not an image in the clipboard.');
                return;
            }

            imagePath = this.renderFilePath(editor.document.languageId, this.basePathConfig, imagePath, this.forceUnixStyleSeparatorConfig, this.prefixConfig, this.suffixConfig);

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

    public static async getImagePath({ filePath, selectText, folderPathFromConfig, showFilePathConfirmInputBox, filePathConfirmInputBoxMode, logger }: { filePath: string; selectText: string; folderPathFromConfig: string; showFilePathConfirmInputBox: boolean; filePathConfirmInputBoxMode: string; logger: ILogger }): Promise<string> {

            logger.debug('getImagePath start');


        // image file name
        let imageFileName = "";
        if (!selectText) {
            imageFileName = this.namePrefixConfig + DateTime.now().toFormat(this.defaultNameConfig) + this.nameSuffixConfig + ".png";

        } else {
            imageFileName = this.namePrefixConfig + selectText + this.nameSuffixConfig + ".png";
        }

        let filePathOrName;
        if (filePathConfirmInputBoxMode == Paster.FILE_PATH_CONFIRM_INPUT_BOX_MODE_PULL_PATH) {
            filePathOrName = makeImagePath({ fileName: imageFileName, folderPathFromConfig: folderPathFromConfig, filePath: filePath });
        } else {
            filePathOrName = imageFileName;
        }

        if (showFilePathConfirmInputBox) {

            let userEnteredFileName = await vscode.window.showInputBox({
                prompt: 'Please specify the filename of the image.',
                value: filePathOrName
            });

            if (userEnteredFileName) {
                if (!userEnteredFileName.toLowerCase().endsWith('.png'))
                    userEnteredFileName += '.png';

                if (filePathConfirmInputBoxMode == Paster.FILE_PATH_CONFIRM_INPUT_BOX_MODE_ONLY_NAME) {
                    filePathOrName = makeImagePath({ fileName: userEnteredFileName, folderPathFromConfig: folderPathFromConfig, filePath: filePath });
                }

            }


        } else {

            filePathOrName = makeImagePath({ fileName: imageFileName, folderPathFromConfig: folderPathFromConfig, filePath: filePath });

        }

        logger.debug(`filePath                    = ${filePath}`);
        logger.debug(`imageFileName               = ${imageFileName}`);
        logger.debug(`filePathOrName              = ${filePathOrName}`);
        logger.debug(`showFilePathConfirmInputBox = ${showFilePathConfirmInputBox}`);

        logger.debug('getImagePath end');
        return filePathOrName;
    }

    private static async saveClipboardImageToFileAndGetPath({ imagePath, logger }: { imagePath: string; logger: ILogger}): Promise<SaveClipboardImageToFileResult> {
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
        logger.log(`createImage result = ${util.inspect(result, { showHidden: false,  depth: null, colors: true })}`);
        return result;
    }

    /**
     * render the image file path dependent on file type
     * e.g. in markdown image file path will render to ![](path)
     */
    public static renderFilePath(languageId: string, basePath: string, imageFilePath: string, forceUnixStyleSeparator: boolean, prefix: string, suffix: string): string {
        if (basePath) {
            imageFilePath = path.relative(basePath, imageFilePath);
        }

        if (forceUnixStyleSeparator) {
            imageFilePath = upath.normalize(imageFilePath);
        }

        let originalImagePath = imageFilePath;
        let ext = path.extname(originalImagePath);
        let fileName = path.basename(originalImagePath);
        let fileNameWithoutExt = path.basename(originalImagePath, ext);

        imageFilePath = `${prefix}${imageFilePath}${suffix}`;

        if (this.encodePathConfig == "urlEncode") {
            imageFilePath = encodeURI(imageFilePath)
        } else if (this.encodePathConfig == "urlEncodeSpace") {
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

        let result = this.insertPatternConfig
        result = result.replace(this.PATH_VARIABLE_IMAGE_SYNTAX_PREFIX, imageSyntaxPrefix);
        result = result.replace(this.PATH_VARIABLE_IMAGE_SYNTAX_SUFFIX, imageSyntaxSuffix);

        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_PATH, imageFilePath);
        result = result.replace(this.PATH_VARIABLE_IMAGE_ORIGINAL_FILE_PATH, originalImagePath);
        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_NAME, fileName);
        result = result.replace(this.PATH_VARIABLE_IMAGE_FILE_NAME_WITHOUT_EXT, fileNameWithoutExt);

        return result;
    }

    public static replacePathVariable(pathStr: string, projectRoot: string, curFilePath: string, postFunction: (val: string) => string = (x) => x): string {
        let currentFileDir = path.dirname(curFilePath);
        let ext = path.extname(curFilePath);
        let fileName = path.basename(curFilePath);
        let fileNameWithoutExt = path.basename(curFilePath, ext);

        pathStr = pathStr.replace(this.PATH_VARIABLE_PROJECT_ROOT, postFunction(projectRoot));
        pathStr = pathStr.replace(this.PATH_VARIABLE_CURRENT_FILE_DIR, postFunction(currentFileDir));
        pathStr = pathStr.replace(this.PATH_VARIABLE_CURRENT_FILE_NAME, postFunction(fileName));
        pathStr = pathStr.replace(this.PATH_VARIABLE_CURRENT_FILE_NAME_WITHOUT_EXT, postFunction(fileNameWithoutExt));
        return pathStr;
    }
}



