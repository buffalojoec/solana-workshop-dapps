import * as anchor from "@project-serum/anchor";
import { assert } from "chai";

import * as constants from '../app/src/utils/const';
import * as service from '../app/src/utils/util';
import { OrderType } from '../app/src/models/types';


function createKeypairFromFile(path: string): anchor.web3.Keypair {
  return anchor.web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(require('fs').readFileSync(path, "utf-8")))
  )
};


describe("emoji-exchange", async () => {

  const testFundAmount: number = 1 * anchor.web3.LAMPORTS_PER_SOL;

  const connection = new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT);
  const storeWallet = new anchor.Wallet(createKeypairFromFile(__dirname + '/../app/wallet/master.json'));

  let provider: anchor.AnchorProvider;
  let program: anchor.Program;
  let vaultPda: anchor.web3.PublicKey;
  let vaultPdaBump: number;
  let userWallet1: anchor.Wallet;
  let userWallet2: anchor.Wallet;

  it("Initialize vault", async () => {
    [provider, program] = service.getAnchorConfigs(storeWallet);
    [vaultPda, vaultPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [ Buffer.from(constants.VAULT_SEED) ],
      program.programId
    );
    await program.methods.createVault()
      .accounts({
        vault: vaultPda,
        storeWallet: storeWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([storeWallet.payer])
      .rpc();
  });

  it("Fund vault", async () => {
    await program.methods.fundVault(
      vaultPdaBump, new anchor.BN(testFundAmount)
    )
      .accounts({
        vault: vaultPda,
        storeWallet: storeWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([storeWallet.payer])
      .rpc();
    await printVaultBalance(vaultPda);
  });

  it("Initalize store", async () => {
    for (var emoji of constants.EMOJIS_LIST) {
      await anchor.web3.sendAndConfirmTransaction(
        connection, 
        (await service.createStoreEmojiTransaction(storeWallet, emoji.seed, emoji.display))[0],
        [storeWallet.payer]
      );
    }
    await printStoreBalances();
  });

  it("Update the price of an emoji", async () => {
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.updateStoreEmojiPriceTransaction(storeWallet, constants.EMOJIS_LIST[0].seed, 2000000))[0],
      [storeWallet.payer]
    );
    await printStoreBalances();
  })
  it("Update the price of another emoji", async () => {
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.updateStoreEmojiPriceTransaction(storeWallet, constants.EMOJIS_LIST[1].seed, 3000000))[0],
      [storeWallet.payer]
    );
    await printStoreBalances();
  })

  it("Initalize user #1 metadata", async () => {
    userWallet1 = await primeNewWallet("Test Wallet #1");
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.createUserMetadataTransaction(userWallet1, "test_user_1"))[0],
      [userWallet1.payer]
    );
    await printMetadata(userWallet1);
  });

  it("User #1 buy some emojis", async () => {
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.placeOrder(userWallet1, constants.EMOJIS_LIST[4].seed, OrderType.BUY, 6))[0],
      [userWallet1.payer]
    );
    await printStoreBalances();
    await printUserBalances(userWallet1);
    await printVaultBalance(vaultPda);
    await printMetadata(userWallet1);
  });
  it("User #1 buy a few more of the same emoji", async () => {
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.placeOrder(userWallet1, constants.EMOJIS_LIST[4].seed, OrderType.BUY, 3))[0],
      [userWallet1.payer]
    );
    await printStoreBalances();
    await printUserBalances(userWallet1);
    await printVaultBalance(vaultPda);
    await printMetadata(userWallet1);
  });
  it("User #1 sell some of that same emoji", async () => {
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.placeOrder(userWallet1, constants.EMOJIS_LIST[4].seed, OrderType.SELL, 3))[0],
      [userWallet1.payer]
    );
    await printStoreBalances();
    await printUserBalances(userWallet1);
    await printVaultBalance(vaultPda);
    await printMetadata(userWallet1);
  });

  it("Initalize user #2 metadata", async () => {
    userWallet2 = await primeNewWallet("Test Wallet #2");
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.createUserMetadataTransaction(userWallet2, "test_user_2"))[0],
      [userWallet2.payer]
    );
    await printMetadata(userWallet2);
  });

  it("User #2 try to buy too many emojis", async () => {
    let orderNotPlaced: boolean = true;
    try {
      await anchor.web3.sendAndConfirmTransaction(
        connection,
        (await service.placeOrder(userWallet2, constants.EMOJIS_LIST[4].seed, OrderType.BUY, 100))[0],
        [userWallet2.payer]
      );
      orderNotPlaced = false;
    } catch (_) {
      orderNotPlaced = true;
      await printVaultBalance(vaultPda);
    }
    assert(orderNotPlaced, `Loaded sell order failed to be blocked.`);
    await printStoreBalances();
    await printUserBalances(userWallet2);
    await printMetadata(userWallet2);
  });
  it("User #2 buy some emojis", async () => {
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.placeOrder(userWallet2, constants.EMOJIS_LIST[6].seed, OrderType.BUY, 5))[0],
      [userWallet2.payer]
    );
    await printStoreBalances();
    await printUserBalances(userWallet2);
    await printVaultBalance(vaultPda);
    await printMetadata(userWallet2);
  });
  it("User #2 try to sell too many emojis", async () => {
    let orderNotPlaced: boolean = true;
    try {
      await anchor.web3.sendAndConfirmTransaction(
        connection,
        (await service.placeOrder(userWallet2, constants.EMOJIS_LIST[6].seed, OrderType.SELL, 100))[0],
        [userWallet2.payer]
      );
      orderNotPlaced = false;
    } catch (_) {
      orderNotPlaced = true;
    }
    assert(orderNotPlaced, `Loaded sell order failed to be blocked.`);
    await printStoreBalances();
    await printUserBalances(userWallet2);
    await printVaultBalance(vaultPda);
    await printMetadata(userWallet2);
  });
  it("User #2 sell some emojis", async () => {
    await anchor.web3.sendAndConfirmTransaction(
      connection,
      (await service.placeOrder(userWallet2, constants.EMOJIS_LIST[6].seed, OrderType.SELL, 2))[0],
      [userWallet2.payer]
    );
    await printStoreBalances();
    await printUserBalances(userWallet2);
    await printVaultBalance(vaultPda);
    await printMetadata(userWallet2);
  });


  async function primeNewWallet(walletName: string) {
    const keypair = anchor.web3.Keypair.generate();
    await connection.confirmTransaction(
      await connection.requestAirdrop(keypair.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    const balance = await connection.getBalance(keypair.publicKey);
    console.log(`${walletName}: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    console.log(`Pubkey: ${keypair.publicKey}`);
    return new anchor.Wallet(keypair);
  }

  async function printVaultBalance(vaultPubkey: anchor.web3.PublicKey) {
    console.log("-------------------------------------------------------------------------------");
    const balance = await connection.getBalance(vaultPubkey);
    console.log(`Vault: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
  }

  async function printStoreBalances() {
    console.log("-------------------------------------------------------------------------------");
    console.log("Store:");
    for (var emoji of constants.EMOJIS_LIST) {
      const storeEmojiAccount = await service.getStoreEmoji(storeWallet, emoji.seed);
      console.log(`   Emoji: ${storeEmojiAccount.emojiName}    Balance: ${storeEmojiAccount.balance}    \
        Price: ${storeEmojiAccount.price / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    };
  }

  async function printMetadata(userWallet: anchor.Wallet) {
    const metadata = await service.getUserMetadata(userWallet);
    console.log("-------------------------------------------------------------------------------");
    console.log(`Username: ${metadata.username}`);
    console.log(`Trade Count: ${metadata.tradeCount}`);
  }
  
  async function printUserBalances(userWallet: anchor.Wallet) {
    console.log("-------------------------------------------------------------------------------");
    console.log("User Balances:");
    for (var emoji of constants.EMOJIS_LIST) {
      try {
        const userEmojiAccount = await service.getUserEmoji(userWallet, emoji.seed);
        console.log(`   Emoji: ${userEmojiAccount.emojiName}    Balance: ${userEmojiAccount.balance}  \
          Cost Average: ${userEmojiAccount.costAverage / anchor.web3.LAMPORTS_PER_SOL} SOL`);
      } catch(_) {
        continue;
      };
    };
  }
});