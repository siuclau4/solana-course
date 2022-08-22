import {
  Authorized,
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Lockup,
  sendAndConfirmTransaction,
  StakeProgram,
} from "@solana/web3.js";

async function main() {
  const cluster = clusterApiUrl("devnet");
  const connection = new Connection(cluster, "processed");

  // create new wallet and airdrop some SOL to it
  const wallet = Keypair.generate();

  const airdropSignature = await connection.requestAirdrop(
    wallet.publicKey,
    1 * LAMPORTS_PER_SOL
  );

  const latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  });

  const stakeAccount = Keypair.generate();
  const minimumRent = await connection.getMinimumBalanceForRentExemption(
    StakeProgram.space
  );
  const amountUserWantToStake = 0.5 * LAMPORTS_PER_SOL;
  const amountToStake = minimumRent + amountUserWantToStake;
  const createStakeAccountTx = StakeProgram.createAccount({
    authorized: new Authorized(wallet.publicKey, wallet.publicKey), // 1st - staker, 2nd - withdrawer
    fromPubkey: wallet.publicKey,
    lamports: amountToStake,
    lockup: new Lockup(0, 0, wallet.publicKey), // 1st - expiry timestamp, 2nd - epoch
    stakePubkey: stakeAccount.publicKey,
  });

  const createStakeAccountTxId = await sendAndConfirmTransaction(
    connection,
    createStakeAccountTx,
    [wallet, stakeAccount]
  );

  console.log(`Stake account created. Tx Id: ${createStakeAccountTxId}`);
  let stakeBalance = await connection.getBalance(stakeAccount.publicKey);

  console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);

  const stakeStatus = await connection.getStakeActivation(
    stakeAccount.publicKey
  );

  console.log(`Stake account status: ${stakeStatus.state}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
