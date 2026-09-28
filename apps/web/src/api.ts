export type Role = "viewer" | "investigator" | "approver" | "administrator";

const API = "http://127.0.0.1:8000";

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
  return request<{ token: string; role: Role; username: string }>("/api/v1/auth/login", null, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function stories(token: string) {
  return request<{ stories: { id: string; title: string; summary: string; primary_policy: string }[] }>("/api/v1/stories", token);
}

export function startStory(token: string, id: string, mode: "manual" | "automated") {
  return request<{ run_id: string; status: string }>(`/api/v1/stories/${id}/runs`, token, {
    method: "POST",
    body: JSON.stringify({ mode, presentation: false }),
  });
}

export function getRun(token: string, id: string, presentation: boolean) {
  return request<RunView>(`/api/v1/runs/${id}?presentation=${presentation}`, token);
}

export function approve(token: string, id: string, decision: "approve" | "reject", preconditionHash: string) {
  return request<RunView>(`/api/v1/runs/${id}/approvals`, token, {
    method: "POST",
    body: JSON.stringify({ decision, precondition_hash: preconditionHash }),
  });
}

export function catalog(token: string) {
  return request<{ counts: Record<string, number | Record<string, number>> }>("/api/v1/catalog", token);
}

export function models(token: string) {
  return request<ModelReport>("/api/v1/models", token);
}

export function monitoring(token: string) {
  return request<Monitoring>("/api/v1/monitoring", token);
}

export function adapters() {
  return request<{ adapters: Adapter[] }>("/api/v1/adapters", null);
}

export function truth(token: string, id: string) {
  return request<{ truth_namespace: boolean; label: string; evaluator: { faults?: unknown[] } }>(`/api/v1/runs/${id}/truth`, token);
}

export function audit(token: string, id: string) {
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
