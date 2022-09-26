import { describe, expect, it } from 'vitest'
import { WorkspaceConfiguration, ConfigurationTarget } from 'vscode';
import { Constants } from "./constants";
import { parseConfigurationToConfig, replacePathVariable } from "./configuration";
import path from 'path';
import { MockWorkspaceConfiguration } from './test/mockWorkspaceConfiguration';




describe('Configuration', () => {
    const mockWorkspaceConfiguration = new MockWorkspaceConfiguration({ currentDirectory: __dirname });
    it('check mock works', () => {

        expect(mockWorkspaceConfiguration.get(Constants.Config_ImageFolderPath)).toBe(__dirname);
    })

    it('check parse of default values', () => {

     
        const config = parseConfigurationToConfig({
            projectPath: __dirname,
            editorOpenFilePath: __dirname,
            configuration: mockWorkspaceConfiguration,
        })

        expect(config.imageFolderPath).toBe(__dirname);

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