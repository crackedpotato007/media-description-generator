import prompt from "prompt-sync";
import { readdirSync, existsSync } from "fs";
import { config } from "dotenv-safe";
import { globSync } from "glob";

config();
async function main() {
  const userInterface = prompt();
  /*
  const seriesName = userInterface("What is the name of the series? ");
  const path = userInterface("What is the path of the series? ");
  let seasons = userInterface(
    "What is the season of the series? (Comma seperated if multiple) ",
  ).split(",");
  const pack = userInterface(
    "Is this a entire season or a single episode? -> Season/Episode ",
  );
  */
  const seriesName = "The Big Bang Theory";
  const path = "/srv/mergerfs/masterdatavault/datavault1/webseries/Chicago PD";
  let seasons = ["1", "2", "3", "5", "6", "7", "8", "9", "10", "11"];
  const pack = "season";

  if (pack.toLowerCase() === "season") {
    console.log("This is a entire season");
  } else if (pack.toLowerCase() === "episode") {
    console.log("This is a single episode");
  } else {
    return console.log("Invalid input");
  }
  console.log("Series Name:", seriesName);
  console.log("Path:", path);
  console.log("Season:", seasons);
  console.log("Pack:", pack);
  seasons = seasons.map((season) => season.replace(/\D/g, ""));
  console.log(seasons);
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

  // console.log(seasonEpisodes);
}
main();
