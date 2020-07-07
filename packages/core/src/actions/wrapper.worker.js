import {expose} from "comlink";

/** Generic Axios fetch from worker */
async function wrapperWorker(fn, cb) {
  await cb(await fn());
}

expose(wrapperWorker);
