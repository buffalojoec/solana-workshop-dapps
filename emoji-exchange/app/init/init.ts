import * as anchor from "@project-serum/anchor";
import * as constants from '../src/utils/const';
import * as util from '../src/utils/util';


export const STORE_WALLET = new anchor.Wallet(createKeypairFromFile(__dirname + '/../wallet/master.json'));


function createKeypairFromFile(path: string): anchor.web3.Keypair {
    return anchor.web3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
    )
};

async function main() {
    
    for (var emoji of constants.EMOJIS_LIST) {
        var [tx, provider] = await util.createStoreEmojiTransaction(STORE_WALLET, emoji.seed, emoji.display);
        try {
            await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
        } catch (_) {
            console.log(`Store Emoji account exists for: ${emoji.seed}`);
        }
    }
    console.log("Store initialized.");
}


main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);