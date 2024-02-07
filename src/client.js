import { NeynarAPIClient } from "@neynar/nodejs-sdk";

export const getClient = (apiKey) => new NeynarAPIClient(apiKey);
