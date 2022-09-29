/* eslint-disable @typescript-eslint/no-unused-vars */
import { DateTime } from 'luxon';
import type { ILogger } from '../logger';

export class MockLogger implements ILogger {
  constructor() {

  }

  debug(...args: any[]): void {
    this.log(['DEBUG', ...args]);
  }

  log(...args: any[]) {
    const d = DateTime.now();
    const timestamp = d.toISO();
    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] ${args.map(i => String(i)).join(' ')}`);
  }

  showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
    this.log(message);
    return new Promise<string | undefined>((resolve, reject) => {
      resolve('done');
    });
  }

  showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined> {
    this.log(message);
    return new Promise<string | undefined>((resolve, reject) => {
      resolve('done');
    });
  }
}
