import { existsSync, readFileSync, readdirSync } from "fs";
import { globSync } from "glob";
import axios from "axios";
import mkscreenshot from "./utility/mkscreenshot";
import upload from "./utility/upload-imgur";
import { resolve } from "path";
import { execSync } from "child_process";
async function main(movie_name: string, path: string) {
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
  const search = await axios.get(
    `https://api.themoviedb.org/3/search/movie?query=${movie_name}&include_adult=false&language=en-US&page=1`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        accept: "application/json",
      },
    },
  );
  if (search.status !== 200) {
    return console.log("Error fetching movie details");
  }
  const prelimdata = search.data.results[0];
  if (!prelimdata) {
    return console.log("No movie found");
  }
  const movieId = prelimdata.id;
  const movieDetails = await axios.get(
    `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        accept: "application/json",
      },
    },
  );
  if (movieDetails.status !== 200) {
    return console.log("Error fetching movie details");
  }
  const movieData = movieDetails.data;
  await mkscreenshot(files[0]);
  const ssfiles = await readdirSync(resolve(__dirname, "../screenshots"));
  const screenshots = [];
  for (const file of ssfiles) {
    const url = await upload(
      readFileSync(resolve(__dirname, "../screenshots", file), "base64"),
    );
    screenshots.push(url);
  }
  console.log(screenshots);
  const thumbnail = await axios.get(
    `https://image.tmdb.org/t/p/w1280${movieData.poster_path}`,
    { responseType: "arraybuffer" },
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const thumbnailURL = await upload(
    Buffer.from(thumbnail.data, "binary").toString("base64"),
  );
  const video = await execSync(`mediainfo "${files[0]}"`);
  console.log(`[center][img]${thumbnailURL}[/img]`);
  console.log(`[title=purple] ${movieData.original_title}[/title][/center]`);
  console.log("[icon=plot2]");
  console.log(movieData.overview);

  console.log("[icon=info3]");
  console.log("Media Info");
  console.log("[pre]");
  console.log(video.toString());
  console.log("[/pre]");
  console.log(`IMDB URL -> https://www.imdb.com/title/${movieData.imdb_id}/`);
  console.log("[icon=screens2]");
  for (const screenshot of screenshots) {
    console.log(`[img]${screenshot}[/img]`);
  }
  // eslint-disable-next-line no-useless-escape
  execSync(`mktorrent -a ${process.env.ANNOUNCE_URL!} -p \"${path}\" -l 23`);
}
export default main;
