import { FC, useCallback } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import * as constants from "../utils/const";


export const RequestAirdrop: FC = () => {
    const wallet = useAnchorWallet();

    const onClick = useCallback(async () => {
        if (!wallet) {
            console.log('error', 'Wallet not connected!');
            return;
        }
        const connection = new anchor.web3.Connection(constants.NETWORK, constants.PREFLIGHT_COMMITMENT);
        try {
            await connection.confirmTransaction(
                await connection.requestAirdrop(wallet.publicKey, anchor.web3.LAMPORTS_PER_SOL), 'confirmed'
            );
        } catch (error: any) {
            console.log('error', `Airdrop failed! ${error?.message}`);
        }
    }, [wallet]);

    return (
        <div>
            <button
                className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
                onClick={onClick}
            >
                <span>Airdrop 1 </span>
            </button>
        </div>
    );
};

