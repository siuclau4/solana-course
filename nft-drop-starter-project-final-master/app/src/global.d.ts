export {};
import IPhantomProvider from "./interfaces";

declare global {
  interface Window {
    solana: IPhantomProvider;
  }
}
