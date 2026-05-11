import type { IncomingMessage, ServerResponse } from "node:http";
import { createApiServer } from "../src/server";

const app = await createApiServer();

export default function handler(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  app(req, res);
}
