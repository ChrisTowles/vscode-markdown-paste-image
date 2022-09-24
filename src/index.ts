import vscode from 'vscode';
import { log } from './log';
import { Paster } from './paster';
//     Selection, TextEditor } from 'vscode';
// import { TextEditorSelectionChangeKind, window, workspace, OutputChannel } from 'vscode';
// import type { AstRoot } from './types'
// import { trigger } from './trigger'

// export const astCache = new Map<string, AstRoot[]>()

// class Logger {
//     static channel: OutputChannel;

//     static log(message: any) {
//         if (this.channel) {
//             let time = new Date().toLocaleTimeString();
//             this.channel.appendLine(`[${time}] ${message}`);
//         }
//     }

//     static showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
//         this.log(message);
//         return window.showInformationMessage(message, ...items);
//     }

//     static showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined> {
//         this.log(message);
//         return window.showErrorMessage(message, ...items);
//     }
// }

export function activate(context: vscode.ExtensionContext) {
    
    context.subscriptions.push(log.channel);
    log.log('Congratulations, your extension "vscode-markdown-paste-image" is now active!');


    // const config = workspace.getConfiguration('pasteImage')
    
    let disposable = vscode.commands.registerCommand('extension.pasteImage', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        // log.showInformationMessage('Markdown Image Paste test!');

        try {
            Paster.paste();
        } catch (ex) {
            log.showErrorMessage((ex as Error).message);
        }
    });


    context.subscriptions.push(
        disposable,

        // workspace.onDidChangeTextDocument((e) => {
        //   // astCache.delete(e.document.uri.fsPath)
        // }),

        // window.onDidChangeTextEditorSelection(async (e) => {
        //   clearTimeout(timer)
        //   if (e.kind !== TextEditorSelectionChangeKind.Mouse) {
        //     last = 0
        //     return
        //   }

        //   const selection = e.selections[0]
        //   const prev = prevSelection

        //   try {
        //     if (
        //       prevEditor !== e.textEditor
        //     || !prevSelection
        //     || !prevSelection.isEmpty
        //     || e.selections.length !== 1
        //     || selection.start.line !== prevSelection.start.line
        //     || Date.now() - last > config.get('clicksInterval', 600)
        //     )
        //       return
        //   }
        //   finally {
        //     prevEditor = e.textEditor
        //     prevSelection = selection
        //     last = Date.now()
        //   }

        //   timer = setTimeout(async () => {
        //     const newSelection = await trigger(e.textEditor.document, prev!, selection)
        //     if (newSelection) {
        //       last = 0
        //       e.textEditor.selections = newSelection
        //     }
        //   }, config.get('triggerDelay', 150))
        // }),
    )
}

export function deactivate() {

}
