import { FC } from "react";
import { TweetProps } from "../types/types";


export const Tweet: FC<TweetProps> = (props: TweetProps) => {
    return(
        <div>
            <p>{props.publicKey.toString()}</p>
            <p>{props.name}</p>
            <p>{props.handle}</p>
            <p>{props.message}</p>
        </div>
    );
};
