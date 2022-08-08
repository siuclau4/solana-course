import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect } from "chai";
import { CalculatorDapp } from "../target/types/calculator_dapp";

describe("calculator-dapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const calculator = anchor.web3.Keypair.generate(); // get address
  const program = anchor.workspace.CalculatorDapp as Program<CalculatorDapp>;

  it("Creates a calculator", async () => {

    await program.methods
      .create("hi")
      .accounts({
        calculator: calculator.publicKey,
        user: provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([calculator])
      .rpc();

    const account = await program.account.calculator.fetch(
      calculator.publicKey
    );
    
    expect(account.greeting === "hi");
  });
});
