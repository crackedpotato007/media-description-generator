import { existsSync, readFileSync, readdirSync } from "fs";
import axios from "axios";
import mkscreenshot from "./utility/mkscreenshot";
import upload from "./utility/upload-imgur";
import { resolve } from "path";
import { execSync } from "child_process";
import { globSync } from "glob";
async function main(
  season_number: number,
  episode_number: number,
  series_name: string,
  path: string,
) {
  //prettier-ignore
  const pathExists = existsSync(path.replaceAll("\"", ""));
  if (!pathExists) {
    return console.log("Invalid path");
  }
  let files: string[] | string = [];
  if (
    !path.endsWith(".mp4") &&
    !path.endsWith(".mkv") &&
    !path.endsWith(".avi")
  ) {
    //prettier-ignore
    files = globSync(path.replaceAll("\"", "") + "/**/*").filter(x => x.endsWith(".mp4") || x.endsWith(".mkv") || x.endsWith(".avi"));
  } else files = [path];
  if (files.length === 0) {
    return console.log("No video files found");
  }
  const showSearch = await axios.get(
    `https://api.themoviedb.org/3/search/tv?query=${series_name}&include_adult=false&language=en-US&page=1`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        accept: "application/json",
      },
    },
  );
  if (showSearch.status !== 200) {
    return console.log("Error fetching show details");
  }
  const showprelimdata = showSearch.data.results[0];
  if (!showprelimdata) {
    return console.log("No show found");
  }
  const showId = showprelimdata.id;
  const episodeDetails = await axios.get(
    `https://api.themoviedb.org/3/tv/${showId}/season/${season_number}/episode/${episode_number}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        accept: "application/json",
      },
    },
  );
  if (episodeDetails.status !== 200) {
    return console.log("Error fetching episode details");
  }
  const episodeData = episodeDetails.data;
  await mkscreenshot(path);
  const screenshots = readdirSync(resolve(__dirname, "../screenshots"));
  const screenURLs = [];
  for (const screenshot of screenshots) {
    const screenshotPath = resolve(__dirname, "../screenshots", screenshot);
    const uploadRes = await upload(readFileSync(screenshotPath, "base64"));
    screenURLs.push(uploadRes);
  }
  const thumbnail = await axios.get(
    "https://image.tmdb.org/t/p/w1280" + episodeData.still_path,
    {
      responseType: "arraybuffer",
    },
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const thumbnailURL = await upload(
    Buffer.from(thumbnail.data, "binary").toString("base64"),
  );
  const video = await execSync(`mediainfo "${files[0]}"`);
  console.log("[center][img]" + thumbnailURL + "[/img]");
  console.log(
    `[title=purple] ${series_name} - ${episodeData.name} [/title][/center]`,
  );
  console.log("[icon=plot2]");
  console.log(episodeData.overview);

  console.log("[icon=info3]");
  console.log("Media Info");
  console.log("[pre]");
  console.log(video.toString());
  console.log("[/pre]");
  console.log(
    `TMDB URL -> https://www.themoviedb.org/tv/${showId}/season/${season_number}/episode/${episode_number}`,
  );
  console.log("[icon=screens2]");
  for (const screenshot of screenURLs) {
    console.log(`[img]${screenshot}[/img]`);
  }
  // eslint-disable-next-line no-useless-escape
  execSync(`mktorrent -a ${process.env.ANNOUNCE_URL!} -p \"${path}\" `);
}
export default main;
