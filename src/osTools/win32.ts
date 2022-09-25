import { spawn } from "child_process";
import path from "path";
import * as fse from 'fs-extra';
import { ILogger } from "../logger";
import { SaveClipboardImageToFileResult } from "../dto/SaveClipboardImageToFileResult";

export const win32CreateImageWithPowershell = async ({ imagePath, logger }: { imagePath: string; logger: ILogger; }): Promise<SaveClipboardImageToFileResult> => {

    // Windows
    const scriptPath = path.join(__dirname, '../res/pc.ps1');

    if (! await fse.pathExists(scriptPath)) {
        const errorMsg = `Script file not found: ${scriptPath}`
        logger.showErrorMessage(`Script file not found: ${scriptPath}`);
        throw new Error(errorMsg);
    }

    return new Promise<SaveClipboardImageToFileResult>(async (resolve, reject) => {

        let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
        let powershellExisted = fse.existsSync(command)
        if (!powershellExisted) {
            command = "powershell"
        }

        const powershell = spawn(command, [
            '-noprofile',
            '-noninteractive',
            '-nologo',
            '-sta',
            '-executionpolicy', 'unrestricted',
            '-windowstyle', 'hidden',
            '-file', scriptPath,
            imagePath
        ]);
        powershell.on('error', function (e) {
            //if (e.code == "ENOENT") {
            //    log.showErrorMessage(`The powershell command is not in you PATH environment variables. Please add it and retry.`);
            //} else {
            logger.showErrorMessage(e.message);
            reject(e);
            //}
        });
        powershell.on('exit', function (code, signal) {
            // console.log('exit', code, signal);
        });
        powershell.stdout.on('data', function (data: Buffer) {

            resolve({
                success: true,
                noImageInClipboard: false,
                imagePath: imagePath,
                scriptOutput: [data.toString().trim()],

            });
        });



    });
}