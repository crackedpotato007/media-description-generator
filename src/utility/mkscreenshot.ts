import { execSync } from "child_process";
import * as ffmpeg from "ffmpeg";
import { existsSync, mkdirSync, rmSync } from "fs";
import { resolve } from "path";
console.log(ffmpeg.default);
async function main(path: string, number = 5) {
  if (existsSync(resolve(__dirname, "../../screenshots"))) {
    rmSync(resolve(__dirname, "../../screenshots"), { recursive: true });
    mkdirSync(resolve(__dirname, "../../screenshots"));
  }

  for (let i = 0; i < number; i++) {
    execSync(
      // eslint-disable-next-line no-useless-escape
      `ffmpeg   -ss 0:${i}:59   -i \"${path}\"  -update true -frames:v 1 ${resolve(__dirname, `../../screenshots/${i}.jpg`)}`,
      { stdio: "pipe" },
    );
  }
}
export default main;
