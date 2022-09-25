import { describe, expect, it } from 'vitest'
import { WorkspaceConfiguration, ConfigurationTarget } from 'vscode';
import { Constants } from "./constants";
import { parseConfigurationToConfig } from "./configuration";



class WorkspaceConfigurationMock implements WorkspaceConfiguration {
  readonly [key: string]: any;
  has(section: string): boolean {
      throw new Error("Method not implemented.");
  }
  inspect<T>(section: string): { key: string; defaultValue?: T | undefined; globalValue?: T | undefined; workspaceValue?: T | undefined; workspaceFolderValue?: T | undefined; defaultLanguageValue?: T | undefined; globalLanguageValue?: T | undefined; workspaceLanguageValue?: T | undefined; workspaceFolderLanguageValue?: T | undefined; languageIds?: string[] | undefined; } | undefined {
      throw new Error("Method not implemented.");
  }
  update(section: string, value: any, configurationTarget?: boolean | ConfigurationTarget | null | undefined, overrideInLanguage?: boolean | undefined): Thenable<void> {
      throw new Error("Method not implemented.");
  }
  get<T>(section: string, defaultValue?: T): T | undefined {

    if(defaultValue !== undefined) {
        throw new Error("Logic for defaultValue not implemented.");
    }

    let result: string | boolean;

    switch (section) {
        case Constants.Config_FolderPath:
            result = __dirname;
            break;
        case Constants.Config_BasePath:
            result = __dirname;
            break;
        case Constants.Config_ForceUnixStyleSeparator:
            result = true;
            break;
        case Constants.Config_Prefix:
            result = '';
            break;
        case Constants.Config_Suffix:
            result = '';
            break;
        case Constants.Config_NamePrefix:
            result = '';
            break;
        case Constants.Config_NameSuffix:
            result = '';
            break;
        case Constants.Config_DefaultName:
            result = "yyyy-LL-mm-HH-mm-ss";
            break;
        case Constants.Config_EncodePath:
            result = 'urlEncodeSpace';  // todo: enum
            break;
        case Constants.Config_InsertPattern:
            result = "${imageSyntaxPrefix}${imageFilePath}${imageSyntaxSuffix}";
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


describe('Configuration', () => {

    it('check mock works', () => {
        const vsWorkspaceConfiguration = new WorkspaceConfigurationMock();
        expect(vsWorkspaceConfiguration.get(Constants.Config_FolderPath)).toBe(__dirname);
    })

    it('check parse of default values', () => {

        const vsWorkspaceConfiguration = new WorkspaceConfigurationMock();
        const config = parseConfigurationToConfig({
            projectPath: __dirname,
            filePath: __dirname,
            configuration: vsWorkspaceConfiguration,
        })

        expect(config.basePathConfig).toBe(__dirname);
        expect(config.suffixConfig).toBe('');
        //expect(config.forceUnixStyleSeparatorConfig).toBeTruthy();

        //expect(config.showFilePathConfirmInputBox).toBeTruthy();


    })
});