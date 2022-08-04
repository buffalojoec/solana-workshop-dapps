import * as anchor from "@project-serum/anchor";


export type EndpointTypes = 'mainnet' | 'devnet' | 'localnet'

export enum OrderType { 
    BUY, 
    SELL 
};

export interface StoreEmojiObject {
    emojiName: string,
    display: string,
    balance: number,
    price: number,
}

export interface UserEmojiObject {
    emojiName: string,
    display: string,
    balance: number,
    costAverage: number,
}

export interface UserMetadataObject {
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