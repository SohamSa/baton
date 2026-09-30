const PUBLIC_DEMO = import.meta.env.VITE_PUBLIC_DEMO === "true";

type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void; onFrame?: (frame: unknown) => void };

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();
const listeners = new Set<(message: string) => void>();
let engineMessage = "Choose a rehearsal when you are ready to load the decision engine.";

function emit(message: string) {
  engineMessage = message;
  listeners.forEach((listener) => listener(message));
}

export function subscribeEngine(listener: (message: string) => void) {
  listeners.add(listener);
  listener(engineMessage);
  return () => {
    listeners.delete(listener);
  };
}

export function startEngine(): Promise<void> {
  if (!PUBLIC_DEMO) return Promise.resolve();
  if (ready) return ready;
  worker = new Worker(`${import.meta.env.BASE_URL}engine-worker.js?engine=8`);
  ready = new Promise((resolve, reject) => {
    worker!.onmessage = (event: MessageEvent) => {
      const data = event.data as { type: string; id?: number; message?: string; value?: unknown };
      if (data.type === "status" && data.message) emit(data.message);
      if (data.type === "ready") {
        emit("The decision engine is ready in this browser.");
        resolve();
      }
      if (data.type === "fatal") reject(new Error(data.message || "The decision engine failed to start."));
      if (data.type === "frame") {
        if (data.id != null) pending.get(data.id)?.onFrame?.(data.value);
        return;
      }
      if (data.id == null) return;
      const job = pending.get(data.id);
      if (!job) return;
      pending.delete(data.id);
      if (data.type === "error") job.reject(new Error(data.message || "The decision engine failed."));
      if (data.type === "result") job.resolve(data.value);
    };
    worker!.onerror = () => reject(new Error("The decision engine failed to start."));
  });
  return ready;
}

let tail: Promise<void> = Promise.resolve();

export async function engineCall<T>(op: string, payload?: unknown, onFrame?: (frame: unknown) => void): Promise<T> {
  const task = tail.then(() => invoke<T>(op, payload, onFrame));
  tail = task.then(() => undefined, () => undefined);
  return task;
}

function invoke<T>(op: string, payload: unknown, onFrame?: (frame: unknown) => void): Promise<T> {
  return startEngine().then(() => new Promise((resolve, reject) => {
    const id = nextId;
    nextId += 1;
    pending.set(id, { resolve: (value) => resolve(value as T), reject, onFrame });
    worker!.postMessage({ id, op, payload });
  }));
}

