import { FC, useCallback, useState } from 'react';
import { AnchorWallet, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { OrderType } from '../models/types';
import * as util from '../utils/util';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


interface StoreOrderProps {
  getAllStoreEmojis: (wallet: AnchorWallet | undefined) => void,
  getAllUserEmojis: (wallet: AnchorWallet | undefined) => void,
  emojiName: string,
  display: string,
  balance: number,
  price: number,
}

export const StoreOrder: FC<StoreOrderProps> = (props: StoreOrderProps) => {
  
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();

  const [quantity, setQuantity] = useState<number>(0);

  const onClickOrder = useCallback(async () => {
    const [tx, provider] = await util.placeOrder(
      wallet,
      props.emojiName,
      OrderType.BUY,
      quantity,
    );
    const sx = await sendTransaction(tx, provider.connection);
    await provider.connection.confirmTransaction(sx);
    props.getAllStoreEmojis(wallet);
    props.getAllUserEmojis(wallet);
    setQuantity(0);
  }, [quantity, wallet]);

  return (
    <div>
      <span className="text-2xl">{props.display}</span>

      <span className="text-l ml-4 mr-2">{props.balance}</span>

      <span className="text-l ml-4 mr-2">{`${props.price / LAMPORTS_PER_SOL} SOL`}</span>

      <input 
        type="number" 
        className="input input-bordered max-w-xs m-2" 
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(+e.target.value as number)}
      />
      
      <button
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onClick={() => onClickOrder()}>
          <span>Buy</span>
      </button>
    </div>
  )
}