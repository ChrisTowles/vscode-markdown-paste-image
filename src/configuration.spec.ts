import { describe, expect, it } from 'vitest'
import { Constants } from "./constants";
import { parseConfigurationToConfig, replacePathVariable } from "./configuration";
import * as upath from 'upath';
import { MockWorkspaceConfiguration } from './test/mockWorkspaceConfiguration';


describe('Configuration', () => {
    const mockWorkspaceConfiguration = new MockWorkspaceConfiguration({ currentDirectory: __dirname });
    it('check mock works', () => {

        expect(mockWorkspaceConfiguration.get(Constants.Config_ImageFolderPath)).toBe(__dirname);
    })

    it('check parse of default values', async () => {

        const config = await parseConfigurationToConfig({
            projectRootDirPath: __dirname,
            editorOpenFilePath: __filename,
            configuration: mockWorkspaceConfiguration,
        })

        expect(config.imageFolderPath).toBe(__dirname);

    })


    it('replacePathVariable - no replacement done', () => {
        const originalPath = `/dir1/dir2`
        const editorFile = upath.join(__dirname, 'test', 'test.md');
        const alteredValue = replacePathVariable({
            pathStr: originalPath,
            editorOpenFilePath: editorFile,
            projectRootDirPath: __dirname,
        })

        // no replacement done
        expect(alteredValue).toBe(originalPath);

    })

    it('replacePathVariable - replace with edit file\'s folder', () => {
        const originalPath = '${currentFileDir}'
        const editorFile = upath.join(__dirname, 'test', 'test.md');
        const alteredValue = replacePathVariable({
            pathStr: originalPath,
            editorOpenFilePath: editorFile,
            projectRootDirPath: __dirname,
        })

        // should replace with folder of editor file
        expect(alteredValue).toBe(upath.dirname(editorFile));

    })


    it('replacePathVariable - replace with edit file\'s folder and append another folder', () => {
        const originalPath = '${currentFileDir}/test2Folder'
        const editorFile = upath.join(__dirname, 'test', 'test.md');
        const alteredValue = replacePathVariable({
            pathStr: originalPath,
            editorOpenFilePath: editorFile,
            projectRootDirPath: __dirname,
        })

        // should replace with folder of editor file and append another folder
        const targetFolder = upath.join(upath.dirname(editorFile), 'test2Folder');
        expect(alteredValue).toBe(targetFolder);

    })

    it('replacePathVariable - replace with projectRoot', () => {
        const originalPath = '${projectRoot}'
        const editorFile = upath.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;

        const alteredValue = replacePathVariable({
            pathStr: originalPath,
            editorOpenFilePath: editorFile,
            projectRootDirPath: productRoot,
        })

        // should replace with folder of editor file
        expect(alteredValue).toBe(productRoot);
    })

    it('replacePathVariable - replace with projectRoot', () => {
        const originalPath = '${projectRoot}'
        const editorFile = upath.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;

        const alteredValue = replacePathVariable({
            pathStr: originalPath,
            editorOpenFilePath: editorFile,
            projectRootDirPath: productRoot,
        })

        // should replace with folder of editor file
        expect(alteredValue).toBe(productRoot);
    })


    it('replacePathVariable - replace with currentFileName', () => {
        const originalPath = '${currentFileName}'
        const editorFile = upath.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;

        const alteredValue = replacePathVariable({
            pathStr: originalPath,
            editorOpenFilePath: editorFile,
            projectRootDirPath: productRoot,
        })

        // should replace with editor
        expect(alteredValue).toBe(upath.basename(editorFile));
    })



    it('replacePathVariable - replace with currentFileNameWithoutExt', () => {
        const originalPath = '${currentFileNameWithoutExt}'
        const editorFile = upath.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;

        const alteredValue = replacePathVariable({
            pathStr: originalPath,
            editorOpenFilePath: editorFile,
            projectRootDirPath: productRoot,
        })

        let ext = upath.extname(editorFile);
        let fileNameWithoutExt = upath.basename(editorFile, ext);

        // should replace with editor filename without ext
        expect(alteredValue).toBe(fileNameWithoutExt);
    })

    it('replacePathVariable - replace with projectRoot and currentFileNameWithoutExt', () => {
        const originalPath = upath.join('${projectRoot}', '${currentFileNameWithoutExt}.png');
        const editorFile = upath.join(__dirname, 'test', 'test.md');
        const productRoot = __dirname;

        console.log({ originalPath, editorFile, productRoot });
        const alteredValue = replacePathVariable({
            pathStr: originalPath,
            editorOpenFilePath: editorFile,
            projectRootDirPath: productRoot,
        })

        let ext = upath.extname(editorFile);
        let fileNameWithoutExt = upath.basename(editorFile, ext);

        // should replace with editor filename without ext

        expect(alteredValue).toBe((upath.join(productRoot, `${fileNameWithoutExt}.png`)));
    })



});