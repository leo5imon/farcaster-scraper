import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { fetchCastsHandler } from "./commands.js";

yargs(hideBin(process.argv))
  .version(false)
  .command({
    command: "fetch",
    describe: "Fetch Imgur URLs from Neynar API based on criteria",
    builder: {
      channelId: {
        default: "memes",
        describe: "Channel ID",
        type: "string",
      },
      likeThreshold: {
        default: 30,
        describe: "Like threshold",
        type: "number",
      },
      recastThreshold: {
        default: 15,
        describe: "Recast threshold",
        type: "number",
      },
      followerCountThreshold: {
        default: 20,
        describe: "Follower count threshold",
        type: "number",
      },
      limit: {
        default: 100,
        describe: "Fetch limit",
        type: "number",
        coerce: (limit) => Math.min(limit, 100),
      },
      urlDomainFilter: {
        default: "imgur.com",
        describe: "URL domain filter",
        type: "string",
      },
      maxResults: {
        describe: "Maximum number of results to fetch",
        type: "number",
      },
      maxQueries: {
        describe: "Maximum number of queries to make",
        type: "number",
      },
    },
    handler: fetchCastsHandler,
  })
  .demandCommand(1, "You must provide at least one command to execute")
  .help().argv;
