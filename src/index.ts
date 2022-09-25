import vscode from 'vscode';
import { Logger } from './logger';
import { Paster } from './paster';

export function activate(context: vscode.ExtensionContext) {

    const logger = new Logger();
    logger.log('Congratulations, your extension "vscode-markdown-paste-image" is now active!');

    // const config = workspace.getConfiguration('pasteImage')
    
    let disposable = vscode.commands.registerCommand('extension.pasteImage', async () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        // log.showInformationMessage('Markdown Image Paste test!');

        try {
            await Paster.paste(logger);
        } catch (ex) {
            logger.showErrorMessage((ex as Error).message);
        }
    });


    context.subscriptions.push(
        disposable,
    )
}

export function deactivate() {

}
