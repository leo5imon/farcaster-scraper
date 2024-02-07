import 'dotenv/config'

// Configuration variables
const API_KEY = process.env.NEYNAR_API_KEY;
const CHANNEL_ID = 'memes';
const LIKE_THRESHOLD = 30;
const RECAST_THRESHOLD = 15;
const FOLLOWER_COUNT_THRESHOLD = 20;
const FETCH_LIMIT = 100;
const URL_DOMAIN_FILTER = 'imgur.com';

const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: API_KEY}
};

let allImgurUrls = [];

function fetchCasts(cursor = '') {
    const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
    const url = `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=channel_id&channel_id=${CHANNEL_ID}&with_recasts=true&with_replies=false&limit=${FETCH_LIMIT}${cursorParam}`;
    
    fetch(url, options)
      .then(response => response.json())
      .then(data => {
          if (!data.casts || !Array.isArray(data.casts)) {
              return;
          }

          const casts = data.casts;
          const imgurUrls = casts.filter(cast => {
              return (cast.reactions.likes.length > LIKE_THRESHOLD || cast.reactions.recasts.length > RECAST_THRESHOLD) && cast.author.follower_count > FOLLOWER_COUNT_THRESHOLD;
          }).flatMap(cast => cast.embeds ?? [])
            .map(embed => embed.url)
            .filter(url => url && url.includes(URL_DOMAIN_FILTER));

          allImgurUrls = [...allImgurUrls, ...imgurUrls];

          if (data.next && data.next.cursor) {
              fetchCasts(data.next.cursor);
          } else {
              console.log(allImgurUrls);
          }
      })
      .catch(err => console.error(err));
}

fetchCasts();