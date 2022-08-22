import {
  Authorized,
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Lockup,
  PublicKey,
  sendAndConfirmTransaction,
  StakeProgram,
  VoteAccountInfo,
  VoteAccountStatus,
} from "@solana/web3.js";

async function main() {
  const cluster = clusterApiUrl("devnet");
  const connection = new Connection(cluster, "processed");

  //   create new wallet and airdrop some SOL to it
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

  let stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);

  console.log(`Stake account status: ${stakeStatus.state}`);

  const validators: VoteAccountStatus = await connection.getVoteAccounts();
  const selectedValidator: VoteAccountInfo = validators.current[0];
  const selectedValidatorPubkey = new PublicKey(selectedValidator.votePubkey);

  const delegateTx = StakeProgram.delegate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
    votePubkey: selectedValidatorPubkey,
  });

  const delegateTxId = await sendAndConfirmTransaction(connection, delegateTx, [
    wallet,
  ]);

  console.log(
    `Stake account delegated to ${selectedValidatorPubkey}. Tx id: ${delegateTxId}`
  );

  stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
  console.log(`Stake account status: ${stakeStatus.state}`);

  const deactivateTx = StakeProgram.deactivate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
  });

  const deactivateTxId = await sendAndConfirmTransaction(
    connection,
    deactivateTx,
    [wallet]
  );

  console.log(`Stake account deactivated. Tx id: ${deactivateTxId}`);

  stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
  console.log(`Stake status: ${stakeStatus.state}`);

  const withdrawTx = StakeProgram.withdraw({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
    toPubkey: wallet.publicKey,
    lamports: stakeBalance,
  });

  const withdrawTxId = await sendAndConfirmTransaction(connection, withdrawTx, [
    wallet,
  ]);

  console.log(`Stake account withdrawed. Tx id: ${withdrawTxId}`);
  stakeBalance = await connection.getBalance(stakeAccount.publicKey);
  console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
