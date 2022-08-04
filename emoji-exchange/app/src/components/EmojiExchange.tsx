import { FC, useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import useStoreEmojiStore from 'stores/StoreEmojiStore';
import useUserEmojiStore from 'stores/UserEmojiStore';
import useUserMetadataStore from 'stores/UserMetadataStore';
import { StoreOrder } from './StoreOrder';
import { UserOrder } from './UserOrder';
import * as util from '../utils/util';
import { MIN_TRADE_COUNT_FOR_EXPORT } from '../utils/const';

export const EmojiExchange: FC = () => {

  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const [ username, setUsername ] = useState('');
  const [ exportEligible, setExportEligible ] = useState(false);
  const { userMetadata, getUserMetadata } = useUserMetadataStore();
  const { storeEmojis, getAllStoreEmojis } = useStoreEmojiStore();
  const { userEmojis, getAllUserEmojis } = useUserEmojiStore();

  const onClickInit = useCallback(async () => {
    const [tx, provider] = await util.createUserMetadataTransaction(wallet, username);
    const sx = await sendTransaction(tx, provider.connection);
    await provider.connection.confirmTransaction(sx);
  }, [username]);

  useEffect(() => {
    getUserMetadata(wallet);
    getAllStoreEmojis(wallet);
    getAllUserEmojis(wallet);
    if (userMetadata) {
      if (userMetadata.tradeCount >= MIN_TRADE_COUNT_FOR_EXPORT) setExportEligible(true);
    };
  }, [wallet, userMetadata]);

  useEffect(() => {
    if (publicKey) {
    console.log(publicKey.toBase58())
    getUserSOLBalance(publicKey, connection)
    }
}, [publicKey, connection, getUserSOLBalance])

  return (
    <div className="my-6">
      { wallet ?
        <div>
          <div className="text-center">
            {wallet && <p>SOL Balance: {(balance || 0).toLocaleString()}</p>}
          </div>
          {userMetadata ? 
            <div>
              <p>Trade Count: {userMetadata.tradeCount}</p>
              {exportEligible &&
                <div>
                  <p>Congratulations! You can now export your burner wallet's private key!</p>
                  <p>Now you can take ownership of the mainnet-beta SOL in the burner!</p>
                </div>
              }
              <span>Store emojis:</span>
              {storeEmojis.map((s, i) => { 
                return <StoreOrder key={i} getAllStoreEmojis={getAllStoreEmojis} getAllUserEmojis={getAllUserEmojis} emojiName={s.emojiName} display={s.display} price={s.price} balance={s.balance} />
              })}
              <span>Emojis owned by {userMetadata.username}:</span>
              {userEmojis.map((u, i) => { 
                return <UserOrder key={i} getAllStoreEmojis={getAllStoreEmojis} getAllUserEmojis={getAllUserEmojis} emojiName={u.emojiName} display={u.display} balance={u.balance} costAverage={u.costAverage} />
              })}
            </div> :
            <div>
              <input 
                type="text" 
                className="input input-bordered max-w-xs m-2" 
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
                onClick={() => onClickInit()}>
                  <span>Initialize User</span>
              </button>
            </div>
            }
          </div>
          :
          <div>
            <div className="text-lg border-2 rounded-lg border-[#6e6e6e] p-6 mt-16 bg-[#1f1f1f]">
              <p>Connect your wallet to log in/sign up!</p>
            </div>
          </div>
          }
    </div>
  )
}