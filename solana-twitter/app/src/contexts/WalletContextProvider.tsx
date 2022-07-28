import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider as ReactUIWalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { FC, ReactNode, useMemo } from 'react';
import * as constants from '../utils/const';

require('../App.css');
require('@solana/wallet-adapter-react-ui/styles.css');


export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {

    const endpoint = constants.NETWORK;

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
