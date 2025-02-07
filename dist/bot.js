"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./utils");
const client_1 = require("@prisma/client");
const web3_js_1 = require("@solana/web3.js");
const jup_1 = require("./jup");
dotenv_1.default.config();
const client = new client_1.PrismaClient();
const token = process.env.TELEGRAM_BOT_API_TOKEN;
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
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
bot.onText(/\/start/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = msg.from) === null || _a === void 0 ? void 0 : _a.id;
        const username = ((_b = msg.from) === null || _b === void 0 ? void 0 : _b.username) || "No Username";
        if (!userId)
            return;
        let user = yield client.user.findFirst({
            where: { userId, username }
        });
        if (!user) {
            const wallet = (0, utils_1.getWallet)();
            user = yield client.user.create({
                data: {
                    userId,
                    username,
                    keypair: Array.from(wallet.secretKey),
                },
            });
            console.log(`New user created: ${username} (${userId})`);
        }
        const wallet = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(user.keypair));
        bot.sendMessage(userId, `Welcome to Swaper\nSolana’s fastest bot to trade any coin (SPL token), built by the Neel Contractor!\n\n` +
            `You currently have no SOL in your wallet. To start trading, deposit SOL to your Swaper bot wallet address:\n\n${wallet.publicKey.toBase58()}\n\n` +
            `Use /swap <amount> SOL <to_token>\n\nTo retrieve your private key, /expose. If you expose your private key we can't protect you!\n\n` +
            `We suggest you to import the secret key into your wallet (like Phantom or Backpack) before swapping, or take out your funds after the swap to avoid potential loss after a hard refresh.\n\n` +
            `Run /help for all commands we offer.`);
    }
    catch (error) {
        console.error("Error in /start handler:", error);
    }
}));
// /\/swap (\d+\.?\d*) (\w+)/
bot.onText(/\/swap (.+)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("inside function");
    try {
        const userId = (_a = msg.from) === null || _a === void 0 ? void 0 : _a.id;
        const username = ((_b = msg.from) === null || _b === void 0 ? void 0 : _b.username) || "No Username";
        if (!userId)
            return;
        if (!match) {
            bot.sendMessage(userId, `Invalid command! Use /swap <amount> <to_token>`);
            return;
        }
        const amount = parseFloat(match[1]);
        const toToken = match[2];
        let user = yield client.user.findFirst({
            where: { userId, username }
        });
        if (!user) {
            bot.sendMessage(userId, `You don't have a wallet setup. Please run /start to initialize your wallet first.`);
            return;
        }
        const wallet = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(user.keypair));
        bot.sendMessage(userId, `Finding the best route to swap ${amount} SOL to ${toToken}...\nWith a slippage of 1%. Please wait...`);
        const route = yield (0, jup_1.getSwapRoute)(toToken, amount * web3_js_1.LAMPORTS_PER_SOL);
        //   console.log("Route response: ", route);
        if (!route)
            return;
        bot.sendMessage(userId, `Found Route! Excuting Swap....`);
        const txResponse = yield (0, jup_1.excuteSwap)(route, wallet.publicKey.toString());
        bot.sendMessage(userId, `Swap complete! You have successfully swapped ${amount} SOL to ${toToken}.`);
    }
    catch (error) {
        console.error("Error in /swap handler:", error);
        bot.sendMessage(msg.chat.id, `Something went wrong.\nMake sure you are using the correct command to swap\n\n /swap <amount> <to_token>. \n\nPlease try again later.`);
    }
}));
