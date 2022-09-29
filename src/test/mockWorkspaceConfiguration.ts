/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ConfigurationTarget, WorkspaceConfiguration } from 'vscode';
import { Constants } from '../constants';

export class MockWorkspaceConfiguration implements WorkspaceConfiguration {
  readonly currentDirectory: string;
  constructor({ currentDirectory }: { currentDirectory: string }) {
    this.currentDirectory = currentDirectory;
  }

  readonly [key: string]: any;
  has(section: string): boolean {
    throw new Error('Method not implemented.');
  }

  inspect<T>(section: string): { key: string; defaultValue?: T | undefined; globalValue?: T | undefined; workspaceValue?: T | undefined; workspaceFolderValue?: T | undefined; defaultLanguageValue?: T | undefined; globalLanguageValue?: T | undefined; workspaceLanguageValue?: T | undefined; workspaceFolderLanguageValue?: T | undefined; languageIds?: string[] | undefined } | undefined {
    throw new Error('Method not implemented.');
  }

  update(section: string, value: any, configurationTarget?: boolean | ConfigurationTarget | null | undefined, overrideInLanguage?: boolean | undefined): Thenable<void> {
    throw new Error('Method not implemented.');
  }

  get<T>(section: string, defaultValue?: T): T | undefined {
    let result: string | boolean;

    switch (section) {
      case Constants.Config_ImageFolderPath:
        result = this.currentDirectory;
        break;
      case Constants.Config_ImageUriPathPrefix:
        result = '';
        break;
      case Constants.Config_ImageUriPathSuffix:
        result = '';
        break;
      case Constants.Config_ImageNamePrefix:
        result = '';
        break;
      case Constants.Config_ImageNameSuffix:
        result = '';
        break;
      case Constants.Config_DefaultImageName:
        result = 'yyyy-LL-mm-HH-mm-ss';
        break;
      case Constants.Config_EncodePath:
        result = 'urlEncodeSpace'; // todo: enum
        break;
      case Constants.Config_InsertPattern:
        // eslint-disable-next-line no-template-curly-in-string
        result = '${imageSyntaxPrefix}${imageFilePath}${imageSyntaxSuffix}';
        break;
      case Constants.Config_ShowFilePathConfirmInputBox:
        result = false;
        break;
      case Constants.Config_FilePathConfirmInputBoxMode:
        result = 'fullPath'; // todo: enum
        break;
      default:
        throw new Error(`No Mock provided for Config ${section}.`);
    }

    return result as T;
  }
}
