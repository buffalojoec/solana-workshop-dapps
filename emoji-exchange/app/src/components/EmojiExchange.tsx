import { FC, useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { StoreOrder } from './StoreOrder';
import { UserOrder } from './UserOrder';
import { StoreEmoji, UserEmoji } from '../types/types';
import * as util from '../utils/util';

export const EmojiExchange: FC = () => {

  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();

  const [username, setUsername] = useState('');
  const [init, setInit] = useState(true);

  const [store, setStore] = useState<StoreEmoji[]>([]);
  const [userStore, setUserStore] = useState<UserEmoji[]>([]);

  useEffect(() => {
    const loadStore = async () => { 
      const storeResults = await util.loadStore(wallet);
      setStore(storeResults);
    };
    loadStore();
    const loadUserMetadata = async () => { 
      try {
        setUsername((await util.getUserMetadata(wallet)).username);
        setInit(true);
      } catch (_) {};
    };
    loadUserMetadata();
    const loadUserStore = async () => { 
      const userStoreResults = await util.loadUserStore(wallet);
      setUserStore(userStoreResults);
    };
    loadUserStore();
  }, [wallet]);

  const onClickInit = useCallback(async () => {
    const [tx, provider] = await util.createUserMetadataTransaction(wallet, username);
    const sx = await sendTransaction(tx, provider.connection);
    await provider.connection.confirmTransaction(sx);
    setInit(true);
  }, [username, init]);

  return (
    <div className="my-6">
      {init ? 
        <div>
          <span>Store emojis:</span>
          {store.map((s, i) => { 
            return <StoreOrder key={i} emojiName={s.emojiName} display={s.display} price={s.price} balance={s.balance} />
          })}
          <span>Emojis owned by {username}:</span>
          {userStore.map((u, i) => { 
            return <UserOrder key={i} emojiName={u.emojiName} display={u.display} balance={u.balance} costAverage={u.costAverage} />
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
  )
}