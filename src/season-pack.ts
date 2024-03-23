import { globSync } from "glob";
import axios from "axios";
import mkscreenshot from "./utility/mkscreenshot";
import upload from "./utility/upload-imgur";
import { resolve } from "path";
import { readdirSync, existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
async function main(path: string, seasons: string[], seriesName: string) {
  //prettier-ignore
  const pathExists = existsSync(path.replaceAll("\"", ""));
  if (!pathExists) {
    return console.log("Invalid path");
  }
  //prettier-ignore
  let files = globSync(path.replaceAll("\"", "") + "/**/*")

  files = files.filter(
    (file) =>
      file.endsWith(".mp4") || file.endsWith(".mkv") || file.endsWith(".avi"),
  );
  //file names contain "S01E01" or "1x01" or "1x1" or "S1E1"
  const regex = /S\d{1,2}E\d{1,2}|\d{1,2}x\d{1,2}/;
  const episodes = files.filter((file) => regex.test(file));
  //create a new array with the episode number
  const episodeNumbers = episodes.map((episode) => {
    const match = episode.match(regex);
    if (match) {
      return match[0];
    }
  });
  // console.log(episodeNumbers);

  //create sub arrays for each seasons episodes might be in the format S01E01 or 1x01 or 1x1 or S1E1
  const seasonEpisodes = seasons.map((season) => {
    const regex = new RegExp(`S0?${season}E\\d{1,2}|${season}?x\\d{1,2}`);

    return episodeNumbers.filter((episode) => {
      //   console.log(episode, regex.test(episode!), season);
      return regex.test(episode!);
    });
  });
  const seasonEpisodesCount = seasonEpisodes.map((season) => season.length);
  const showSearch = await axios.get(
    `https://api.themoviedb.org/3/search/tv?query=${seriesName}&include_adult=false&language=en-US&page=1`,
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
  const showDetails = await axios.get(
    `https://api.themoviedb.org/3/tv/${showId}?language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        accept: "application/json",
      },
    },
  );
  // console.log(showDetails.data.seasons);
  if (showDetails.status !== 200) {
    return console.log("Error fetching show details");
  }
  const showSeasonData = showDetails.data.seasons;
  const showSeasons = showDetails.data.seasons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((season: any) => season.name.replace(/\D/g, ""))
    .filter((season: string) => season !== "");

  for (const [ind, showSeason] of showSeasons.entries()) {
    //console.log(showSeason, seasonEpisodesCount[ind]);

    if (
      parseInt(showSeason) !== seasonEpisodesCount[ind] &&
      seasonEpisodesCount[ind] !== 0
    ) {
      console.log(
        `Season ${showSeason} has ${showSeasonData[ind].episode_count} episodes but ${seasonEpisodesCount[ind]} episodes found`,
      );
    }
  }
  await mkscreenshot(files[0]);
  const screenshots = readdirSync(resolve(__dirname, "../screenshots"));
  // console.log(screenshots);
  const screenshotURLs = [];
  for (const screenshot of screenshots) {
    // console.log(screenshot);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    screenshotURLs.push(
      await upload(
        readFileSync(
          resolve(__dirname, "../screenshots", screenshot),
          "base64",
        ),
      ),
    );
  }
  const thumbnail = await axios.get(
    "https://image.tmdb.org/t/p/w1280" + showDetails.data.poster_path,
    {
      responseType: "arraybuffer",
    },
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const thumbnailURL = await upload(
    Buffer.from(thumbnail.data, "binary").toString("base64"),
  );
  const video = await execSync(`mediainfo "${files[0]}"`);
  console.log(`[center][img]${thumbnailURL}[/img]`);
  console.log(`[title=purple] ${seriesName} [/title][/center]`);
  console.log("[icon=info3]");
  console.log("Media Info");
  console.log("[pre]");
  console.log(video.toString());
  console.log("[/pre]");
  console.log(
    `TMDB URL -> https://www.themoviedb.org/tv/${showDetails.data.id}`,
  );
  console.log("Seasons");
  for (const season of showSeasonData) {
    if (season.season_number === 0) continue;
    console.log(
      `Season ${season.season_number} -> ${seasonEpisodes[season.season_number - 1]} episodes`,
    );
  }
  console.log("[icon=screens2]");
  for (const screenshot of screenshotURLs) {
    console.log(`[img]${screenshot}[/img]`);
  }
  // eslint-disable-next-line no-useless-escape
  execSync(`mktorrent -a ${process.env.ANNOUNCE_URL!} -p \"${path}\" `);
}
export default main;
