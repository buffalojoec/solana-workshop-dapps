import * as anchor from "@project-serum/anchor";
import * as constants from '../app/src/utils/const';
import * as util from '../app/src/utils/util';


export const STORE_WALLET = new anchor.Wallet(createKeypairFromFile(__dirname + '/../app/wallet/master.json'));


function createKeypairFromFile(path: string): anchor.web3.Keypair {
    return anchor.web3.Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
    )
};

export async function initializeStore() {
    console.log("Initializing vault...");
    try {
        var [tx, provider] = await util.initializeVault(STORE_WALLET);
        await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
        var [tx, provider] = await util.fundVault(STORE_WALLET, constants.INIT_FUND_AMOUNT);
        await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
    } catch (e) {
        console.log("Vault already initialized.");
    };
    console.log("Vault initialized successfully.");

    console.log("Initializing store...");
    for (var emoji of constants.EMOJIS_LIST) {
        var [tx, provider] = await util.createStoreEmojiTransaction(STORE_WALLET, emoji.seed, emoji.display);
        try {
            await provider.connection.sendTransaction(tx, [STORE_WALLET.payer]);
        } catch (e) {
            console.log(e);
            console.log(`Store Emoji account exists for: ${emoji.seed}`);
            console.log(`Pubkey: ${tx.instructions[0].keys[0].pubkey.toString()}`);
        }
    }
    console.log("Store initialized.");
}