import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Logger } from "./app/src/lib/logger";

// Enhanced test script to check PYUSD balance on connected wallet
// This script handles both SPL Token and Token-2022 (TokenzQdBNbLqP5VEhdkAS6EPFLC1PHFsXRsGNVxM)
async function checkEnhancedPYUSDBalance(walletAddress: string) {
  console.log("🔍 Enhanced PYUSD balance checker");
  console.log("Wallet:", walletAddress);

  // Determine network and token mint
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
  const isDevnet = network === "devnet";

  // PYUSD mint addresses
  const mainnetPYUSD = "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo";
  const devnetPYUSD = "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM";

  const pyusdMint = isDevnet ? devnetPYUSD : mainnetPYUSD;
  console.log(`🌐 Network: ${network}`);
  console.log(`🪙 PYUSD Mint: ${pyusdMint}`);

  // Setup connection
  const rpcUrl = isDevnet
    ? process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ||
      "https://api.devnet.solana.com"
    : process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com";

  console.log(`🔗 RPC URL: ${rpcUrl}`);

  const connection = new Connection(rpcUrl, "confirmed");

  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const pyusdMintPublicKey = new PublicKey(pyusdMint);

    console.log("\n🔍 Checking for SPL Token account...");

    // First, try the standard associated token account (SPL Token)
    const associatedTokenAccount = await getAssociatedTokenAddress(
      pyusdMintPublicKey,
      walletPublicKey
    );

    console.log(
      `📍 Standard Associated Token Account: ${associatedTokenAccount.toString()}`
    );

    try {
      // Try to get the account info and balance using SPL Token
      const accountInfo = await connection.getAccountInfo(
        associatedTokenAccount
      );
      if (accountInfo) {
        // Try to parse as a standard token account
        try {
          const tokenAccount = await getAccount(
            connection,
            associatedTokenAccount
          );
          console.log(`✅ SPL Token account found!`);
          console.log(`💰 PYUSD Balance: ${tokenAccount.amount} (raw)`);
          console.log(
            `💰 PYUSD Balance: ${
              tokenAccount.amount / BigInt(1_000_000)
            } (formatted)`
          );
          console.log(`📊 Mint: ${tokenAccount.mint.toString()}`);
          console.log(`📊 Owner: ${tokenAccount.owner.toString()}`);
          console.log(`📊 Decimals: ${tokenAccount.decimals}`);
          return Number(tokenAccount.amount) / 1_000_000; // Return the balance
        } catch (parseError) {
          console.log(
            `⚠️  Account exists but couldn't parse as SPL Token account:`,
            parseError
          );
        }
      } else {
        console.log("❌ SPL Token account does not exist");
      }
    } catch (splError) {
      console.log("⚠️  SPL Token check failed:", splError);
    }

    console.log("\n🔍 Checking for Token-2022 account...");

    // Now try to find Token-2022 accounts by looking at all token accounts owned by the wallet
    const tokenProgram2022 = new PublicKey(
      "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHFsXRsGNVxM"
    );

    console.log(`Token-2022 Program ID: ${tokenProgram2022.toString()}`);

    // Get all token accounts owned by this wallet for both programs
    const allTokenAccounts = [];

    // Get SPL Token accounts
    const splTokenAccounts = await connection.getTokenAccountsByOwner(
      walletPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    console.log(`📋 Found ${splTokenAccounts.value.length} SPL Token accounts`);
    allTokenAccounts.push(...splTokenAccounts.value);

    // Get Token-202 accounts
    try {
      const token2022Accounts = await connection.getTokenAccountsByOwner(
        walletPublicKey,
        { programId: tokenProgram202 }
      );
      console.log(
        `📋 Found ${token2022Accounts.value.length} Token-2022 accounts`
      );
      allTokenAccounts.push(...token202Accounts.value);
    } catch (token2022Error) {
      console.log("⚠️  Could not fetch Token-2022 accounts:", token2022Error);
    }

    // Look for PYUSD in all token accounts
    let foundPYUSD = false;
    for (const tokenAccount of allTokenAccounts) {
      try {
        const accountBalance = await connection.getTokenAccountBalance(
          tokenAccount.pubkey
        );
        if (accountBalance.value.mint === pyusdMint) {
          console.log(
            `✅ Found PYUSD Token account: ${tokenAccount.pubkey.toString()}`
          );
          console.log(
            `💰 PYUSD Balance: ${accountBalance.value.uiAmountString} PYUSD`
          );
          console.log(`📊 Raw Amount: ${accountBalance.value.amount}`);
          console.log(`🔢 Decimals: ${accountBalance.value.decimals}`);

          // Try to get more details about the account
          const accountInfo = await connection.getAccountInfo(
            tokenAccount.pubkey
          );
          if (accountInfo?.owner.toString() === tokenProgram2022.toString()) {
            console.log(
              `🔐 This is a Token-2022 account (using TokenzQdBNbLqP5VEhdkAS6EPFLC1PHFsXRsGNVxM)`
            );
          } else {
            console.log(`🔐 This is a standard SPL Token account`);
          }

          foundPYUSD = true;
          return Number(accountBalance.value.uiAmount); // Return the balance
        }
      } catch (balanceError) {
        console.log(
          `⚠️  Could not get balance for account ${tokenAccount.pubkey.toString()}:`,
          balanceError
        );
      }
    }

    if (!foundPYUSD) {
      console.log("❌ No PYUSD found in any token accounts");

      // Additional debug: List all token accounts with their mint addresses
      console.log("\n📋 All token accounts for this wallet:");
      for (const tokenAccount of allTokenAccounts) {
        try {
          const accountBalance = await connection.getTokenAccountBalance(
            tokenAccount.pubkey
          );
          console.log(
            `  - ${tokenAccount.pubkey.toString()}: ${
              accountBalance.value.uiAmountString
            } ${accountBalance.value.mint}`
          );

          const accountInfo = await connection.getAccountInfo(
            tokenAccount.pubkey
          );
          const programType =
            accountInfo?.owner.toString() === tokenProgram202.toString()
              ? "Token-2022"
              : "SPL Token";
          console.log(`    (${programType} account)`);
        } catch (err) {
          console.log(
            `  - ${tokenAccount.pubkey.toString()}: Could not fetch balance`
          );
        }
      }
    }

    return 0; // Return 0 if no PYUSD found
  } catch (error) {
    console.error("❌ Error checking PYUSD balance:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

// Function to create a PYUSD transfer transaction considering both SPL Token and Token-2022
async function createPYUSDTransferTransaction(
  senderPublicKey: PublicKey,
  recipientPublicKey: PublicKey,
  amount: number, // in PYUSD tokens
  connection: Connection
) {
  console.log("\n🔧 Creating PYUSD transfer transaction...");

  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
  const isDevnet = network === "devnet";

  // PYUSD mint addresses
  const mainnetPYUSD = "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo";
  const devnetPYUSD = "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM";

  const pyusdMint = isDevnet ? devnetPYUSD : mainnetPYUSD;
  const pyusdMintPublicKey = new PublicKey(pyusdMint);

  // Check if recipient has a token account for PYUSD
  const recipientTokenAccount = await getAssociatedTokenAddress(
    pyusdMintPublicKey,
    recipientPublicKey
  );

  // Determine if we need to use Token-2022 or standard SPL Token
  const tokenProgram2022 = new PublicKey(
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHFsXRsGNVxM"
  );

  // Check what type of token account the sender has
  const senderTokenAccount = await getAssociatedTokenAddress(
    pyusdMintPublicKey,
    senderPublicKey
  );

  let senderAccountExists = false;
  let isToken2022 = false;

  try {
    const senderAccountInfo = await connection.getAccountInfo(
      senderTokenAccount
    );
    if (senderAccountInfo) {
      // Check if it's a Token-2022 account
      isToken2022 =
        senderAccountInfo.owner.toString() === tokenProgram2022.toString();
      senderAccountExists = true;
      console.log(
        `Sender account is ${isToken202 ? "Token-2022" : "SPL Token"} account`
      );
    }
  } catch (error) {
    console.log("Could not check sender account:", error);
  }

  // Import the appropriate functions based on token type
  const { createTransferInstruction, createAssociatedTokenAccountInstruction } =
    await import(isToken2022 ? "@solana/spl-token-2022" : "@solana/spl-token");

  const { Transaction, SystemProgram } = await import("@solana/web3.js");
  const transaction = new Transaction();

  // Check if recipient token account exists
  let recipientAccountExists = false;
  try {
    const recipientAccountInfo = await connection.getAccountInfo(
      recipientTokenAccount
    );
    recipientAccountExists = recipientAccountInfo !== null;
  } catch (error) {
    console.log("Recipient account doesn't exist, will create it");
  }

  // If recipient account doesn't exist, create it
  if (!recipientAccountExists) {
    const createRecipientAccountInstruction =
      createAssociatedTokenAccountInstruction(
        senderPublicKey, // payer
        recipientTokenAccount, // associated token account
        recipientPublicKey, // owner
        pyusdMintPublicKey // mint
      );
    transaction.add(createRecipientAccountInstruction);
    console.log("Added instruction to create recipient token account");
  }

  // Calculate amount in token units (PYUSD has 6 decimals)
  const tokenAmount = BigInt(Math.round(amount * 1_000_000));

  // Create transfer instruction
  const transferInstruction = createTransferInstruction(
    senderTokenAccount,
    recipientTokenAccount,
    senderPublicKey,
    tokenAmount
  );

  transaction.add(transferInstruction);

  // Get the latest blockhash for the transaction
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = senderPublicKey;

  console.log(`✅ Transfer transaction created for ${amount} PYUSD`);
  return transaction;
}

// Test with a sample wallet address
const testWallet =
  process.argv[2] || "5VbifeTP6mT9thrPFUeNn82hy25o33m1c2UiEfcsooGf";

console.log("🚀 Starting Enhanced PYUSD Balance Check Test\n");
checkEnhancedPYUSDBalance(testWallet)
  .then((balance) => {
    console.log(`\n🎯 Final balance result: ${balance} PYUSD`);
    console.log("✅ Test completed");
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

// Export functions for use in other scripts
export { checkEnhancedPYUSDBalance, createPYUSDTransferTransaction };
