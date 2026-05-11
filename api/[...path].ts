type NodeRequestHandler = {
  handle(req: unknown, res: unknown): void;
};

type ServerModule = {
  createApiServer: () => Promise<NodeRequestHandler>;
};

const SERVER_BUNDLE_PATH = "../artifacts/api-server/dist/server.mjs";

let appPromise: Promise<NodeRequestHandler> | null = null;

async function loadServerModule(): Promise<ServerModule> {
  return (await import(SERVER_BUNDLE_PATH)) as ServerModule;
}

function getApp(): Promise<NodeRequestHandler> {
  appPromise ??= loadServerModule().then((server) => server.createApiServer());
  return appPromise;
}

export default async function handler(
  req: unknown,
  res: unknown,
): Promise<void> {
  const app = await getApp();
  app.handle(req, res);
}
