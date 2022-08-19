import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CrowdFunding } from "../target/types/crowd_funding";
import { expect } from "chai";
import { PublicKey, Connection } from "@solana/web3.js";

const cluster = "http://localhost:8899";
const connection = new Connection(cluster, "confirmed");

describe("crowd-funding", () => {
  let provider: anchor.AnchorProvider;
  let program: Program<CrowdFunding>;
  let campaignPDA: anchor.web3.PublicKey;

  before(async () => {
    // Configure the client to use the local cluster.
    provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    program = anchor.workspace.CrowdFunding;
    // const crowdFunding: anchor.web3.Keypair = anchor.web3.Keypair.generate(); // get address

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
    const orginialDonated = account.accountDonated.toNumber();

    const newUser = anchor.web3.Keypair.generate();

    let balance = await connection.getBalance(newUser.publicKey);
    console.log(balance)

    await program.methods
      .donate(new anchor.BN(0))
      .accounts({
        campaign: campaignPDA, // no need to add user & system program & signer after create
        user: newUser.publicKey
      })
      .signers([newUser])
      .rpc();

    // console.log(tx)

    account = await program.account.campaign.fetch(campaignPDA);
    expect(account.accountDonated.toNumber()).to.be.equal(orginialDonated + 0);
  });
});
