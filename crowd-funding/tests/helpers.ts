import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const airDropSol = async (
  publicKey: PublicKey,
  connection: Connection
): Promise<void> => {
  try {
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

    return;
  } catch (error) {}
};
