import { describe, expect, it } from 'vitest'
import { WorkspaceConfiguration, ConfigurationTarget } from 'vscode';
import { Constants } from "./constants";
import { parseConfigurationToConfig, replacePathVariable } from "./configuration";
import path from 'path';


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
            editorOpenFilePath: __dirname,
            configuration: vsWorkspaceConfiguration,
        })

        expect(config.basePathConfig).toBe(__dirname);



    })


    it('replacePathVariable - no replacement done', () => {
        const originalPath = `/dir1/dir2`
        const editorFile = path.join(__dirname, 'test', 'test.md');
        const alteredValue = replacePathVariable({
         pathStr: originalPath,
         editorOpenFilePath: editorFile,
         projectRoot: __dirname,
        })

        // no replacement done
        expect(alteredValue).toBe(originalPath);

    })

    it('replacePathVariable - replace with edit file\'s folder', () => {
        const originalPath = '${currentFileDir}'
        const editorFile = path.join(__dirname, 'test', 'test.md');
        const alteredValue = replacePathVariable({
         pathStr: originalPath,
         editorOpenFilePath: editorFile,
         projectRoot: __dirname,
        })

        // should replace with folder of editor file
        expect(alteredValue).toBe(path.dirname(editorFile));

    })


    it('replacePathVariable - replace with edit file\'s folder and append another folder', () => {
        const originalPath = '${currentFileDir}/test2Folder'
        const editorFile = path.join(__dirname, 'test', 'test.md');
        const alteredValue = replacePathVariable({
         pathStr: originalPath,
         editorOpenFilePath: editorFile,
         projectRoot: __dirname,
        })

        // should replace with folder of editor file and append another folder
        const targetFolder = path.join(path.dirname(editorFile), 'test2Folder');
        expect(alteredValue).toBe(targetFolder);

    })

    it('replacePathVariable - replace with projectRoot', () => {
        const originalPath = '${projectRoot}'
        const editorFile = path.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;

        const alteredValue = replacePathVariable({
         pathStr: originalPath,
         editorOpenFilePath: editorFile,
         projectRoot: productRoot,
        })

        // should replace with folder of editor file
        expect(alteredValue).toBe(productRoot);
    })

    it('replacePathVariable - replace with projectRoot', () => {
        const originalPath = '${projectRoot}'
        const editorFile = path.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;
        
        const alteredValue = replacePathVariable({
         pathStr: originalPath,
         editorOpenFilePath: editorFile,
         projectRoot: productRoot,
        })

        // should replace with folder of editor file
        expect(alteredValue).toBe(productRoot);
    })


    it('replacePathVariable - replace with currentFileName', () => {
        const originalPath = '${currentFileName}'
        const editorFile = path.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;
        
        const alteredValue = replacePathVariable({
         pathStr: originalPath,
         editorOpenFilePath: editorFile,
         projectRoot: productRoot,
        })

        // should replace with editor
        expect(alteredValue).toBe(path.basename(editorFile));
    })



    it('replacePathVariable - replace with currentFileNameWithoutExt', () => {
        const originalPath = '${currentFileNameWithoutExt}'
        const editorFile = path.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;
        
        const alteredValue = replacePathVariable({
         pathStr: originalPath,
         editorOpenFilePath: editorFile,
         projectRoot: productRoot,
        })

        let ext = path.extname(editorFile);
        let fileNameWithoutExt = path.basename(editorFile, ext);

        // should replace with editor filename without ext
        expect(alteredValue).toBe(fileNameWithoutExt);
    })

    it('replacePathVariable - replace with projectRoot and currentFileNameWithoutExt', () => {
        const originalPath = '${projectRoot}/${currentFileNameWithoutExt}.png'
        const editorFile = path.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;
        
        const alteredValue = replacePathVariable({
         pathStr: originalPath,
         editorOpenFilePath: editorFile,
         projectRoot: productRoot,
        })

        let ext = path.extname(editorFile);
        let fileNameWithoutExt = path.basename(editorFile, ext);
        
        // should replace with editor filename without ext
        expect(alteredValue).toBe(path.join(productRoot, `${fileNameWithoutExt}.png`));
    })



});