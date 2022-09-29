import { spawn } from 'child_process';
import * as upath from 'upath';
import * as fse from 'fs-extra';
import type { ILogger } from '../logger';
import type { SaveClipboardImageToFileResult } from '../dto/SaveClipboardImageToFileResult';
import { ensureFileExistsOrThrow } from '../folderUtil';

export const win32CreateImageWithPowershell = async ({ imagePath, logger }: { imagePath: string; logger: ILogger }): Promise<SaveClipboardImageToFileResult> => {
  // Windows
  const scriptPath = upath.join(__dirname, '../res/windows.ps1');

  await ensureFileExistsOrThrow(scriptPath, logger);

  return new Promise<SaveClipboardImageToFileResult>((resolve) => {
    let outputData = '';
    let command = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
    const powershellExisted = fse.existsSync(command);
    if (!powershellExisted)
      command = 'powershell';

    const powershell = spawn(command, [
      '-noprofile',
      '-noninteractive',
      '-nologo',
      '-sta',
      '-executionpolicy', 'unrestricted',
      '-windowstyle', 'hidden',
      '-file', scriptPath,
      imagePath,
    ]);
    powershell.on('error', (e) => {
      logger.showErrorMessage(e.message);
    });

    powershell.on('exit', async (code, signal) => {
      logger.log(`scriptPath: "${scriptPath}" exit code: ${code} signal: ${signal}`);

      if (code === 0) {
        resolve({
          success: true,
          imagePath,
          noImageInClipboard: false,
          scriptOutput: outputData.split('\n'),
        });
      }
      else {
        resolve({
          success: false,
          noImageInClipboard: outputData.includes('warning: no image in clipboard'),
          scriptOutput: outputData.split('\n'),
        });
      }
    });

    powershell.stdout.on('data', async (data: Buffer) => {
      // save all the output till exit
      outputData += `${data.toString().trim()}\n`;
    });
  });
};
