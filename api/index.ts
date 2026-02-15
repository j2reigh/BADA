import { app, initPromise } from "../server/app";

// Wait for routes to register before handling requests
let initialized = false;
const init = initPromise.then(() => { initialized = true; });

export default async function handler(req: any, res: any) {
  if (!initialized) await init;
  app(req, res);
}
