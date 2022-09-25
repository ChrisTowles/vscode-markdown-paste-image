import { spawn } from "child_process";
import path from "path";
import * as fse from 'fs-extra';
import { ILogger } from "../logger";
import { SaveClipboardImageToFileResult } from "../dto/SaveClipboardImageToFileResult";

export const macCreateImageWithAppleScript = async ({ imagePath, logger }: { imagePath: string; logger: ILogger; }): Promise<SaveClipboardImageToFileResult> => {

    // Mac
    let scriptPath = path.join(__dirname, '../res/mac.applescript');


    if (! await fse.pathExists(scriptPath)) {
        const errorMsg = `Script file not found: ${scriptPath}`
        logger.showErrorMessage(errorMsg);
        throw new Error(errorMsg);
    }

    return new Promise<SaveClipboardImageToFileResult>(async (resolve, reject) => {

        let appleScript = spawn('osascript', [scriptPath, imagePath]);
        appleScript.on('error', function (e) {
            logger.showErrorMessage(e.message);
            reject(e);
        });
        appleScript.on('exit', function (code, signal) {
            // console.log('exit',code,signal);
        });
        appleScript.stdout.on('data', function (data: Buffer) {

            resolve({
                success: true,
                noImageInClipboard: false,
                imagePath: imagePath,
                scriptOutput: [data.toString().trim()],

            });
        });



    });
}