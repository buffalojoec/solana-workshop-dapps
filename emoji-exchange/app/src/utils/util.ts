import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import * as constants from './const';
import { 
    convertOrderTypeToAnchorPayload,
    OrderType, 
    StoreEmojiObject, 
    UserEmojiObject,
    UserMetadataObject
} from '../models/types';


export function getAnchorConfigs(wallet: AnchorWallet): [anchor.AnchorProvider, anchor.Program] | [null, null] {
    if (!wallet) {
        return [null, null];
    }
    const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT), 
        wallet, 
        { "preflightCommitment": constants.PREFLIGHT_COMMITMENT }
    );
    const idl = require("../utils/idl.json");
    const program = new anchor.Program(idl, idl.metadata.address, provider);
    return [provider, program];
}


export async function initializeVault(
    storeWallet: AnchorWallet
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    const vaultPda = (await anchor.web3.PublicKey.findProgramAddress(
      [ Buffer.from(constants.VAULT_SEED) ],
      program.programId
    ))[0];
    const ix = await program.methods.createVault()
        .accounts({
            vault: vaultPda,
            storeWallet: storeWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function fundVault(
    storeWallet: AnchorWallet, 
    amount: number
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    const [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [ Buffer.from(constants.VAULT_SEED) ],
      program.programId
    );
    const ix = await program.methods.fundVault(
        vaultPdaBump, new anchor.BN(amount)
    )
        .accounts({
            vault: vaultPda,
            storeWallet: storeWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function getVaultBalance(storeWallet: AnchorWallet): Promise<number> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    const vaultPda = (await anchor.web3.PublicKey.findProgramAddress(
      [ Buffer.from(constants.VAULT_SEED) ],
      program.programId
    ))[0];
    const balance = await provider.connection.getBalance(vaultPda);
    return balance;
}


export async function createStoreEmojiTransaction(
    storeWallet: AnchorWallet,
    emojiSeed: string,
    display: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    if (!provider) throw("Provider is null");
    const storeEmojiPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    ))[0];
    const ix = await program.methods.createStoreEmoji(
        emojiSeed, 
        display,
        constants.DEFAULT_STARTING_BALANCE, 
        new anchor.BN(constants.DEFAULT_STARTING_PRICE)
    )
        .accounts({
            storeEmoji: storeEmojiPda,
            storeWallet: storeWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function getStoreEmoji(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<StoreEmojiObject> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const storeEmojiPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    ))[0];
    try {
        const response = await program.account.storeEmoji.fetch(storeEmojiPda);
        return {
            emojiName: response.emojiName as string,
            display: response.display as string,
            balance: response.balance as number,
            price: response.price as number,
        };
    } catch (e) {
        console.log(e);
        throw Error(`Store emoji account not found for ${emojiSeed}`);
    }
}

export async function loadStore(wallet: AnchorWallet): Promise<StoreEmojiObject[]> {
    let store: StoreEmojiObject[] = [];
    for (var emoji of constants.EMOJIS_LIST) {
        const storeEmojiAccount = await getStoreEmoji(wallet, emoji.seed);
        console.log(`Successfully loaded store emoji account for ${emoji.seed}`);
        console.log(`emojiName: ${storeEmojiAccount.emojiName as string}`);
        console.log(`display: ${storeEmojiAccount.display as string}`);
        console.log(`balance: ${storeEmojiAccount.balance as number}`);
        console.log(`price: ${storeEmojiAccount.price as number}`);
        store.push({
            emojiName: storeEmojiAccount.emojiName as string,
            display: storeEmojiAccount.display as string,
            balance: storeEmojiAccount.balance as number,
            price: storeEmojiAccount.price as number,
        });
    };
    return store;
}

export async function updateStoreEmojiPriceTransaction(
    storeWallet: AnchorWallet,
    emojiSeed: string,
    newPrice: number,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(storeWallet);
    if (!provider) throw("Provider is null");
    const [storeEmojiPda, storeEmojiPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    );
    const ix = await program.methods.updateStoreEmojiPrice(
        storeEmojiPdaBump,
        emojiSeed, 
        new anchor.BN(newPrice),
    )
        .accounts({
            storeEmoji: storeEmojiPda,
            storeWallet: storeWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function createUserMetadataTransaction(
    wallet: AnchorWallet,
    username: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [ Buffer.from(constants.VAULT_SEED) ],
        program.programId
    );
    const userMetadataPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.METADATA_SEED),
        ],
        program.programId
    ))[0];
    const ix = await program.methods.createUserMetadata(username)
        .accounts({
            userMetadata: userMetadataPda,
            vault: vaultPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function getUserMetadata(
    wallet: AnchorWallet,
): Promise<UserMetadataObject> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const userMetadataPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.METADATA_SEED),
        ],
        program.programId
    ))[0];
    try {
        const response = await program.account.userMetadata.fetch(userMetadataPda);
        return {
            pubkey: provider.wallet.publicKey as anchor.web3.PublicKey,
            username: response.username as string,
            tradeCount: response.tradeCount as number,
        };
    } catch (e) {
        throw Error(`Metadata account not found for ${wallet.publicKey}`);
    }
}

export async function createUserEmojiTransaction(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [ Buffer.from(constants.VAULT_SEED) ],
        program.programId
    );
    const [storeEmojiPda, storeEmojiPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    );
    const userEmojiPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    ))[0];
    const ix = await program.methods.createUserEmoji(
        storeEmojiPdaBump,
        emojiSeed, 
    )
        .accounts({
            storeEmoji: storeEmojiPda,
            userEmoji: userEmojiPda,
            vault: vaultPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function getUserEmoji(
    wallet: AnchorWallet,
    emojiSeed: string,
): Promise<UserEmojiObject> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const userEmojiPda = (await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    ))[0];
    try {
        const response = await program.account.userEmoji.fetch(userEmojiPda);
        return {
            emojiName: response.emojiName as string,
            display: response.display as string,
            balance: response.balance as number,
            costAverage: response.costAverage as number,
        };
    } catch (e) {
        throw Error(`User emoji account not found for ${emojiSeed}`);
    }
}

export async function loadUserStore(wallet: AnchorWallet): Promise<UserEmojiObject[]> {
    let userStore: UserEmojiObject[] = [];
    for (var emoji of constants.EMOJIS_LIST) {
        try {
            const userEmojiAccount = await getUserEmoji(wallet, emoji.seed);
            console.log(`Successfully loaded user emoji account for ${emoji.seed}`);
            console.log(`emojiName: ${userEmojiAccount.emojiName as string}`);
            console.log(`display: ${userEmojiAccount.display as string}`);
            console.log(`balance: ${userEmojiAccount.balance as number}`);
            console.log(`costAverage: ${userEmojiAccount.costAverage as number}`);
            userStore.push({
                emojiName: userEmojiAccount.emojiName as string,
                display: userEmojiAccount.display as string,
                balance: userEmojiAccount.balance as number,
                costAverage: userEmojiAccount.costAverage as number,
            });
        } catch (e) {
            console.log(`User emoji account doesn't exist for ${emoji.seed}. Skipping...`)
        }
    };
    return userStore;
}

export async function cashOutUser(
    wallet: AnchorWallet,
    recipientPubkey: anchor.web3.PublicKey
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    const walletBalance = await provider.connection.getBalance(wallet.publicKey);
    const txFee = 0 // Calculate the tx fee to send
    const cashOutAmount = walletBalance - txFee;
    const [userMetadataPda, userMetadataPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.METADATA_SEED),
        ],
        program.programId
    );
    const ix = await program.methods.cashOutUser(
        userMetadataPdaBump,
        cashOutAmount, 
    )
        .accounts({
            userMetadata: userMetadataPda,
            recipient: recipientPubkey,
            userWallet: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    let tx = new anchor.web3.Transaction().add(ix);
    return [tx, provider];
}

export async function placeOrder(
    wallet: AnchorWallet,
    emojiSeed: string, 
    orderType: OrderType,
    quantity: number,
): Promise<[anchor.web3.Transaction, anchor.AnchorProvider]> {
    const [provider, program] = getAnchorConfigs(wallet);
    if (!provider) throw("Provider is null");
    let tx: anchor.web3.Transaction;
    try {
        await getUserEmoji(provider.wallet, emojiSeed);
        tx = new anchor.web3.Transaction();
    } catch (_) {
        tx = (await createUserEmojiTransaction(provider.wallet, emojiSeed))[0];
    };
    const [userMetadataPda, userMetadataBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.METADATA_SEED),
        ],
        program.programId
    );
    const [userEmojiPda, userEmojiPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            provider.wallet.publicKey.toBuffer(),
            Buffer.from(constants.USER_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    );
    const [storeEmojiPda, storeEmojiPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from(constants.STORE_SEED),
            Buffer.from(emojiSeed),
        ],
        program.programId
    );
    const [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
        [ Buffer.from(constants.VAULT_SEED) ],
        program.programId
    );
    const ix = await program.methods.placeOrder(
        userMetadataBump,
        userEmojiPdaBump,
        storeEmojiPdaBump,
        vaultPdaBump,
        emojiSeed, 
        convertOrderTypeToAnchorPayload(orderType), 
        quantity
    )
        .accounts({
            userMetadata: userMetadataPda,
            userEmoji: userEmojiPda,
            storeEmoji: storeEmojiPda,
            vault: vaultPda,
            userWallet: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();
    tx.add(ix);
    return [tx, provider];
}