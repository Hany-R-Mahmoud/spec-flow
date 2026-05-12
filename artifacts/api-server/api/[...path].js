const SERVER_BUNDLE_PATH = "../dist/server.mjs";

let appPromise = null;

async function loadServerModule() {
  return import(SERVER_BUNDLE_PATH);
}

function getApp() {
  appPromise ??= loadServerModule().then((server) => server.createApiServer());
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  app.handle(req, res);
}
