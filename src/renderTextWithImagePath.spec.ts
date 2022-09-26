import { describe, expect, it } from 'vitest'
import * as path from 'path';
import util from 'util';
import { getRelativePathFromEditorFile, renderTextWithImagePath } from './renderTextWithImagePath';
import { MockWorkspaceConfiguration } from './test/mockWorkspaceConfiguration';
import { Configuration, parseConfigurationToConfig } from './configuration';
import { MockLogger } from './test/mockLogger';
import { config } from 'process';


const createMockConfig = async ({ projectRootDirPath, editorOpenFilePath }: { projectRootDirPath: string, editorOpenFilePath: string }): Promise<Configuration> => {
    const mockConfig = await parseConfigurationToConfig({
        projectRootDirPath: projectRootDirPath,
        editorOpenFilePath: editorOpenFilePath,
        configuration: new MockWorkspaceConfiguration({ currentDirectory: projectRootDirPath }),
    })
    return mockConfig;
}

describe('renderInsertTextWithImagePath', () => {

    const projectRootDir = path.join(__dirname, '..'); // root of project

    const mockLogger = new MockLogger();


    it('getRelativePathFromEditorFile - when editor and image same folders', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'test-icon-root.png')
        const editorOpenFolderPath = path.join(projectRootDir, 'playground')

        const imageFilePath = await getRelativePathFromEditorFile({
            editorOpenFolderPath: editorOpenFolderPath,
            imageFilePath: imagePath,
            logger: mockLogger,
        });

        expect(imageFilePath).toBe('test-icon-root.png')

    });

    it('getRelativePathFromEditorFile - when editor and image different folders', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'folder-test', 'notRealFile.png')
        const editorOpenFolderPath = path.join(projectRootDir, 'playground')

        const imageFilePath = await getRelativePathFromEditorFile({
            editorOpenFolderPath: editorOpenFolderPath,
            imageFilePath: imagePath,
            logger: mockLogger,
        });

        expect(imageFilePath).toBe('folder-test/notRealFile.png')

    });

    it('getRelativePathFromEditorFile - replace double slashes', async () => {
        const imagePath = path.join(projectRootDir, 'docs//', 'images', 'notRealFile.png')
        const editorOpenFolderPath = path.join(projectRootDir, 'playground')

        const imageFilePath = await getRelativePathFromEditorFile({
            editorOpenFolderPath: editorOpenFolderPath,
            imageFilePath: imagePath,
            logger: mockLogger,
        });

        expect(imageFilePath).toBe('../docs/images/notRealFile.png')

    });


    it('renderTextWithImagePath - markdown render path', async () => {

        const imagePath = path.join(projectRootDir, 'playground', 'folder-test', 'test-icon1.png')
        const editorFile = path.join(projectRootDir, 'playground', 'home.md')

        // console.log(util.inspect(mockConfig, false, null, true /* enable colors */))
        expect(await renderTextWithImagePath({
            languageId: 'markdown',
            config: await createMockConfig({ projectRootDirPath: projectRootDir, editorOpenFilePath: editorFile }),
            imageFilePath: imagePath,
            logger: mockLogger,
        })).toBe('![](folder-test/test-icon1.png)')
    })


    it('renderTextWithImagePath - markdown render text same folder', async () => {

        const imagePath = path.join(projectRootDir, 'playground', 'test-icon-root.png')
        const editorFilePath = path.join(projectRootDir, 'playground', 'home.md')

        // console.log(util.inspect(mockConfig, false, null, true /* enable colors */))
        expect(await renderTextWithImagePath({
            languageId: 'markdown',
            config: await createMockConfig({ projectRootDirPath: projectRootDir, editorOpenFilePath: editorFilePath }),
            imageFilePath: imagePath,
            logger: mockLogger,
        })).toBe('![](test-icon-root.png)')
    })

    it('renderTextWithImagePath - markdown render text same folder', async () => {

        const imagePath = path.join(projectRootDir, 'playground', 'test-icon-root.png')
        const editorFilePath = path.join(projectRootDir, 'playground', 'folder-test', 'test.md')

        // console.log(util.inspect(mockConfig, false, null, true /* enable colors */))
        expect(await renderTextWithImagePath({
            languageId: 'markdown',
            config: await createMockConfig({ projectRootDirPath: projectRootDir, editorOpenFilePath: editorFilePath }),
            imageFilePath: imagePath,
            logger: mockLogger,
        })).toBe('![](../test-icon-root.png)')
    })

})
