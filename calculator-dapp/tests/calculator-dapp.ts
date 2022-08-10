import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert, expect } from "chai";
import { CalculatorDapp } from "../target/types/calculator_dapp";

describe("calculator-dapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const calculator = anchor.web3.Keypair.generate(); // get address
  const program = anchor.workspace.CalculatorDapp as Program<CalculatorDapp>;

  it("Creates a calculator", async () => {
    const greetingStr: string = "hi";

    await program.methods
      .create(greetingStr)
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

    expect(account.greeting).to.be.equal(greetingStr);
  });

  it("should able to add two numbers", async () => {
    const num1 = 3;
    const num2 = 2;

    await program.methods
      .add(new anchor.BN(num1), new anchor.BN(num2))
      .accounts({
        calculator: calculator.publicKey, // no need to add user & system program & signer after create
      })
      .rpc();

    const account = await program.account.calculator.fetch(
      calculator.publicKey
    );

    // BN to number
    expect(account.result.toNumber()).to.be.equal(num1 + num2);
  });
});
