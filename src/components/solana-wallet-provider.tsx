'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

// Import CSS using a side-effect import instead of require
import '@solana/wallet-adapter-react-ui/styles.css';

export default function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
    // Determine the network cluster (devnet/mainnet)
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    const endpoint = useMemo(() => {
        if (network === 'devnet') {
            return process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
                'https://api.devnet.solana.com';
        } else {
            return process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
                'https://api.mainnet-beta.solana.com';
        }
    }, [network]);

    // Initialize wallet adapters
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
