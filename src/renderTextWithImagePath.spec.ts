import { describe, expect, it } from 'vitest'
import * as path from 'path';
import util from 'util';
import { renderTextWithImagePath } from './renderTextWithImagePath';
import { MockWorkspaceConfiguration } from './test/mockWorkspaceConfiguration';
import { parseConfigurationToConfig } from './configuration';
import { MockLogger } from './test/mockLogger';

describe('renderInsertTextWithImagePath', () => {

    const projectRootDir = path.join(__dirname, '..');
    const mockConfig = parseConfigurationToConfig({
        projectPath: __dirname,
        editorOpenFilePath: __dirname,
        configuration: new MockWorkspaceConfiguration({currentDirectory: projectRootDir}),
    })
    const mockLogger =  new MockLogger();
   
    const testPath = path.join(__dirname, '..', 'src', 'test').toString();
    it('makeImagePath', async () => {

        console.log(util.inspect(mockConfig, false, null, true /* enable colors */))
        expect(renderTextWithImagePath({
            languageId: 'markdown',
            config: mockConfig,
            imageFilePath: path.join(projectRootDir, 'docs', 'images', 'notRealFile.png'),
            logger: mockLogger,
            
        })).contain('![](docs/images/notRealFile.png)')
    })

})
