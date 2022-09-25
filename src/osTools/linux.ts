import { spawn } from "child_process";
import path from "path";
import * as fse from 'fs-extra';
import { ILogger } from "../logger";
import { SaveClipboardImageToFileResult } from "../dto/SaveClipboardImageToFileResult";

export const linuxCreateImageWithXClip = async ({ imagePath, logger }: { imagePath: string; logger: ILogger; }): Promise<SaveClipboardImageToFileResult>  =>{
    let scriptPath = path.join(__dirname, '../res/linux.sh');

    if(! await fse.pathExists(scriptPath)) {
        logger.showErrorMessage(`Script file not found: ${scriptPath}`);
    }
    return new Promise<SaveClipboardImageToFileResult>((resolve, reject) => {

        let ascript = spawn('sh', [scriptPath, imagePath]);
        ascript.on('error', function (e) {
            logger.showErrorMessage(e.message);
        });
        ascript.on('exit', function (code, signal) {
            logger.log(`scriptPath: "${scriptPath}" exit code: ${code} signal: ${signal}`);
        });
        ascript.stdout.on('data', function (data: Buffer) {
            let result = data.toString().trim();
            logger.log(`script result data: ${data}`);
            if (result.includes("no xclip found")) {
                logger.showInformationMessage('You need to install "xclip" command app first.');
                resolve({
                    success: false,
                });
            }
            
            resolve({
                success: true,
                paths: {
                    imagePath: imagePath,
                    imagePathFromScript: result,
                }
            });
        });
    });
}