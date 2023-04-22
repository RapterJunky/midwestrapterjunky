import { extname, basename, join } from 'node:path';
import { execFile } from "node:child_process";
import { unlink } from 'node:fs/promises';

/**
 * Given a image filepath it compiles it into a webp image
 */
export const compileWebp = async (filePath: string) => {
  const filename = basename(filePath);
  const ext = extname(filename);

  const webpFilename = filename.replace(ext, ".webp");
  const webpFilepath = filePath.replace(filename, webpFilename);

  await cwebp(filePath, webpFilepath);

  await unlink(filePath);

  return {
    filepath: webpFilepath,
    filename: webpFilename
  }
}

/**
 * Get the binary file path for the webp compiler
 *
 * @see https://vercel.com/guides/loading-static-file-nextjs-api-route
 * @return {*}
 */
const getBin = () => {
  const file = `cwebp${process.platform === "win32" ? ".exe" : ""}`;
  const platform = process.platform === "win32" ? "win" : "linux";
  return join(process.cwd(), "bin", `${platform}/${file}`);
};

/**
 * Convert the given image into the webp format.
 *
 * @export
 * @param {string} input
 * @param {string} out
 * @param {...string[]} opt
 * @return {*}  {Promise<string>}
 */
export function cwebp(
  input: string,
  out: string,
  ...opt: string[]
): Promise<string> {
  return new Promise((ok, rej) => {
    execFile(
      getBin(),
      opt.concat(["-o", out, "--", input]),
      (error, stdout, stderr) => {
        if (error) return rej(error);
        ok(stdout.trim() ?? stderr.trim());
      }
    );
  });
}
