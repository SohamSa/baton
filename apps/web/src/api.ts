import { engineCall, startEngine } from "./browserEngine";

export type Role = "viewer" | "investigator" | "approver" | "administrator";

const API = "http://127.0.0.1:8000";
const PUBLIC_DEMO = import.meta.env.VITE_PUBLIC_DEMO === "true";

type StoredRun = RunView & { storyId: string; mode: "manual" | "automated"; approvals: { action_id?: string; decision: string; precondition_hash: string; actor: string }[] };

const openRuns = new Map<string, StoredRun>();

function present(view: RunView, presentation: boolean): RunView {
  if (!presentation) return { ...view, presentation: false };
  const hidden = { ...view, presentation: true };
  delete hidden.metrics;
  delete hidden.comparison;
  return hidden;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeader(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || response.statusText);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json() as Promise<T>;
  return (await response.text()) as T;
}

export function login(username: string, password: string) {
  if (PUBLIC_DEMO) {
    return Promise.resolve({ token: "public", role: "approver" as Role, username: "public visitor" });
  }
  return request<{ token: string; role: Role; username: string }>("/api/v1/auth/login", null, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function stories(token: string) {
  if (PUBLIC_DEMO) {
    return startEngine().then(() => engineCall<{ stories: { id: string; title: string; summary: string; primary_policy: string }[] }>("stories"));
  }
  return request<{ stories: { id: string; title: string; summary: string; primary_policy: string }[] }>("/api/v1/stories", token);
}

export async function startStory(token: string, id: string, mode: "manual" | "automated") {
  if (PUBLIC_DEMO) {
    const view = await engineCall<RunView>("run", { story_id: id, mode, approvals: [] });
    const runId = `${id}:${mode}:${crypto.randomUUID()}`;
    openRuns.set(runId, { ...view, run_id: runId, storyId: id, mode, approvals: [] });
    return { run_id: runId, status: view.status };
  }
  return request<{ run_id: string; status: string }>(`/api/v1/stories/${id}/runs`, token, {
    method: "POST",
    body: JSON.stringify({ mode, presentation: false }),
  });
}

export function getRun(token: string, id: string, presentation: boolean) {
  if (PUBLIC_DEMO) {
    const current = openRuns.get(id);
    if (!current) return Promise.reject(new ApiError(404, "Open a story from this page first."));
    return Promise.resolve(present(current, presentation));
  }
  return request<RunView>(`/api/v1/runs/${id}?presentation=${presentation}`, token);
}

export async function approve(token: string, id: string, decision: "approve" | "reject", preconditionHash: string) {
  if (PUBLIC_DEMO) {
    const current = openRuns.get(id);
    if (!current?.pending_action) throw new ApiError(409, "No action is awaiting approval.");
    if ((current.pending_action.precondition_hash ?? "") !== preconditionHash) {
      throw new ApiError(409, "The preconditions changed, so this approval was not applied.");
    }
    const approvals = [...current.approvals, { action_id: current.pending_action.action_id, decision, precondition_hash: preconditionHash, actor: "public visitor" }];
    const view = await engineCall<RunView>("run", { story_id: current.storyId, mode: "manual", approvals });
    const stored = { ...view, run_id: id, storyId: current.storyId, mode: current.mode, approvals };
    openRuns.set(id, stored);
    return stored;
  }
  return request<RunView>(`/api/v1/runs/${id}/approvals`, token, {
    method: "POST",
    body: JSON.stringify({ decision, precondition_hash: preconditionHash }),
  });
}

export function catalog(token: string) {
  if (PUBLIC_DEMO) return engineCall<{ counts: Record<string, number | Record<string, number>> }>("catalog");
  return request<{ counts: Record<string, number | Record<string, number>> }>("/api/v1/catalog", token);
}

export function models(token: string) {
  if (PUBLIC_DEMO) return engineCall<ModelReport>("train");
  return request<ModelReport>("/api/v1/models", token);
}

export function monitoring(token: string) {
  if (PUBLIC_DEMO) return engineCall<Monitoring>("monitoring");
  return request<Monitoring>("/api/v1/monitoring", token);
}

export function adapters() {
  if (PUBLIC_DEMO) return engineCall<{ adapters: Adapter[] }>("adapters");
  return request<{ adapters: Adapter[] }>("/api/v1/adapters", null);
}

export function truth(token: string, id: string) {
  if (PUBLIC_DEMO) return Promise.reject(new ApiError(403, "The public demonstration does not include administrator access or latent truth."));
  return request<{ truth_namespace: boolean; label: string; evaluator: { faults?: unknown[] } }>(`/api/v1/runs/${id}/truth`, token);
}

export function audit(token: string, id: string) {
  if (PUBLIC_DEMO) {
    const current = openRuns.get(id);
    if (!current) return Promise.reject(new ApiError(404, "Open a story from this page first."));
    const events = [
      { actor: "public visitor", action: "run_story", detail: current.storyId },
      ...(current.actions ?? []).filter((action) => action.actor_kind === "human").map((action) => ({
        actor: action.actor || "public visitor",
        action: `approval_${action.state === "cancelled" ? "reject" : "approve"}`,
        detail: action.action_id || action.action_type,
      })),
    ];
    return Promise.resolve({ events, actions: current.actions ?? [] });
  }
  return request<{ events: { actor: string; action: string; detail: string }[]; actions: Action[] }>(`/api/v1/runs/${id}/audit`, token);
}

export type Action = {
  action_id?: string;
  action_type: string;
  state: string;
  scope?: string;
  step?: number;
  actor?: string;
  actor_kind?: string;
  reason?: string;
  precondition_hash?: string;
  high_impact?: boolean;
};

export type RunView = {
  run_id?: string;
  synthetic: boolean;
  status: string;
  narrative: string;
  presentation?: boolean;
  story?: { id: string; title: string; summary: string };
  hypotheses?: { leading_mechanism: string; abstain: boolean; abstain_reason?: string; alternatives?: { mechanism: string; cause_family: string }[] };
  jobs?: Record<string, { state: string; capability: string; rank_gpu: string[]; useful_new?: number; progress?: number; dropped?: number[] }>;
  actions?: Action[];
  checkpoints?: { checkpoint_id: string; progress: number; state: string; shards_present: number; shards_expected: number; reason?: string }[];
  incidents?: { incident_id: string; scope: string; opened_step: number; state: string }[];
  pending_action?: Action | null;
  metrics?: { useful_new: number; recomputation: number; job_interruption_seconds: number; goodput_per_wall_second: number | null };
  comparison?: { counterfactual: boolean; branches: { policy: string; useful_new: number; interruption_seconds: number; recomputation: number }[]; delta_second_minus_first?: { useful_new: number } | null };
  timeline?: { entity_id: string; step: number; gpu_temp_c: number | null; power_draw_w: number | null }[];
  gpus?: Record<string, { gpu_temp_c: number | null; power_draw_w: number | null; residual_ewma: number | null; family: string; phase: string; fan_speed_ratio: number | null }>;
  provenance?: { seed: number; config_hash: string };
  cluster?: {
    accelerator_count: number;
    detailed_accelerator_count: number;
    quiescent_accelerator_count: number;
    host_count: number;
    rack_count: number;
    fabric_domain_count: number;
    gpus_per_host: number;
    attached: boolean;
    note: string;
  };
};

export type ModelReport = {
  operational_default: string;
  trained_report: null | {
    beats_baseline: boolean;
    model_average_precision: number;
    baseline_average_precision: number;
    default_operational_policy: string;
    note: string;
    feature_contract: string[];
  };
  oracle: { available_to_operators: boolean; label: string };
};

export type Monitoring = {
  collectors: { id: string; lag_steps: number; dropped_count: number; degraded: boolean; queue_depth: number }[];
  note: string;
  hardware_adapters_connected: boolean;
};

export type Adapter = { name: string; connected: boolean; implementation: string; reason?: string };
