import { DateTime } from 'luxon';
import { OutputChannel, window } from 'vscode'

const padLeft = (nr: number, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

export interface ILogger { 
  debug(...args: any[]): void;
  log(...args: any[]) : void;
  showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined>;
  showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined>;
}

export class Logger implements ILogger {

  readonly channel: OutputChannel;
  readonly isDebug: boolean;

  constructor() {
    this.channel = window.createOutputChannel('Markdown Paste Image')
    this.isDebug = process.env.NODE_ENV === 'development'
  }

  debug(...args: any[]): void {
    if (!this.isDebug)
      return
    this.log("DEBUG: ",...args)
  }

  log(...args: any[]) {

    var d = DateTime.now();
    const timestamp = d.toISO();
    this.channel.appendLine(`[${timestamp}] ${args.map(i => String(i)).join(' ')}`)
  }

  showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
    this.log(message);
    return window.showInformationMessage(message, ...items);
  }

  showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined> {
    this.log(message);
    return window.showErrorMessage(message, ...items);
  }
}
