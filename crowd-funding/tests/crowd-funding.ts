import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CrowdFunding } from "../target/types/crowd_funding";
import chai from "chai";
import {
  PublicKey,
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { airDropSol } from "./helpers";

import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const { expect } = chai;

// set the cluster to localhost
const cluster = "http://localhost:8899"; // clusterApiUrl("devnet");
const connection = new Connection(cluster, "confirmed");

describe("crowd-funding", () => {
  let provider: anchor.AnchorProvider;
  let program: Program<CrowdFunding>;
  let campaignPDA: anchor.web3.PublicKey;

  before(async () => {
    // Configure the client to use the local cluster.
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    program = anchor.workspace.CrowdFunding;

    campaignPDA = (
      await PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
          program.provider.publicKey.toBuffer(),
        ],
        program.programId
      )
    )[0];
  });

  it("should successfully create", async () => {
    const name = "save me";
    const description = "save me!!!";

    await program.methods
      .create(name, description)
      .accounts({
        campaign: campaignPDA,
        user: provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // we don't have to add the PDA to the [signers] array even though account creation requires a signature.
    // This is because it is impossible to sign the transaction from outside the program as the PDA
    // (it's not a public key so there is no private key to sign with)
    // https://www.anchor-lang.com/docs/pdas

    const account = await program.account.campaign.fetch(campaignPDA);

    expect(account.name).to.be.equal(name);
    expect(account.accountDonated.toNumber()).to.be.equal(0);
  });

  it("should able to denote", async () => {
    let account = await program.account.campaign.fetch(campaignPDA);
    const originalDonated = account.accountDonated.toNumber();

    const newUser = anchor.web3.Keypair.generate();

    await airDropSol(newUser.publicKey, connection);

    let txSignature = await program.methods
      .donate(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        campaign: campaignPDA, // no need to add user & system program & signer after create
        user: newUser.publicKey,
      })
      .signers([newUser])
      .rpc();

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txSignature,
    });

    account = await program.account.campaign.fetch(campaignPDA);
    expect(account.accountDonated.toNumber()).to.be.equal(
      originalDonated + 1 * LAMPORTS_PER_SOL
    );

    expect(await connection.getBalance(newUser.publicKey)).to.be.equal(
      (2 - 1) * LAMPORTS_PER_SOL
    );
  });

  it("should not let other user withdraw", async () => {
    let account = await program.account.campaign.fetch(campaignPDA);

    const newUser = anchor.web3.Keypair.generate();

    return expect(
      program.methods
        .withdraw(account.accountDonated)
        .accounts({
          campaign: campaignPDA, // no need to add user & system program & signer after create
          user: newUser.publicKey,
        })
        .rpc()
    ).to.eventually.rejectedWith("Signature verification failed");
  });

  it("should let owner withdraw", async () => {
    let account = await program.account.campaign.fetch(campaignPDA);

    const adminBalance: number = await connection.getBalance(account.admin);

    // get transaction fee by transaction
    const transaction: anchor.web3.Transaction = await program.methods
      .withdraw(account.accountDonated)
      .accounts({
        campaign: campaignPDA, // no need to add user & system program & signer after create
        user: provider.publicKey,
      })
      .transaction();

    let latestBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.feePayer = provider.publicKey;

    const response = await connection.getFeeForMessage(
      transaction.compileMessage(),
      "confirmed"
    );

    const feeInLamports = response.value;

    // confirm transaction
    const txSignature = await provider.sendAndConfirm(transaction);

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txSignature,
    });

    const newAdminBalance: number = await connection.getBalance(account.admin);
    expect(newAdminBalance).to.be.equal(
      adminBalance + account.accountDonated.toNumber() - feeInLamports
    );
  });
});
