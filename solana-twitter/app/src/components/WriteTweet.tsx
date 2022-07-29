import { FC, useCallback, useState } from "react";
import { AnchorWallet, useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { TweetObject } from "../models/types";
import * as anchor from "@project-serum/anchor";
import * as util from '../utils/util';


interface WriteTweetProps {
    getAllTweets: (wallet: AnchorWallet | undefined) => void,
    publicKey: anchor.web3.PublicKey,
    twitterAccountPublicKey: anchor.web3.PublicKey,
    name: string,
    handle: string,
    tweetCount: number,
};

export const WriteTweet: FC<WriteTweetProps> = (props: WriteTweetProps) => {

    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const [name, setName] = useState(props.name);
    const [handle, setHandle] = useState(props.handle);
    const [tweetCount, setTweetCount] = useState(props.tweetCount);

    const [message, setMessage] = useState('');

    async function publishTweet(message: string) {
        if (!wallet) throw("Wallet not connected!");
        const [tx, provider] = await util.createTweetTransaction(wallet, message);
        const sx = await sendTransaction(tx, provider.connection);
        await provider.connection.confirmTransaction(sx);
    };

    const onClickPublishTweet = useCallback(async (form: TweetObject) => {
        await publishTweet(form.message);
        props.getAllTweets(wallet);
    }, [wallet, props]);

    return(
        <div>
            <h2>Solana Twitter</h2>
            <p>{props.publicKey.toString()}</p>
            <p>{props.twitterAccountPublicKey.toString()}</p>
            <p>{props.name}</p><p>{props.handle}</p>
            <input placeholder="What's on your mind?" onChange={(e) => setMessage(e.target.value)}/>
            <button onClick={() => onClickPublishTweet(
                {
                    publicKey: props.publicKey,
                    twitterAccountPublicKey: props.twitterAccountPublicKey,
                    name: props.name,
                    handle: props.handle,
                    message: message,
                }
            )}><span>Publish</span></button>
        </div>
    );
};