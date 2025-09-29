import { spawn } from 'child_process';
import upath from 'upath';

import type { ILogger } from '../logger';
import type { SaveClipboardImageToFileResult } from '../dto/SaveClipboardImageToFileResult';
import { ensureFileExistsOrThrow } from '../folderUtil';

export const linuxCreateImageWithClipboard = async ({ imagePath, logger }: { imagePath: string; logger: ILogger }): Promise<SaveClipboardImageToFileResult> => {
  const scriptPath = upath.join(__dirname, '../res/linux.sh');

  await ensureFileExistsOrThrow(scriptPath, logger);

  return new Promise<SaveClipboardImageToFileResult>((resolve) => {
    let outputData = '';
    let errorData = '';
    let isResolved = false;

    const shellScript = spawn('sh', [scriptPath, imagePath]);
    
    // Set a timeout to prevent hanging processes
    const timeout = setTimeout(() => {
      if (!isResolved) {
        logger.log('Shell script timeout, killing process');
        shellScript.kill('SIGTERM');
        isResolved = true;
        resolve({
          success: false,
          noImageInClipboard: false,
          scriptOutput: ['error: script timeout'],
        });
      }
    }, 10000); // 10 second timeout

    const cleanup = () => {
      clearTimeout(timeout);
      if (!shellScript.killed) {
        shellScript.kill('SIGTERM');
      }
    };

    shellScript.on('error', (e) => {
      logger.log(`Shell script error: ${e.message}`);
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve({
          success: false,
          noImageInClipboard: false,
          scriptOutput: [`error: ${e.message}`],
        });
      }
    });

    shellScript.on('exit', async (code, signal) => {
      logger.log(`scriptPath: "${scriptPath}" exit code: ${code} signal: ${signal}`);
      
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);

        if (code === 0) {
          // Parse the output to extract the actual image path with correct extension
          const lines = outputData.split('\n').filter(line => line.trim());
          const imagePathLine = lines.find(line => line.startsWith('image writen to:'));
          const actualImagePath = imagePathLine ? imagePathLine.replace('image writen to: ', '').trim() : imagePath;
          
          resolve({
            success: true,
            imagePath: actualImagePath,
            noImageInClipboard: false,
            scriptOutput: lines,
          });
        }
        else {
          const allOutput = outputData + errorData;
          
          if (allOutput.includes('error: no wl-paste found'))
            await logger.showInformationMessage('You need to install "wl-paste" (part of wl-clipboard package) first.');

          resolve({
            success: false,
            noImageInClipboard: allOutput.includes('warning: no image in clipboard'),
            scriptOutput: outputData.split('\n').concat(errorData.split('\n')).filter(line => line.trim()),
          });
        }
      }
    });

    shellScript.stdout.on('data', (data: Buffer) => {
      outputData += data.toString();
    });

    shellScript.stderr.on('data', (data: Buffer) => {
      errorData += data.toString();
      logger.log(`Shell script stderr: ${data.toString()}`);
    });

    // Handle process cleanup on unexpected termination
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  });
};
