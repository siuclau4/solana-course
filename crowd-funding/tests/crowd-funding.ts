import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CrowdFunding } from "../target/types/crowd_funding";
import { expect } from "chai";

describe("crowd-funding", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const crowdFunding = anchor.web3.Keypair.generate(); // get address
  const program = anchor.workspace.CrowdFunding as Program<CrowdFunding>;

  it("should successfully create", async () => {
    const name = "save me"
    const description = "save me!!!"

    await program.methods.create(name, description).accounts({
      campaign: crowdFunding.publicKey,
      user: provider.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    const account = await program.account.campaign.fetch(
      crowdFunding.publicKey,
    );

    expect(account.name).to.be.equal(name);
  });
});
