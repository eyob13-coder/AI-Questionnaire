import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

import * as fs from "fs";

export const POST = async (req: Request) => {
  try {
    const res = await handlers.POST(req);
    if (res.status >= 400) {
      const clone = res.clone();
      const text = await clone.text().catch(() => "");
      fs.writeFileSync("better-auth-error.log", `[auth] POST error ${res.status}: ${text}`);
    }
    return res;
  } catch (error) {
    fs.writeFileSync("better-auth-error.log", `[auth] POST exception: ${String(error)}`);
    throw error;
  }
};

export const GET = async (req: Request) => {
  try {
    const res = await handlers.GET(req);
    if (res.status >= 400) {
      const clone = res.clone();
      console.error(`[auth] GET error ${res.status}:`, await clone.text().catch(() => ""));
    }
    return res;
  } catch (error) {
    console.error("[auth] GET exception:", error);
    throw error;
  }
};
