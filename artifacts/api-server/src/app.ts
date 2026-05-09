import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import router from "./routes";
import { logger } from "./lib/logger";
import type { ApiServerConfig } from "./config";

export function createApp(config: ApiServerConfig): Express {
  const app: Express = express();

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
