import { describe, expect, it } from 'vitest'
import * as path from 'path';
import { encodeImagePath, getRelativePathFromEditorFile, renderTextWithImagePath } from './renderTextWithImagePath';
import { MockWorkspaceConfiguration } from './test/mockWorkspaceConfiguration';
import { Configuration, EncodePathEnum, parseConfigurationToConfig } from './configuration';
import { MockLogger } from './test/mockLogger';



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

    it('encodeImagePath - UrlEncodeSpace without spaces', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'test-icon-root.png')
        const result = encodeImagePath({imageFilePath: imagePath, encodePath: EncodePathEnum.UrlEncodeSpace})

        expect(result).toContain('test-icon-root.png')
    })

    it('encodeImagePath - UrlEncodeSpace with spaces', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'test icon root.png')
        const result = encodeImagePath({imageFilePath: imagePath, encodePath: EncodePathEnum.UrlEncodeSpace})

        expect(result).toContain('test%20icon%20root.png')
    })

    
    it('encodeImagePath - UrlEncode without spaces', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'test-icon-root.png')
        const result = encodeImagePath({imageFilePath: imagePath, encodePath: EncodePathEnum.UrlEncode})

        expect(result).toContain('test-icon-root.png')
    })

    it('encodeImagePath - UrlEncode with spaces', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'test icon root.png')
        const result = encodeImagePath({imageFilePath: imagePath, encodePath: EncodePathEnum.UrlEncode})

        expect(result).toContain('test%20icon%20root.png')
    })
    it('encodeImagePath - UrlEncode with special chars', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'image-file-with-special-chars-шеллы.png')
        const result = encodeImagePath({imageFilePath: imagePath, encodePath: EncodePathEnum.UrlEncode})

        expect(result).toContain('image-file-with-special-chars-%D1%88%D0%B5%D0%BB%D0%BB%D1%8B.png')
    })

    it('encodeImagePath - None without spaces', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'test-icon-root.png')
        const result = encodeImagePath({imageFilePath: imagePath, encodePath: EncodePathEnum.None})

        expect(result).toContain('test-icon-root.png')
    })
    it('encodeImagePath - None with spaces', async () => {
        const imagePath = path.join(projectRootDir, 'playground', 'test icon root.png')
        const result = encodeImagePath({imageFilePath: imagePath, encodePath: EncodePathEnum.None})

        expect(result).toContain('test icon root.png')
    })

})
