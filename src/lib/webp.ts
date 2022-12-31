import { execFile } from 'child_process';
import { join } from "path";

const getBin = () => {
    const file = `cwebp${process.platform === "win32" ? ".exe" : ""}`;
    const platform = process.platform === "win32" ? "win" : "linux";
    return join(process.cwd(),"bin",`${platform}/${file}`);
}

export function cwebp(input: string, out: string, ...opt: string[]): Promise<string> {
    return new Promise((ok,rej)=>{
        execFile(getBin(),opt.concat(["-o",out,"--",input]),(error, stdout, stderr) =>{
            if(error) return rej(error);
            ok(stdout.trim() ?? stderr.trim());
        });
    });
} 