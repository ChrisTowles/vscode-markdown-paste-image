import { window } from 'vscode'

export const isDebug = process.env.NODE_ENV === 'development'

export const channel = window.createOutputChannel('Markdown Paste Image')

const padLeft = (nr: number, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

export const log = {
  debug(...args: any[]) {
    if (!isDebug)
      return
    // eslint-disable-next-line no-console
    console.log(...args)
    this.log(...args)
  },

  log(...args: any[]) {

    var d = new Date();
    const timestamp = `${d.getFullYear()}-${padLeft(d.getMonth()+1)}-${padLeft(d.getDate())} ${padLeft(d.getHours())}:${d.getMinutes()}:${padLeft(d.getSeconds())}`;
    channel.appendLine(`[${timestamp}] ${args.map(i => String(i)).join(' ')}`)
  },


  showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
    this.log(message);
    return window.showInformationMessage(message, ...items);
  },

  showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined> {
    this.log(message);
    return window.showErrorMessage(message, ...items);
  },
  channel: channel
}
