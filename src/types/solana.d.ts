// Type definitions for Solana integration

declare module "@solana/web3.js" {
  export class Connection {
    constructor(endpoint: string, commitment?: any);
    getLatestBlockhash(): Promise<any>;
    getAccountInfo(publicKey: any): Promise<any>;
  }

  export class PublicKey {
    constructor(value: string | Uint8Array | Array<number>);
  }

  export class Transaction {
    constructor();
    add(instruction: any): Transaction;
    recentBlockhash: string;
    feePayer: any;
    serialize(): Uint8Array;
  }

  export class SystemProgram {
    static transfer(params: {
      fromPubkey: any;
      toPubkey: any;
      lamports: number;
    }): any;
  }
}

declare module "@solana/spl-token" {
  export function createTransferInstruction(
    source: any,
    destination: any,
    owner: any,
    amount: bigint
  ): any;

  export function getAssociatedTokenAddress(
    mint: any,
    owner: any
  ): Promise<any>;

  export function createAssociatedTokenAccountInstruction(
    payer: any,
    associatedToken: any,
    owner: any,
    mint: any
  ): any;

  export const TOKEN_PROGRAM_ID: any;
}

// Wallet adapter type
interface Wallet {
  publicKey: any;
  signTransaction(transaction: any): Promise<any>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  on(event: string, callback: () => void): void;
}
