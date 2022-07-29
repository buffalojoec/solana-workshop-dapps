import { FC } from "react";
import { TweetObject } from "../models/types";


export const Tweet: FC<TweetObject> = (props: TweetObject) => {
    return(
        <div>
            <p>{props.publicKey.toString()}</p>
            <p>{props.name}</p>
            <p>{props.handle}</p>
            <p>{props.message}</p>
        </div>
    );
};
