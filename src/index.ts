import prompt from "prompt-sync";
import { config } from "dotenv-safe";
config();
import seasonPack from "./season-pack";
import episodeHandler from "./episode";
async function main() {
  const userInterface = prompt();

  const seriesName = userInterface("What is the name of the series? ");
  const path = userInterface("What is the path of the series? ");
  const seasons = userInterface(
    "What is the season of the series? (Comma seperated if multiple) ",
  ).split(",");
  const pack = userInterface(
    "Is this a entire season(s) or a single episode? -> Season/Episode ",
  );

  /*
   
  const seriesName = "Chicago PD";
  const path = "/srv/mergerfs/masterdatavault/datavault1/webseries/Chicago PD";
  let seasons = ["1", "2", "3", "5", "6", "7", "8", "9", "10", "11"];
  const pack = "season";
  */
  console.log("Series Name:", seriesName);
  console.log("Path:", path);
  console.log("Season:", seasons);
  console.log("Pack:", pack);
  if (pack.toLowerCase() === "season") {
    console.log("This is a entire season");
    seasonPack(
      path,
      seasons.map((season) => season.replace(/\D/g, "")),
      seriesName,
    );
  } else if (pack.toLowerCase() === "episode") {
    console.log("This is a single episode");
    let season = userInterface("What is the season of the episode? ");
    let episode = userInterface("What is the episode number? ");
    season = season.replace(/\D/g, "");
    episode = episode.replace(/\D/g, "");
    await episodeHandler(parseInt(season), parseInt(episode), seriesName, path);
  } else {
    return console.log("Invalid input");
  }
}

main();
