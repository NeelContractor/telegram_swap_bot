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
exports.sendTransaction = exports.getWallet = void 0;
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connection = new web3_js_1.Connection(process.env.SOLANA_MAINNET_URL);
const getWallet = () => {
    const keypair = web3_js_1.Keypair.generate();
    return keypair;
};
exports.getWallet = getWallet;
const sendTransaction = (signedTx) => __awaiter(void 0, void 0, void 0, function* () {
    const txid = yield connection.sendRawTransaction(signedTx);
    yield connection.confirmTransaction(txid);
    return txid;
});
exports.sendTransaction = sendTransaction;
