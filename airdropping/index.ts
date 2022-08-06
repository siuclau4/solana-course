import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const wallet: Keypair = new Keypair();

const publicKey: PublicKey = new PublicKey(wallet.publicKey);
const secretKey: Uint8Array = wallet.secretKey;

// console.log(publicKey);
// console.log(secretKey);

const getWalletBalance = async () => {
  try {
    const connection: Connection = new Connection(
      clusterApiUrl("devnet"),
      "confirmed"
    );
    const walletBalance: number = await connection.getBalance(publicKey);
    console.log(`Wallet balance: ${walletBalance}`);
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async () => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const fromAirDropSignature = await connection.requestAirdrop(
      publicKey,
      2 * LAMPORTS_PER_SOL
    );
    // await connection.confirmTransaction(fromAirDropSignature);
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: fromAirDropSignature,
    });
  } catch (error) {}
};

const main = async () => {
  await getWalletBalance();
  await airDropSol();
  await getWalletBalance();
};
main();
