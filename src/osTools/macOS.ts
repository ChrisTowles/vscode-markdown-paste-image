import { spawn } from "child_process";
import * as upath from 'upath';
import * as fse from 'fs-extra';
import { ILogger } from "../logger";
import { SaveClipboardImageToFileResult } from "../dto/SaveClipboardImageToFileResult";
import { ensureFileExistsOrThrow } from "../folderUtil";

export const macCreateImageWithAppleScript = async ({ imagePath, logger }: { imagePath: string; logger: ILogger; }): Promise<SaveClipboardImageToFileResult> => {

    // Mac
    let scriptPath = upath.join(__dirname, '../res/mac.applescript');

    await ensureFileExistsOrThrow(scriptPath, logger);
    
    return new Promise<SaveClipboardImageToFileResult>(async (resolve, reject) => {

        let outputData: string = '';
        let appleScript = spawn('osascript', [
            '-so', //  this print script errors to stdout. https://ss64.com/osx/osascript.html
            scriptPath,
            imagePath]
        );
 
        appleScript.on('error', function (e) {
            logger.showErrorMessage(e.message);
        });


        appleScript.stdout.on('data', async function (data: Buffer) {
            // save all the output till exit
            outputData += data.toString().trim() + '\n';
        });

        appleScript.on('exit', async function (code, signal) {

            logger.log(`scriptPath: "${scriptPath}" exit code: ${code} signal: ${signal}`);

            if (code === 0) {
                resolve({
                    success: true,
                    imagePath: imagePath,
                    noImageInClipboard: false,
                    scriptOutput: outputData.split('\n'),
                });

            } else {

                resolve({
                    success: false,
                    noImageInClipboard: outputData.includes("warning: no image in clipboard"),
                    scriptOutput: outputData.split('\n'),
                });
            }
        });






    });
}