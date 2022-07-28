import * as anchor from "@project-serum/anchor";


export enum OrderType { 
    BUY, 
    SELL 
};

export type StoreEmoji = {
    emojiName: string,
    display: string,
    balance: number,
    price: number,
}

export type UserEmoji = {
    emojiName: string,
    display: string,
    balance: number,
    costAverage: number,
}

export type UserMetadata = {
    pubkey: anchor.web3.PublicKey,
    username: string,
}

export function convertOrderTypeToAnchorPayload(variant: OrderType) {
    if (variant === OrderType.BUY) {
        return { buy: {} };
    } else {
        return { sell: {} };
    }
}