import { describe, expect, it } from 'vitest'
import { createImageDirWithImagePath, makeImagePath,  } from './folderUtil'
import * as path from 'path';

import * as fse from 'fs-extra';

describe('FolderUtil', () => {


    describe('createImageDirWithImagePath', () => {



        it('valid existing folder 01', async () => {

            const testPath = path.join(__dirname, 'notRealFile.png').toString();
            const testDir = path.dirname(testPath);

            expect(await createImageDirWithImagePath(testPath)).toContain(testDir)
        })


        it('valid existing folder 02', async () => {
            const testPath = path.join(__dirname, '..', 'src', 'test', 'notRealFile.png').toString();
            const testDir = path.dirname(testPath);

            expect(await createImageDirWithImagePath(testPath)).toBe(testDir)
        })

        it('create folder 01', async () => {
            const testPath = path.join(__dirname, '..', 'dist', 'not-real-folder', 'notRealImage.png').toString();
            const testDir = path.dirname(testPath);


            expect(await createImageDirWithImagePath(testPath)).toBe(testDir);

            // clean up created folder
            let folderStat = await fse.stat(testDir)
            if (folderStat.isDirectory()) {
                await fse.rmdir(testDir);
            }
        })
    });

    describe('makeImagePath', () => {

        const testPath = path.join(__dirname, '..', 'src', 'test').toString();
        it('image page 01', async () => {
            
            
            expect(await makeImagePath({
                folderPathFromConfig: "docs/img",
                fileName: 'notRealFile.png',
                filePath: testPath
            })).contain('/src/docs/img/notRealFile.png')
        })

    });

})
