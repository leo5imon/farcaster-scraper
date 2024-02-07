import { FeedType, FilterType } from "@neynar/nodejs-sdk";
import { getClient } from "./client.js";

function isCastValid(cast, likeThreshold, recastThreshold, followerCountThreshold) {
  return (
    (cast.reactions.likes.length > likeThreshold ||
      cast.reactions.recasts.length > recastThreshold) &&
    cast.author.follower_count > followerCountThreshold
  );
}

async function fetchCasts({
  apiKey,
  channelId,
  limit,
  likeThreshold,
  recastThreshold,
  followerCountThreshold,
  urlDomainFilter,
  maxResults,
  maxQueries,
}) {
  const client = getClient(apiKey);

  let allResults = [];
  let nextCursor = null;
  let queryCount = 0;

  do {
    const { casts, next } = await client.fetchFeed(FeedType.Filter, {
      filterType: FilterType.ChannelId,
      channelId: channelId,
      withRecasts: true,
      withReplies: false,
      limit: limit,
      cursor: nextCursor,
    });

    queryCount++;

    const memeUrls = casts
      .filter((cast) => isCastValid(cast, likeThreshold, recastThreshold, followerCountThreshold))
      .flatMap((cast) => cast.embeds ?? [])
      .map(({ url }) => url)
      .filter((url) => url && url.includes(urlDomainFilter));

    allResults.push(...memeUrls);
    nextCursor = next && next.cursor;
  } while (
    nextCursor &&
    (!maxResults || allResults.length < maxResults) &&
    (!maxQueries || queryCount < maxQueries)
  );

  return allResults;
}

export async function fetchCastsHandler(argv) {
  try {
    const results = await fetchCasts({
      apiKey: process.env.NEYNAR_API_KEY,
      channelId: argv.channelId,
      limit: argv.limit,
      likeThreshold: argv.likeThreshold,
      recastThreshold: argv.recastThreshold,
      followerCountThreshold: argv.followerCountThreshold,
      urlDomainFilter: argv.urlDomainFilter,
      maxResults: argv.maxResults,
      maxQueries: argv.maxQueries,
    });

    const uniqueResults = [...new Set(results)];
    uniqueResults.forEach((url) => console.log(url));
  } catch (err) {
    console.error(err);
  }
}
