import { FC, useEffect, useState } from "react";
import "./App.css";
import idl from "./idl.json";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Commitment,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
  Idl,
} from "@project-serum/anchor";
import { CrowdFunding } from "./crowd_funding";
import { Buffer } from "buffer";

window.Buffer = Buffer;

type Campaign = {
  pubkey: PublicKey;
  name: string;
  description: string;
  accountDonated: BN;
  admin: PublicKey;
};

const PROGRAM_ID = new PublicKey(idl.metadata.address);
const NETWORK = clusterApiUrl("devnet");

const App: FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const opts: { preflightCommitment: Commitment } = {
    preflightCommitment: "processed",
  };

  const { SystemProgram } = web3;

  const getProvider = () => {
    const connection = new Connection(NETWORK, opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana, opts);
    return provider;
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        console.log("Phantom wallet found!");
        const { solana } = window;
        const res = await solana.connect({ onlyIfTrusted: true }); // need user authorize
        console.log("Connected with public key: " + res.publicKey.toString());
        setWalletAddress(res.publicKey.toString());
      } else {
        alert("Solana object not found!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      const { solana } = window;
      const res = await solana.connect();
      console.log("Connected with public key: " + res.publicKey.toString());
      setWalletAddress(res.publicKey.toString());
    }
  };

  const getCampaigns = async () => {
    const connection = new Connection(NETWORK, opts.preflightCommitment);
    const provider = getProvider();
    const program: Program<CrowdFunding> = new Program(
      idl as any,
      PROGRAM_ID,
      provider
    );

    const campaignPDAs = await connection.getProgramAccounts(program.programId);

    const campaignsPromiseArray = campaignPDAs.map(async (campaign) => ({
      ...(await program.account.campaign.fetch(campaign.pubkey)),
      pubkey: campaign.pubkey,
    }));

    const campaigns = await Promise.all(campaignsPromiseArray);

    setCampaigns(campaigns);
  };

  const createCampaign = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl as Idl, PROGRAM_ID, provider);
      const [campaignPDA] = await PublicKey.findProgramAddress(
        [
          utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
          provider.publicKey.toBuffer(),
        ],
        program.programId
      );

      const name = "save me2";
      const description = "save me!!!!";

      await program.methods
        .create(name, description)
        .accounts({
          campaign: campaignPDA,
          user: provider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(
        "created a new campaign with address: " + campaignPDA.toString()
      );
    } catch (err) {
      console.error(err);
    }
  };

  const donate = async (publicKey: PublicKey) => {
    try {
    const provider = getProvider();
    const program = new Program(idl as Idl, PROGRAM_ID, provider);

    await program.methods
      .donate(new BN(0.2 * web3.LAMPORTS_PER_SOL))
      .accounts({
        campaign: publicKey,
        user: provider.publicKey
      })
      .rpc();

    console.log("Donated some money to:", publicKey.toString());
    await getCampaigns();
    } catch (error) {
      console.error("Error donating:", error);
    }
  };

  const withdraw = async (publicKey: PublicKey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl as Idl, PROGRAM_ID, provider);
      await program.methods
        .withdraw(new BN(0.2 * LAMPORTS_PER_SOL))
        .accounts({
          campaign: publicKey,
          user: provider.publicKey,
        })
        .rpc();

      console.log("Withdrew some money from:", publicKey.toString());
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to Wallet</button>
  );

  const renderConnectedContainer = () => (
    <>
      <button onClick={createCampaign}>Create a campaign</button>
      <button onClick={getCampaigns}>Get all campaigns</button>
      <br />
      {campaigns.map((campaign, index) => (
        <div key={"campaign-" + index}>
          <p>Campaign ID: {campaign.pubkey.toString()}</p>
          <p>
            Balance:
            {campaign.accountDonated.toNumber() / LAMPORTS_PER_SOL}
          </p>
          <p>{campaign.name}</p>
          <p>{campaign.description}</p>
          <button onClick={async () => donate(campaign.pubkey)}>
            Click to donate!
          </button>
          <button onClick={() => withdraw(campaign.pubkey)}>
            Click to withdraw!
          </button>
        </div>
      ))}
    </>
  );

  useEffect(() => {
    const onLoad = async () => await checkIfWalletIsConnected();
    window.addEventListener("load", onLoad);

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="App">
      {!walletAddress && renderNotConnectedContainer()}
      {walletAddress && renderConnectedContainer()}
    </div>
  );
};

export default App;
