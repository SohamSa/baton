const PUBLIC_DEMO = import.meta.env.VITE_PUBLIC_DEMO === "true";

type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void };

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();
const listeners = new Set<(message: string) => void>();
let engineMessage = "Loading the decision engine into this browser.";

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
  worker = new Worker(`${import.meta.env.BASE_URL}engine-worker.js?engine=2`);
  ready = new Promise((resolve, reject) => {
    worker!.onmessage = (event: MessageEvent) => {
      const data = event.data as { type: string; id?: number; message?: string; value?: unknown };
      if (data.type === "status" && data.message) emit(data.message);
      if (data.type === "ready") {
        emit("The decision engine is ready in this browser.");
        resolve();
      }
      if (data.type === "fatal") reject(new Error(data.message || "The decision engine failed to start."));
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

export async function engineCall<T>(op: string, payload?: unknown): Promise<T> {
  await startEngine();
  const id = nextId;
  nextId += 1;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve: (value) => resolve(value as T), reject });
    worker!.postMessage({ id, op, payload });
  });
}
