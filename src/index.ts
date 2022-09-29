import vscode from 'vscode';
import { Constants } from './constants';
import { Logger } from './logger';
import { Paster } from './paster';

export function activate(context: vscode.ExtensionContext) {
  const logger = new Logger();
  logger.log(`Congratulations, your extension "${Constants.ExtensionName}" is now active!`);

  const disposable = vscode.commands.registerCommand(Constants.vsCommandName, async () => {
    try {
      await Paster.paste(logger);
    }
    catch (ex) {
      logger.showErrorMessage((ex as Error).message);
    }
  });

  context.subscriptions.push(
    disposable,
  );
}

export function deactivate() {

}
