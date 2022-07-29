import { FC, useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import useTweetsStore from "../stores/TweetStore";
import { ProfileObject, TweetObject } from '../models/types';
import { WriteTweet } from './WriteTweet';
import { Tweet } from "./Tweet";
import * as util from '../utils/util';


export const SolanaTwitter: FC = () => {

    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const [twitterAccountPubkey, setTwitterAccountPubkey] = useState<any>(null);
    const [name, setName] = useState<string>('');
    const [handle, setHandle] = useState<string>('');
    const [tweetCount, setTweetCount] = useState<number>(0);
    const [profileInit, setProfileInit] = useState<boolean>(false);

    const { tweets, getAllTweets } = useTweetsStore();

    async function createSolanaTwitterAccount() {
        if (!wallet) throw("Wallet not connected!")
        const [tx, provider] = await util.createProfileTransaction(wallet, handle, name);
        const sx = await sendTransaction(tx, provider.connection);
        await provider.connection.confirmTransaction(sx);
    };

    const onClickCreateAccount = useCallback(async () => {
        await createSolanaTwitterAccount();
        setProfileInit(true);
    }, [wallet, handle, name]);

    useEffect(() => {
        const getProfileInfo = async () => {
            try {
                if (!wallet) throw("Wallet not connected!");
                const profileInfo: ProfileObject = await util.getProfile(wallet);
                setTwitterAccountPubkey(profileInfo.publicKey.toString());
                setName(profileInfo.displayName);
                setHandle(profileInfo.handle);
                setTweetCount(profileInfo.tweetCount);
                setProfileInit(true);
            } catch (e) {
                console.log(e);
            };
        };
        getProfileInfo();
        getAllTweets(wallet);
    }, [wallet]);

    const welcomeHeader = () => {
        return(
            <div>
                <h2>Welcome to Solana Twitter!</h2>
            </div>
        );
    };

    return (
        <div>
            <WalletMultiButton/>
            { wallet ?
            <div>
                { profileInit ?
                    <div>
                        <WriteTweet getAllTweets={getAllTweets} publicKey={wallet.publicKey} twitterAccountPublicKey={twitterAccountPubkey} name={name} handle={handle} tweetCount={tweetCount}/>
                        {tweets.map((tweet, i) => {
                            return <Tweet key={i} publicKey={tweet.publicKey} twitterAccountPublicKey={twitterAccountPubkey} name={tweet.name} handle={tweet.handle} message={tweet.message}/>
                        })}
                    </div>
                    :
                    <div>
                        {welcomeHeader()}
                        <div>
                            <input type="text" placeholder="Display Name" onChange={e => setName(e.target.value)}/>
                            <input type="text" placeholder="Handle (ie. @solana-on-twitter)" onChange={e => setHandle(e.target.value)}/>
                            <button onClick={() => onClickCreateAccount()}><span>Create Account</span></button>
                        </div>
                        <p>{name}</p>
                    </div>
                }
            </div>
            :
            <div>
                {welcomeHeader()}
                <p>Connect your wallet to create an account or use your existing account.</p>
            </div>
            }
        </div>
    );
};
