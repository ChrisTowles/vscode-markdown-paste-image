import { spawn } from 'child_process';
import upath from 'upath';
import type { ILogger } from '../logger';
import type { SaveClipboardImageToFileResult } from '../dto/SaveClipboardImageToFileResult';
import { ensureFileExistsOrThrow } from '../folderUtil';

export const macCreateImageWithAppleScript = async ({ imagePath, logger }: { imagePath: string; logger: ILogger }): Promise<SaveClipboardImageToFileResult> => {
  // Mac
  const scriptPath = upath.join(__dirname, '../res/mac.applescript');

  await ensureFileExistsOrThrow(scriptPath, logger);

  return new Promise<SaveClipboardImageToFileResult>((resolve) => {
    let outputData = '';
    const appleScript = spawn('osascript', [
      '-so', //  this print script errors to stdout. https://ss64.com/osx/osascript.html
      scriptPath,
      imagePath],
    );

    appleScript.on('error', (e) => {
      logger.showErrorMessage(e.message);
    });

    appleScript.stdout.on('data', async (data: Buffer) => {
      // save all the output till exit
      outputData += `${data.toString().trim()}\n`;
    });

    appleScript.on('exit', async (code, signal) => {
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
  });
};
