import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const JUP_QUOTE_URL = process.env.JUP_QUOTE_API_URL!;
const JUP_SWAP_URL = process.env.JUP_SWAP_API_URL;

const connection = new Connection(process.env.SOLANA_MAINNET_URL!);

export const getSwapRoute = async (output: string, amount: number) => {
    try {
        console.log("inside getSwapRoute function\n\n");
    
        const response = await (
            await axios.get(`${JUP_QUOTE_URL}?`, {
            params: {
                inputMint: process.env.SOLANA_MINT_ADDRESS ? process.env.SOLANA_MINT_ADDRESS : "So11111111111111111111111111111111111111112",
                outputMint: output || process.env.USDC_MINT_ADDRESS,
                amount,
                slippage: 1,
            }
        }))
        const data = response.data;

        console.log("Full API Response: " + JSON.stringify(data, null, 2));

        return data;
    } catch (error) {
        console.log("swapRoute error: " + error)
    }
}

export const excuteSwap = async(route: string, wallet: Keypair) => {
    try {

        const userPublicKey = wallet.publicKey.toString()

        console.log("inside excuteswap function")
            const { data: { swapTransaction } } = await axios.post(`${JUP_SWAP_URL}`, {
                route,
                userPublicKey,
            })

        console.log("swapPayload: ", JSON.stringify(swapTransaction));

        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        console.log(transaction);
        
        transaction.sign([wallet]);
        const latestBlockHash = await connection.getLatestBlockhash();

        // Execute the transaction
        const rawTransaction = transaction.serialize()
        const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2
        });
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: txid
        });
        console.log(`https://solscan.io/tx/${txid}`);
    } catch (error) {
        console.log("Error while excuting swap: ", error)
    }
}