import * as anchor from "@project-serum/anchor";

export interface ProfileProps {
    publicKey: anchor.web3.PublicKey,
    twitterAccountPublicKey: anchor.web3.PublicKey,
    displayName: string,
    handle: string,
    tweetCount: number,
};

export interface TweetProps {
    publicKey: anchor.web3.PublicKey,
    twitterAccountPublicKey: anchor.web3.PublicKey,
    name: string,
    handle: string,
    message: string,
};

export interface WriteTweetProps {
    publicKey: anchor.web3.PublicKey,
    twitterAccountPublicKey: anchor.web3.PublicKey,
    name: string,
    handle: string,
    tweetCount: number,
};