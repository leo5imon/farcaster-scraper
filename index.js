import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import "dotenv/config";

let allImgurUrls = [];

function fetchCasts({
  apiKey,
  channelId,
  likeThreshold,
  recastThreshold,
  followerCountThreshold,
  limit,
  urlDomainFilter,
  cursor = "",
}) {
  const options = {
    method: "GET",
    headers: { accept: "application/json", api_key: apiKey },
  };

  const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
  const url = `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=channel_id&channel_id=${channelId}&with_recasts=true&with_replies=false&limit=${limit}${cursorParam}`;

  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      if (!data.casts || !Array.isArray(data.casts)) {
        return;
      }

      const casts = data.casts;
      const imgurUrls = casts
        .filter((cast) => {
          return (
            (cast.reactions.likes.length > likeThreshold ||
              cast.reactions.recasts.length > recastThreshold) &&
            cast.author.follower_count > followerCountThreshold
          );
        })
        .flatMap((cast) => cast.embeds ?? [])
        .map((embed) => embed.url)
        .filter((url) => url && url.includes(urlDomainFilter));

      allImgurUrls = [...allImgurUrls, ...imgurUrls];

      if (data.next && data.next.cursor) {
        fetchCasts({ ...arguments[0], cursor: data.next.cursor });
      } else {
        console.log(allImgurUrls);
      }
    })
    .catch((err) => console.error(err));
}

yargs(hideBin(process.argv))
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
        default: 10,
        describe: "Fetch limit",
        type: "number",
      },
      urlDomainFilter: {
        default: "imgur.com",
        describe: "URL domain filter",
        type: "string",
      },
    },
    handler: (argv) => {
      fetchCasts({
        apiKey: process.env.NEYNAR_API_KEY,
        channelId: argv.channelId,
        likeThreshold: argv.likeThreshold,
        recastThreshold: argv.recastThreshold,
        followerCountThreshold: argv.followerCountThreshold,
        limit: argv.limit,
        urlDomainFilter: argv.urlDomainFilter,
      });
    },
  })
  .demandCommand(1, "You must provide at least one command to execute")
  .help().argv;
