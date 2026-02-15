import { app, initPromise } from "./app";

let initialized = false;
const init = initPromise.then(() => { initialized = true; });

export default async function handler(req: any, res: any) {
  if (!initialized) await init;
  app(req, res);
}
