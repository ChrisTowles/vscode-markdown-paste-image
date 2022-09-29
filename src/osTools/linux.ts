import { spawn } from 'child_process';
import upath from 'upath';

import type { ILogger } from '../logger';
import type { SaveClipboardImageToFileResult } from '../dto/SaveClipboardImageToFileResult';
import { ensureFileExistsOrThrow } from '../folderUtil';

export const linuxCreateImageWithXClip = async ({ imagePath, logger }: { imagePath: string; logger: ILogger }): Promise<SaveClipboardImageToFileResult> => {
  const scriptPath = upath.join(__dirname, '../res/linux.sh');

  await ensureFileExistsOrThrow(scriptPath, logger);

  return new Promise<SaveClipboardImageToFileResult>((resolve) => {
    let outputData = '';

    const shellScript = spawn('sh', [scriptPath, imagePath]);
    shellScript.on('error', (e) => {
      logger.showErrorMessage(e.message);
    });
    shellScript.on('exit', async (code, signal) => {
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
        if (outputData.includes('error: no xclip found'))
          await logger.showInformationMessage('You need to install "xclip" command app first.');

        resolve({
          success: false,
          noImageInClipboard: outputData.includes('warning: no image in clipboard'),
          scriptOutput: outputData.split('\n'),
        });
      }
    });

    shellScript.stdout.on('data', async (data: Buffer) => {
      // save all the output till exit
      outputData += `${data.toString().trim()}\n`;
    });
  });
};
