import { FC, useCallback, useState } from 'react';
import { AnchorWallet, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { OrderType } from '../models/types';
import * as util from '../utils/util';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


interface UserOrderProps {
  getAllStoreEmojis: (wallet: AnchorWallet | undefined) => void,
  getAllUserEmojis: (wallet: AnchorWallet | undefined) => void,
  emojiName: string,
  display: string,
  balance: number,
  costAverage: number,
}

export const UserOrder: FC<UserOrderProps> = (props: UserOrderProps) => {
  
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();

  const [quantity, setQuantity] = useState<number>(0);

  const onClickOrder = useCallback(async () => {
    const [tx, provider] = await util.placeOrder(
      wallet,
      props.emojiName,
      OrderType.SELL,
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
      <span style={{fontSize: "32px"}}>{props.display}</span>

      <span style={{fontSize: "20px", marginLeft: "1.25em", marginRight: "0.75em"}}>{props.balance}</span>

      <span style={{fontSize: "20px", marginLeft: "1.25em", marginRight: "0.75em"}}>{`${props.costAverage / LAMPORTS_PER_SOL} SOL`}</span>

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
          <span>Sell</span>
      </button>
    </div>
  )
}