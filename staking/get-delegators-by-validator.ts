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
  const stakeProgramId = new PublicKey(
    "Stake11111111111111111111111111111111111111"
  ); // https://docs.solana.com/developing/runtime-facilities/programs#stake-program
  const votePubkey = "23AoPQc3EPkfLWb14cKiWNahh1H9rtb3UBk8gWseohjF";

  const accounts = await connection.getParsedProgramAccounts(stakeProgramId, {
    filters: [
      { dataSize: 200 },
      {
        memcmp: {
          offset: 124,
          bytes: votePubkey,
        },
      },
    ],
  });

  console.log(
    `Total number of delegators found for ${votePubkey} is: ${accounts.length}`
  );
  if (accounts.length) {
    console.log(`Sample delegateor: ${JSON.stringify(accounts[0])}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
