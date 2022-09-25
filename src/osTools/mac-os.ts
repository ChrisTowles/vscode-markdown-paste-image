import { spawn } from "child_process";
import path from "path";
import * as fse from 'fs-extra';
import { ILogger } from "../logger";
import { SaveClipboardImageToFileResult } from "../dto/SaveClipboardImageToFileResult";

export const macCreateImageWithAppleScript = async ({ imagePath, logger }: { imagePath: string; logger: ILogger; }): Promise<SaveClipboardImageToFileResult>  =>{
 
    return new Promise<SaveClipboardImageToFileResult>(async (resolve, reject) => {

        // Mac
        let scriptPath = path.join(__dirname, '../../res/mac.applescript');


        if(! await fse.pathExists(scriptPath)) {
            logger.showErrorMessage(`Script file not found: ${scriptPath}`);
        }


        let ascript = spawn('osascript', [scriptPath, imagePath]);
        ascript.on('error', function (e) {
            logger.showErrorMessage(e.message);
            reject(e);
        });
        ascript.on('exit', function (code, signal) {
            // console.log('exit',code,signal);
        });
        ascript.stdout.on('data', function (data: Buffer) {
            

            resolve({
                success: true,
                noImageInClipboard: false,
                imagePath: imagePath,
                scriptOutput: [data.toString().trim()],
                
            });
        });
            
 
        
    });
}