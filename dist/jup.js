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
exports.excuteSwap = exports.getSwapRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JUP_QUOTE_URL = process.env.JUP_QUOTE_API_URL;
const JUP_SWAP_URL = process.env.JUP_SWAP_API_URL;
const getSwapRoute = (output, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("inside getSwapRoute function\n\n");
        const response = yield (yield axios_1.default.get(`${JUP_QUOTE_URL}?`, {
            params: {
                inputMint: process.env.SOLANA_MINT_ADDRESS ? process.env.SOLANA_MINT_ADDRESS : "So11111111111111111111111111111111111111112",
                outputMint: output || process.env.USDC_MINT_ADDRESS,
                amount,
                slippage: 1,
            }
        }));
        const data = response.data;
        console.log("Full API Response: " + JSON.stringify(data, null, 2));
        return data;
    }
    catch (error) {
        console.log("swapRoute error: " + error);
    }
});
exports.getSwapRoute = getSwapRoute;
const excuteSwap = (route, userPublicKey) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    console.log("inside excuteswap function");
    const { data: { swapTransaction } } = yield axios_1.default.post(`${JUP_SWAP_URL}`, {
        route,
        userPublicKey,
    });
    console.log("swapPayload: ", JSON.stringify(swapTransaction));
    // }
});
exports.excuteSwap = excuteSwap;
