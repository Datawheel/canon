const {EventEmitter} = require("events");
const {Worker, MessageChannel} = require("worker_threads");

/**
 * @typedef WorkResultData
 * @property {any} job
 * @property {"SUCCESS" | "FAILURE"} status
 * @property {any} data
 */

/**
 * @typedef WorkResultError
 * @property {any} job
 * @property {"ERROR"} status
 * @property {Error} error
 */

/**
 * @typedef {WorkResultData | WorkResultError} WorkResult
 */

const WORKER_STATUS = {
  NULL: Symbol("null"),
  IDLE: Symbol("idle"),
  BUSY: Symbol("busy")
};

const EVENTS = {
  FINISHED: "finished",
  PROGRESS: "progress",
  READY: "ready"
};

class WorkerPool extends EventEmitter {

  /**
   * Creates a new pool of worker threads.
   *
   * @param {string} script Path to the worker script
   * @param {number} size Number of concurrent workers
   * @param {(result: WorkResult) => void} [onProgress] Hook for the "progress" event
   */
  constructor(script, size, onProgress) {
    super();

    /** @type {any[]} */
    this.queue = [];

    /** @type {WorkResult[]} */
    this.results = [];

    this.jobsTotal = 0;
    this.jobsSuccess = 0;
    this.jobsFailure = 0;
    this.jobsError = 0;
    this.jobsStartTime = 0;

    this.script = script;
    this.size = parseInt(size, 10) || 2;

    this.pool = new Array(this.size).fill(0).map(() => {
      const worker = new Worker(this.script);
      worker.on("message", value => {
        if (value === "ready") {
          this.setWorkerIdle(worker);
          this.areWorkersReady() && this.emit(EVENTS.READY);
          worker.removeAllListeners("message");
        }
      });
      return {status: WORKER_STATUS.NULL, worker};
    });

    if (typeof onProgress === "function") {
      this.on(EVENTS.PROGRESS, onProgress);
    }
  }

  terminate() {
    this.removeAllListeners();
    return Promise.all(
      this.pool.map(item => item.worker.terminate())
    );
  }

  /**
   * Checks if all the workers are ready to accept jobs
   * @returns {boolean}
   */
  areWorkersReady() {
    return this.pool.every(w => w.status !== WORKER_STATUS.NULL);
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
    this.jobsTotal++;
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
    const job = this.queue.shift();

    if (job) {
      this.setWorkerBusy(worker);

      /** @type {(report: Omit<WorkResultData, "job"> | Omit<WorkResultError, "job">)} */
      const reportHandler = report => {
        this.setWorkerIdle(worker);

        report.status === "SUCCESS" && this.jobsSuccess++;
        report.status === "FAILURE" && this.jobsFailure++;
        report.status === "ERROR" && this.jobsError++;

        const result = {...report, job};
        this.results.push(result);
        this.emit(EVENTS.PROGRESS, result);

        const nextWorker = this.getIdleWorker();
        nextWorker && this.runWork(nextWorker);
      };

      const {port1, port2} = new MessageChannel();
      port2.once("message", reportHandler);
      worker.postMessage({job, port: port1}, [port1]);
    }
    else {
      this.emit(EVENTS.FINISHED);
    }
  }

  /**
   * Returns a promise that resolves when all workers in the pool are ready to
   * accepts jobs.
   * @returns {Promise<void>}
   */
  waitForWorkersReady() {
    return new Promise(resolve => {
      this.jobsStartTime = Date.now();
      this.areWorkersReady()
        ? resolve()
        : this.once(EVENTS.READY, resolve);
    });
  }

  /**
   * Returns a promise that resolves when the quere is cleared.
   * @returns {Promise<WorkResult[]>}
   */
  waitForResults() {
    return new Promise(resolve => {
      this.once(EVENTS.FINISHED, () => {
        // Wait a bit before finishing so "progress" events complete
        setTimeout(() => {
          resolve(this.results);
        }, 2000);
      });
    });
  }

  /** */
  printProgressBar() {
    const {jobsTotal, jobsSuccess, jobsFailure, jobsError} = this;
    const jobsFinished = this.results.length;
    const progress = jobsFinished / jobsTotal;

    const elapsed = Math.floor((Date.now() - this.jobsStartTime) / 1000);
    const estTotal = Math.ceil(elapsed * jobsTotal / jobsFinished);
    const remaining = estTotal - elapsed;
    const timeRemaining = `${Math.floor(remaining / 3600)}h${Math.floor(remaining % 3600 / 60)}m`.replace(/\D?0[hm]/g, "") || "<1m";

    const labels = `${jobsTotal}: ${jobsSuccess}S ${jobsFailure}F ${jobsError}E [${timeRemaining}]`;

    const widthSpace = process.stdout.columns * 1 || 80;
    const barLength = widthSpace - labels.length - 8;
    const bar = [].concat(
      new Array(Math.floor(barLength * progress)).fill("#"),
      new Array(barLength).fill(" ")
    ).join("");

    process.stdout.write("\r\x1b[K");
    process.stdout.write(`${labels} [${bar.substr(0, barLength)}] ${Math.floor(progress * 100)}%`);
  }
}

module.exports = WorkerPool;
