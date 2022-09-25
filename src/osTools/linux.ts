import { spawn } from "child_process";
import path from "path";
import * as fse from 'fs-extra';
import { ILogger } from "../logger";
import { SaveClipboardImageToFileResult } from "../dto/SaveClipboardImageToFileResult";

export const linuxCreateImageWithXClip = async ({ imagePath, logger }: { imagePath: string; logger: ILogger; }): Promise<SaveClipboardImageToFileResult>  =>{
    let scriptPath = path.join(__dirname, '../res/linux.sh');
    
    if(! await fse.pathExists(scriptPath)) {
        const errorMsg = `Script file not found: ${scriptPath}`
        logger.showErrorMessage(errorMsg);
        throw  new Error(errorMsg);
    }

    return new Promise<SaveClipboardImageToFileResult>((resolve, reject) => {
        

        let outputData: string = '';

        let shellScript = spawn('sh', [scriptPath, imagePath]);
        shellScript.on('error', function (e) {
            logger.showErrorMessage(e.message);
        });
        shellScript.on('exit', async function (code, signal) {
            logger.log(`scriptPath: "${scriptPath}" exit code: ${code} signal: ${signal}`);

            if(code === 0) {
                resolve({
                    success: true,
                    imagePath: imagePath,
                    noImageInClipboard: false,
                    scriptOutput: outputData.split('\n'),
                }); 
                
            } else {
            
                outputData.split('\n').forEach(line => {
                     logger.log(`script result data: ${line}`);
                });

                if (outputData.includes("error: no xclip found")) {
                    await logger.showInformationMessage('You need to install "xclip" command app first.');
                }
                
                resolve({
                    success: false,
                    noImageInClipboard: outputData.includes("warning: no image in clipboard"),
                    scriptOutput: outputData.split('\n'),
                });
            }


        });

        shellScript.stdout.on('data', async function (data: Buffer) {
            // save all the output till exit
            outputData += data.toString().trim() + '\n';
        });
    });
}