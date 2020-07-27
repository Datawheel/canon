const {EventEmitter} = require("events");
const {Worker, MessageChannel} = require("worker_threads");

const WORKER_STATUS = {
  IDLE: Symbol("idle"),
  BUSY: Symbol("busy")
};

/**
 * @typedef WorkResult
 * @property {Error | undefined} error
 * @property {"ERROR" | "SUCCESS"} status
 * @property {any} workData
 */

class WorkerPool extends EventEmitter {

  /**
   * Creates a new pool of worker threads.
   *
   * @param {string} script Path to the worker script
   * @param {number} size Number of concurrent workers
   * @param {(err?: Error, workData: any) => void} [onProgress] Hook for the "progress" event
   */
  constructor(script, size, onProgress) {
    super();

    /** @type {{status: Symbol, worker: Worker}[]} */
    this.pool = [];

    /** @type {any[]} */
    this.queue = [];

    /** @type {WorkResult[]} */
    this.results = [];

    this.totalWorks = 0;

    this.script = script;
    this.size = parseInt(size, 10) || 2;
    this.onProgress = onProgress;

    this._initialize();
  }

  /**
   * Create an initialize workers of the worker pool
   */
  _initialize() {
    for (let i = 0; i < this.size; i++) {
      const worker = new Worker(this.script);
      this.pool.push({
        status: WORKER_STATUS.IDLE,
        worker
      });
      worker.once("exit", () => {
        this.emit(`worker ${worker.threadId} terminated`);
      });
    }

    typeof this.onProgress === "function" &&
      this.on("progress", this.onProgress);

    this.on("workFinished", (workData, result) => {
      this.results.push({workData, status: result.status, error: result.error});
      this.emit("progress", result.error, workData);
      const worker = this.getIdleWorker();
      this.runWork(worker);
    });

    this.on("workError", (workData, error) => {
      this.results.push({workData, status: "ERROR", error});
      const worker = this.getIdleWorker();
      this.runWork(worker);
    });
  }

  terminate() {
    this.removeAllListeners();
    return Promise.all(
      this.pool.map(item => item.worker.terminate())
    );
  }

  /**
   * Return one idle worker from the pool
   * @returns {Worker | null}
   */
  getIdleWorker() {
    const idleWorker = this.pool.find(w => w.status === WORKER_STATUS.IDLE);
    return idleWorker ? idleWorker.worker : null;
  }

  /**
   * Set worker's status to idle
   * @param {Worker} worker
   */
  setWorkerIdle(worker) {
    const currWorker = this.pool.find(w => w.worker === worker);
    if (currWorker) {
      currWorker.status = WORKER_STATUS.IDLE;
    }
  }

  /**
   * Set worker's status to busy
   * @param {Worker} worker
   */
  setWorkerBusy(worker) {
    const currWorker = this.pool.find(w => w.worker === worker);
    if (currWorker) {
      currWorker.status = WORKER_STATUS.BUSY;
    }
  }

  /**
   * Add a new work to the queue
   * @param {any} workData
   */
  queueWork(workData) {
    this.queue.push(workData);
    this.totalWorks++;
    const worker = this.getIdleWorker();
    if (worker) {
      this.runWork(worker);
    }
  }

  /**
   * Run worker script with an element from the queue
   * @param {Worker} worker
   */
  runWork(worker) {
    const workData = this.queue.shift();

    if (workData) {
      this.setWorkerBusy(worker);

      const {port1, port2} = new MessageChannel();
      worker.postMessage({workData, port: port1}, [port1]);

      port2.once("message", result => {
        this.setWorkerIdle(worker);
        this.emit("workFinished", workData, result);
      });
      port2.once("error", err => {
        this.setWorkerIdle(worker);
        this.emit("workError", workData, err);
      });
    }
    else {
      this.emit("finished");
    }
  }

  /**
   * Returns a promise that resolves when the quere is cleared.
   * @returns {Promise<WorkResult[]>}
   */
  waitForResults() {
    return new Promise(resolve => {
      this.once("finished", () => {
        // Wait a bit before finishing so "progress" events complete
        setTimeout(() => {
          resolve(this.results);
        }, 2000);
      });
    });
  }
}

module.exports = WorkerPool;
