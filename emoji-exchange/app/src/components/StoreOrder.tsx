import { FC, useCallback, useState } from 'react';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { OrderType, StoreEmoji } from '../types/types';
import * as util from '../utils/util';


export const StoreOrder: FC<StoreEmoji> = (props: StoreEmoji) => {
  
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
  }, [quantity]);

  return (
    <div>
      <span style={{fontSize: "32px"}}>{props.display}</span>

      <span style={{fontSize: "20px", marginLeft: "1.25em", marginRight: "0.75em"}}>{props.balance}</span>

      <span style={{fontSize: "20px", marginLeft: "1.25em", marginRight: "0.75em"}}>{props.price}</span>

      <input 
        type="number" 
        className="input input-bordered max-w-xs m-2" 
        placeholder="Quantity"
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
      
      <button
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onClick={() => onClickOrder()}>
          <span>Buy</span>
      </button>
    </div>
  )
}