import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { getWallet } from "./utils";
import { PrismaClient } from "@prisma/client";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { excuteSwap, getSwapRoute } from "./jup";

dotenv.config();
const client = new PrismaClient();
const token = process.env.TELEGRAM_BOT_API_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

// bot.on("message", async (msg) => {
//   try {
//     const userId = msg.from?.id;
//     const username = msg.from?.username || "No Username";

//     if (!userId) return;

//     let user = await client.user.findFirst({
//       where: { userId, username }
//     });

//     if (!user) {
//       const wallet = getWallet();
//       user = await client.user.create({
//         data: {
//           userId,
//           username,
//           keypair: Array.from(wallet.secretKey),
//         },
//       });
//       console.log(`New user created: ${username} (${userId})`);
//     }

//     bot.sendMessage(userId, `Hello ${username}, your Telegram user ID is ${userId}`);
//   } catch (error) {
//     console.error("Error in message handler:", error);
//   }
// });

bot.onText(/\/start/, async (msg) => {
  try {
    const userId = msg.from?.id;
    const username = msg.from?.username || "No Username";

    if (!userId) return;

    let user = await client.user.findFirst({
      where: { userId, username }
    });

    if (!user) {
      const wallet = getWallet();
      user = await client.user.create({
        data: {
          userId,
          username,
          keypair: Array.from(wallet.secretKey),
        },
      });
      console.log(`New user created: ${username} (${userId})`);
    }

    const wallet = Keypair.fromSecretKey(Uint8Array.from(user.keypair));
    bot.sendMessage(
      userId,
      `Welcome to Swaper\nSolana’s fastest bot to trade any coin (SPL token), built by the Neel Contractor!\n\n` +
        `You currently have no SOL in your wallet. To start trading, deposit SOL to your Swaper bot wallet address:\n\n${wallet.publicKey.toBase58()}\n\n` +
        `Use /swap <amount> SOL <to_token>\n\nTo retrieve your private key, /expose. If you expose your private key we can't protect you!\n\n` +
        `We suggest you to import the secret key into your wallet (like Phantom or Backpack) before swapping, or take out your funds after the swap to avoid potential loss after a hard refresh.\n\n` +
        `Run /help for all commands we offer.`
    );
  } catch (error) {
    console.error("Error in /start handler:", error);
  }
});

// /\/swap (\d+\.?\d*) (\w+)/

bot.onText(/\/swap (.+)/, async (msg, match) => {
    console.log("inside function");
    try {
      const userId = msg.from?.id;
      const username = msg.from?.username || "No Username";

  
      if (!userId) return;
  
      if (!match) {
        bot.sendMessage(userId, `Invalid command! Use /swap <amount> <to_token>`);
        return;
      }
  
      const amount = parseFloat(match[1]);
      const toToken = match[2];
  
      let user = await client.user.findFirst({
        where: { userId, username }
      });
  
      if (!user) {
        bot.sendMessage(
          userId,
          `You don't have a wallet setup. Please run /start to initialize your wallet first.`
        );
        return;
      }
  
      const wallet = Keypair.fromSecretKey(Uint8Array.from(user.keypair));
  
      bot.sendMessage(
        userId,
        `Finding the best route to swap ${amount} SOL to ${toToken}...\nWith a slippage of 1%. Please wait...`
      );
  
      const route = await getSwapRoute(toToken, amount * LAMPORTS_PER_SOL);
    //   console.log("Route response: ", route);

      if(!route) return;
  
      bot.sendMessage(
        userId,
        `Found Route! Excuting Swap....`
      );

      const txResponse = await excuteSwap(route, wallet);

      bot.sendMessage(
        userId,
        `Swap complete! You have successfully swapped ${amount} SOL to ${toToken}.`
      );
    } catch (error) {
      console.error("Error in /swap handler:", error);
      bot.sendMessage(msg.chat.id, `Something went wrong.\nMake sure you are using the correct command to swap\n\n /swap <amount> <to_token>. \n\nPlease try again later.`);
    }
  });
  