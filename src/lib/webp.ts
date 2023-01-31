import { execFile } from "child_process";
import { join } from "path";

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
