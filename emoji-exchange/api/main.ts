import * as anchor from "@project-serum/anchor";
import * as constants from '../app/src/utils/const';
import * as util from '../app/src/utils/util';
import { STORE_WALLET } from './init';


const BLOCKS_PER_CLOCK_TICK: number = 5;

function getTimeAsCrank(): number {
    const latestBlock = 5000;
    
}

function getRandomPriceFluctMultiplier(): number { return 1.01 }

async function main() {
    let time: number;
    let clock: number = 0;
    while (true) {
        time = getTimeAsCrank();
        if (clock < time) {
            const priceFluctMultiplier = getRandomPriceFluctMultiplier();
            for (var emoji of constants.EMOJIS_LIST) {
                
                var currentPrice = (await util.getStoreEmoji(STORE_WALLET, emoji.seed)).price;
                var newPrice = currentPrice * priceFluctMultiplier;
                var [tx, provider] = await util.updateStoreEmojiPriceTransaction(STORE_WALLET, emoji.seed, newPrice);
                await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
            }
            clock = time;
        };
    }
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);