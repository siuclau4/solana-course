import { clusterApiUrl, Connection } from "@solana/web3.js";

async function main() {
  const cluster = clusterApiUrl("devnet");
  const connection = new Connection(cluster, "processed");

  const { current, delinquent } = await connection.getVoteAccounts();

  console.log("all validators: " + current.concat(delinquent).length);
  console.log("current validators: " + current.length);
  console.log(current[0]);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
