import { describe, expect, it } from 'vitest'
import { createImageDirWithImagePath, ensureFileAndGetItsDirectory, ensurePathIsDirectory, ensurePngAddedToFileName, makeImagePath, } from './folderUtil'
import * as upath from 'upath';

import * as fse from 'fs-extra';

describe('FolderUtil', () => {

    describe('createImageDirWithImagePath', () => {

        it('valid existing folder 01', async () => {

            const testPath = upath.join(__dirname, 'notRealFile.png').toString();
            const testDir = upath.dirname(testPath);

            expect(await createImageDirWithImagePath(testPath)).toContain(testDir)
        })


        it('valid existing folder 02', async () => {
            const testPath = upath.join(__dirname, '..', 'src', 'test', 'notRealFile.png').toString();
            const testDir = upath.dirname(testPath);

            expect(await createImageDirWithImagePath(testPath)).toBe(testDir)
        })

        it('create folder 01', async () => {
            const testPath = upath.join(__dirname, '..', 'playground', 'folder-test', 'test-to-remove', 'notRealImage.png');
            const testDir = upath.dirname(testPath);


            expect(await createImageDirWithImagePath(testPath)).toBe(testDir);

            // clean up created folder
            let folderStat = await fse.stat(testDir)
            if (folderStat.isDirectory()) {
                await fse.rm(testDir, { recursive: true });
            }
        })
    });

    const testPath = upath.join(__dirname, '..', 'src', 'test').toString();
    it('makeImagePath', async () => {


        expect(await makeImagePath({
            imageFolderPath: "docs/img",
            fileName: 'notRealFile.png',
            editorOpenFilePath: testPath
        })).contain('/src/docs/img/notRealFile.png')
    })


    it('ensurePngAddedToFileName - add .png', async () => {
        expect(ensurePngAddedToFileName('notRealFile')).toBe('notRealFile.png')
    })

    it('ensurePngAddedToFileName - already had', async () => {
        expect(ensurePngAddedToFileName('file.png')).toBe('file.png')
    })

    it('ensurePngAddedToFileName - already had but not lower case', async () => {
        expect(ensurePngAddedToFileName('file.PnG')).toBe('file.PnG')
    })


    it('ensureFileAndGetItsDirectory', async () => {
        const dirName = await ensureFileAndGetItsDirectory(__filename);
        expect(dirName).toBe(__dirname)
    })


    it('ensureFileAndGetItsDirectory - if given directory', async () => {

        await expect(ensureFileAndGetItsDirectory(__dirname)).rejects.toThrow('Not a file but instead a directory:');
    })


    it('ensurePathIsDirectory', async () => {
        const dirName = await ensurePathIsDirectory(__dirname);
        expect(dirName).toBe(__dirname)
    })


    it('ensurePathIsDirectory - if given fileName', async () => {

        await expect(ensurePathIsDirectory(__filename)).rejects.toThrow('Path is file instead of a directory:');
    })


})
