import { Connection, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.SOLANA_MAINNET_URL!)

export const getWallet = () => {
    const keypair = Keypair.generate();
    return keypair;
}

export const sendTransaction = async (signedTx: Buffer) => {
    const txid = await connection.sendRawTransaction(signedTx);
    await connection.confirmTransaction(txid);
    return txid;
}