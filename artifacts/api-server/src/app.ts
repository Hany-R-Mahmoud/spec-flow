import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import type { ApiServerConfig } from "./config.js";

export function createApp(config: ApiServerConfig): ReturnType<typeof express> {
  const app = express();

  app.use(
    clerkMiddleware({
      secretKey: config.clerkSecretKey,
      publishableKey: config.clerkPublishableKey,
      authorizedParties: config.appOrigins,
      clockSkewInMs: config.clerkClockSkewInMs,
    }),
  );
  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split("?")[0],
          };
        },
        res(res) {
          return {
            statusCode: res.statusCode,
          };
        },
      },
    }),
  );
  app.use(
    cors({
      origin: config.appOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", router);

  return app;
}

export default createApp;
