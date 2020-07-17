const {EventEmitter} = require("events");
const {Worker, MessageChannel} = require("worker_threads");

const WORKER_STATUS = {
  IDLE: Symbol("idle"),
  BUSY: Symbol("busy")
};

class WorkerPool extends EventEmitter {
  constructor(script, size) {
    super();
    this.script = script;
    this.size = parseInt(size, 10) || 2;
    this.pool = [];
    this.queue = [];
    this.results = [];
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

    this.on("workFinished", (workData, result) => {
      this.results.push({workData, status: result.status, error: result.error});
      const worker = this.getIdleWorker();
      this.runWork(worker);
    });

    this.on("workError", (workData, error) => {
      this.results.push({workData, status: "ERROR", error});
      const worker = this.getIdleWorker();
      this.runWork(worker);
    });
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
   * @param {any} data
   */
  queueWork(work) {
    this.queue.push(work);
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
      this.emit("progress", workData);

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
   * @returns {Promise<any[]>}
   */
  waitForResults() {
    return new Promise(resolve => {
      this.once("finished", () => {
        resolve(this.results);
      });
    });
  }
}

module.exports = WorkerPool;
