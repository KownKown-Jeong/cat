import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

// 환경변수 로드 확실히 하기
dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export { anthropic };
