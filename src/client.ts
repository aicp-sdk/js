import { AICPError } from './errors';
import type {
  AICPClientOptions,
  AcceptInviteOptions,
  AddProviderOptions,
  ApiKey,
  AuthResponse,
  Candidate,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatMessage,
  CreateKeyOptions,
  CreateKeyResponse,
  CreateProjectOptions,
  ExcludedProvider,
  InviteInfo,
  InviteResponse,
  Invitation,
  ListHistoryParams,
  ListRequestsParams,
  LoginOptions,
  Member,
  ModelInfo,
  Period,
  Project,
  ProjectBudget,
  ProjectEnvironment,
  ProjectPolicy,
  ProjectProvider,
  ProjectRoutingConfig,
  ProviderConfig,
  ProviderTestResult,
  ReplayData,
  Recommendation,
  RequestDetail,
  RequestSummary,
  RoutingAlias,
  RoutingConfig,
  RoutingDecision,
  RoutingDecisionSummary,
  SignupOptions,
  TimelineEvent,
  UpdateProjectOptions,
  UsageBreakdown,
  UsageOverview,
  UsageRecommendations,
  UsageSeriesPoint,
  UserRole,
} from './types';

// ─── Internal fetch helper types ──────────────────────────────────────────────

type Req = <T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string | number | undefined>,
) => Promise<T>;

type StreamFn = (path: string, body: unknown) => AsyncGenerator<string>;

// ─── Namespace: auth ──────────────────────────────────────────────────────────

class AuthNamespace {
  constructor(private _req: Req) {}

  signup(options: SignupOptions): Promise<AuthResponse> {
    return this._req('POST', '/auth/signup', {
      org_name:  options.orgName,
      email:     options.email,
      password:  options.password,
      user_name: options.userName,
    });
  }

  login(options: LoginOptions): Promise<AuthResponse> {
    return this._req('POST', '/auth/login', {
      email:    options.email,
      password: options.password,
    });
  }

  getInviteInfo(token: string): Promise<InviteInfo> {
    return this._req('GET', '/auth/invite/info', undefined, { token });
  }

  acceptInvite(options: AcceptInviteOptions): Promise<AuthResponse> {
    return this._req('POST', '/auth/invite/accept', {
      token:    options.token,
      name:     options.name,
      password: options.password,
    });
  }
}

// ─── Namespace: members ───────────────────────────────────────────────────────

class MembersNamespace {
  constructor(private _req: Req) {}

  list(): Promise<{ members: Member[] }> {
    return this._req('GET', '/auth/members');
  }

  listInvitations(): Promise<{ invitations: Invitation[] }> {
    return this._req('GET', '/auth/invitations');
  }

  invite(email: string, role: UserRole): Promise<InviteResponse> {
    return this._req('POST', '/auth/invite', { email, role });
  }
}

// ─── Namespace: projects ──────────────────────────────────────────────────────

class ProjectsNamespace {
  constructor(private _req: Req) {}

  list(): Promise<{ projects: Project[] }> {
    return this._req('GET', '/projects');
  }

  get(id: string): Promise<Project> {
    return this._req('GET', `/projects/${id}`);
  }

  create(options: CreateProjectOptions): Promise<Project> {
    return this._req('POST', '/projects', options);
  }

  update(id: string, options: UpdateProjectOptions): Promise<Project> {
    return this._req('PATCH', `/projects/${id}`, options);
  }

  delete(id: string): Promise<{ success: boolean }> {
    return this._req('DELETE', `/projects/${id}`);
  }
}

// ─── Namespace: keys ──────────────────────────────────────────────────────────

class KeysNamespace {
  constructor(private _req: Req) {}

  list(projectId?: string): Promise<{ keys: ApiKey[] }> {
    return this._req('GET', '/keys', undefined, projectId ? { project_id: projectId } : undefined);
  }

  create(options: CreateKeyOptions): Promise<CreateKeyResponse> {
    return this._req('POST', '/keys', {
      name:       options.name,
      project_id: options.projectId,
      scopes:     options.scopes,
      expires_at: options.expiresAt,
    });
  }

  delete(id: string): Promise<{ success: boolean }> {
    return this._req('DELETE', `/keys/${id}`);
  }
}

// ─── Namespace: providers ─────────────────────────────────────────────────────

class ProvidersNamespace {
  constructor(private _req: Req) {}

  list(): Promise<{ configs: ProviderConfig[] }> {
    return this._req('GET', '/v1/providers');
  }

  add(options: AddProviderOptions): Promise<{ success: boolean }> {
    return this._req('POST', '/v1/providers', {
      provider:       options.provider,
      api_key:        options.apiKey,
      enabled_models: options.enabledModels ?? [],
    });
  }

  delete(provider: string): Promise<{ success: boolean }> {
    return this._req('DELETE', `/v1/providers/${provider}`);
  }

  enable(provider: string): Promise<{ success: boolean }> {
    return this._req('PATCH', `/v1/providers/${provider}/enable`);
  }

  disable(provider: string): Promise<{ success: boolean }> {
    return this._req('PATCH', `/v1/providers/${provider}/disable`);
  }

  test(provider: string): Promise<ProviderTestResult> {
    return this._req('POST', `/v1/providers/${provider}/test`);
  }
}

// ─── Namespace: routing ───────────────────────────────────────────────────────

class RoutingNamespace {
  constructor(private _req: Req) {}

  getConfig(): Promise<RoutingConfig> {
    return this._req('GET', '/v1/routing/config');
  }

  updateConfig(config: Partial<RoutingConfig>): Promise<{ success: boolean }> {
    return this._req('PUT', '/v1/routing/config', config);
  }

  listHistory(params: ListHistoryParams = {}): Promise<{ decisions: RoutingDecisionSummary[]; total: number }> {
    return this._req('GET', '/v1/routing/history', undefined, {
      limit:    params.limit,
      offset:   params.offset,
      provider: params.provider,
      strategy: params.strategy,
      status:   params.status,
    });
  }

  getDecision(id: string): Promise<RoutingDecision> {
    return this._req('GET', `/v1/routing/history/${id}`);
  }

  listAliases(): Promise<RoutingAlias[]> {
    return this._req('GET', '/v1/routing/aliases');
  }

  setAlias(alias: string, model: string): Promise<RoutingAlias> {
    return this._req('PUT', '/v1/routing/aliases', { alias, model });
  }

  deleteAlias(alias: string): Promise<void> {
    return this._req('DELETE', `/v1/routing/aliases/${alias}`);
  }
}

// ─── Namespace: requests ──────────────────────────────────────────────────────

class RequestsNamespace {
  constructor(private _req: Req) {}

  list(params: ListRequestsParams = {}): Promise<{ requests: RequestSummary[]; total: number }> {
    return this._req('GET', '/v1/requests', undefined, {
      limit:     params.limit,
      offset:    params.offset,
      search:    params.search,
      provider:  params.provider,
      strategy:  params.strategy,
      status:    params.status,
      date_from: params.dateFrom,
      date_to:   params.dateTo,
    });
  }

  get(id: string): Promise<RequestDetail> {
    return this._req('GET', `/v1/requests/${id}`);
  }

  getTimeline(id: string): Promise<{ events: TimelineEvent[] }> {
    return this._req('GET', `/v1/requests/${id}/timeline`);
  }

  replay(id: string): Promise<ReplayData> {
    return this._req('POST', `/v1/requests/${id}/replay`);
  }
}

// ─── Namespace: usage ─────────────────────────────────────────────────────────

class UsageNamespace {
  constructor(private _req: Req) {}

  overview(period: Period = '24h'): Promise<UsageOverview> {
    return this._req('GET', '/v1/usage/overview', undefined, { period });
  }

  series(period: Period = '24h'): Promise<{ points: UsageSeriesPoint[] }> {
    return this._req('GET', '/v1/usage/series', undefined, { period });
  }

  breakdown(period: Period = '24h'): Promise<UsageBreakdown> {
    return this._req('GET', '/v1/usage/breakdown', undefined, { period });
  }

  recommendations(period: Period = '24h'): Promise<UsageRecommendations> {
    return this._req('GET', '/v1/usage/recommendations', undefined, { period });
  }
}

// ─── Namespace: models ────────────────────────────────────────────────────────

class ModelsNamespace {
  constructor(private _req: Req) {}

  list(): Promise<{ object: string; data: ModelInfo[] }> {
    return this._req('GET', '/v1/models');
  }
}

// ─── Namespace: chat ──────────────────────────────────────────────────────────

class ChatNamespace {
  constructor(
    private _req: Req,
    private _streamFn: StreamFn,
  ) {}

  complete(options: Omit<ChatCompletionOptions, 'stream'>): Promise<ChatCompletionResponse> {
    return this._req('POST', '/v1/chat/completions', {
      model:       options.model,
      messages:    options.messages,
      temperature: options.temperature,
      max_tokens:  options.maxTokens,
      provider:    options.provider,
      stream:      false,
    });
  }

  stream(options: Omit<ChatCompletionOptions, 'stream'>): AsyncGenerator<string> {
    return this._streamFn('/v1/chat/completions', {
      model:       options.model,
      messages:    options.messages,
      temperature: options.temperature,
      max_tokens:  options.maxTokens,
      provider:    options.provider,
    });
  }
}

// ─── ProjectClient — project-scoped sub-client (Epic F) ──────────────────────

export class ProjectClient {
  readonly connections: ProjectConnectionsNamespace;
  readonly routing:     ProjectRoutingNamespace;
  readonly policy:      ProjectPolicyNamespace;
  readonly budget:      ProjectBudgetNamespace;
  readonly environments: ProjectEnvironmentsNamespace;
  readonly usage:       ProjectUsageNamespace;

  constructor(private readonly projectId: string, private readonly _req: Req) {
    this.connections  = new ProjectConnectionsNamespace(projectId, _req);
    this.routing      = new ProjectRoutingNamespace(projectId, _req);
    this.policy       = new ProjectPolicyNamespace(projectId, _req);
    this.budget       = new ProjectBudgetNamespace(projectId, _req);
    this.environments = new ProjectEnvironmentsNamespace(projectId, _req);
    this.usage        = new ProjectUsageNamespace(projectId, _req);
  }
}

class ProjectConnectionsNamespace {
  constructor(private pid: string, private _req: Req) {}

  list(): Promise<{ providers: ProjectProvider[] }> {
    return this._req('GET', `/v1/projects/${this.pid}/connections`);
  }

  add(body: { providerId: string; enabled?: boolean; allowedModels?: string[] }): Promise<{ success: boolean }> {
    return this._req('POST', `/v1/projects/${this.pid}/connections`, {
      provider_id:    body.providerId,
      enabled:        body.enabled,
      allowed_models: body.allowedModels,
    });
  }

  enable(providerId: string): Promise<{ success: boolean }> {
    return this._req('PATCH', `/v1/projects/${this.pid}/connections/${providerId}/enable`);
  }

  disable(providerId: string): Promise<{ success: boolean }> {
    return this._req('PATCH', `/v1/projects/${this.pid}/connections/${providerId}/disable`);
  }

  remove(providerId: string): Promise<{ deleted: boolean }> {
    return this._req('DELETE', `/v1/projects/${this.pid}/connections/${providerId}`);
  }
}

class ProjectRoutingNamespace {
  constructor(private pid: string, private _req: Req) {}

  getConfig(): Promise<ProjectRoutingConfig> {
    return this._req('GET', `/v1/projects/${this.pid}/routing/config`);
  }

  setConfig(config: Partial<ProjectRoutingConfig>): Promise<{ success: boolean }> {
    return this._req('PUT', `/v1/projects/${this.pid}/routing/config`, config);
  }

  getAliases(): Promise<{ aliases: Record<string, string> }> {
    return this._req('GET', `/v1/projects/${this.pid}/routing/aliases`);
  }

  setAliases(aliases: Record<string, string>): Promise<{ success: boolean }> {
    return this._req('PUT', `/v1/projects/${this.pid}/routing/aliases`, { aliases });
  }

  deleteAlias(alias: string): Promise<{ success: boolean }> {
    return this._req('DELETE', `/v1/projects/${this.pid}/routing/aliases/${encodeURIComponent(alias)}`);
  }
}

class ProjectPolicyNamespace {
  constructor(private pid: string, private _req: Req) {}

  get(): Promise<ProjectPolicy> {
    return this._req('GET', `/v1/projects/${this.pid}/policy`);
  }

  set(policy: Partial<ProjectPolicy>): Promise<{ success: boolean }> {
    return this._req('PUT', `/v1/projects/${this.pid}/policy`, policy);
  }
}

class ProjectBudgetNamespace {
  constructor(private pid: string, private _req: Req) {}

  get(): Promise<ProjectBudget> {
    return this._req('GET', `/v1/projects/${this.pid}/budget`);
  }

  set(budget: { monthlyUsd?: number; alertPct?: number; hardLimit?: boolean }): Promise<{ success: boolean }> {
    return this._req('PUT', `/v1/projects/${this.pid}/budget`, {
      monthly_usd: budget.monthlyUsd,
      alert_pct:   budget.alertPct,
      hard_limit:  budget.hardLimit,
    });
  }
}

class ProjectEnvironmentsNamespace {
  constructor(private pid: string, private _req: Req) {}

  list(): Promise<{ environments: ProjectEnvironment[] }> {
    return this._req('GET', `/v1/projects/${this.pid}/environments`);
  }

  create(env: { name: string; slug?: string; description?: string; isProduction?: boolean }): Promise<{ success: boolean; id: string }> {
    return this._req('POST', `/v1/projects/${this.pid}/environments`, {
      name:          env.name,
      slug:          env.slug,
      description:   env.description,
      is_production: env.isProduction,
    });
  }

  update(id: string, env: { name: string; slug?: string; description?: string; isProduction?: boolean }): Promise<{ success: boolean; id: string }> {
    return this._req('POST', `/v1/projects/${this.pid}/environments`, {
      id,
      name:          env.name,
      slug:          env.slug,
      description:   env.description,
      is_production: env.isProduction,
    });
  }

  delete(envId: string): Promise<{ deleted: boolean }> {
    return this._req('DELETE', `/v1/projects/${this.pid}/environments/${envId}`);
  }
}

class ProjectUsageNamespace {
  constructor(private pid: string, private _req: Req) {}

  overview(periodHours = 24): Promise<UsageOverview> {
    return this._req('GET', `/v1/projects/${this.pid}/usage/overview`, undefined, { period_hours: periodHours });
  }

  series(periodHours = 24, granularity = 'hour'): Promise<{ points: UsageSeriesPoint[] }> {
    return this._req('GET', `/v1/projects/${this.pid}/usage/series`, undefined, { period_hours: periodHours, granularity });
  }

  breakdown(periodHours = 24): Promise<UsageBreakdown> {
    return this._req('GET', `/v1/projects/${this.pid}/usage/breakdown`, undefined, { period_hours: periodHours });
  }
}

// ─── Main client ──────────────────────────────────────────────────────────────

export class AICPClient {
  private readonly baseUrl: string;
  private apiKey: string | undefined;
  private readonly timeout: number;

  readonly auth: AuthNamespace;
  readonly chat: ChatNamespace;
  readonly keys: KeysNamespace;
  readonly members: MembersNamespace;
  readonly models: ModelsNamespace;
  readonly projects: ProjectsNamespace;
  readonly providers: ProvidersNamespace;
  readonly requests: RequestsNamespace;
  readonly routing: RoutingNamespace;
  readonly usage: UsageNamespace;

  constructor(options: AICPClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'http://localhost:3000').replace(/\/$/, '');
    this.apiKey  = options.apiKey;
    this.timeout = options.timeout ?? 30_000;

    const req    = this._req.bind(this) as Req;
    const stream = this._stream.bind(this) as StreamFn;

    this.auth      = new AuthNamespace(req);
    this.chat      = new ChatNamespace(req, stream);
    this.keys      = new KeysNamespace(req);
    this.members   = new MembersNamespace(req);
    this.models    = new ModelsNamespace(req);
    this.projects  = new ProjectsNamespace(req);
    this.providers = new ProvidersNamespace(req);
    this.requests  = new RequestsNamespace(req);
    this.routing   = new RoutingNamespace(req);
    this.usage     = new UsageNamespace(req);
  }

  /** Update the bearer token after login/signup without creating a new client. */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /** Return a project-scoped sub-client for project runtime operations. */
  project(projectId: string): ProjectClient {
    return new ProjectClient(projectId, this._req.bind(this) as Req);
  }

  health(): Promise<{ status: string; version: string }> {
    return this._req('GET', '/health');
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private get _authHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  private async _req<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    let url = `${this.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== '') params.set(k, String(v));
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: this._authHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 204) return undefined as T;

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as Record<string, any>;
        const msg  = errBody?.error?.message ?? `HTTP ${res.status}`;
        const type = errBody?.error?.type    ?? 'api_error';
        const code = errBody?.error?.code    ?? null;
        throw new AICPError(res.status, msg, type, code);
      }

      return res.json() as Promise<T>;
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof AICPError) throw err;
      throw new AICPError(0, (err as Error).message, 'network_error');
    }
  }

  private async *_stream(path: string, body: unknown): AsyncGenerator<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method:  'POST',
        headers: this._authHeaders,
        body:    JSON.stringify({ ...(body as object), stream: true }),
        signal:  controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      throw new AICPError(0, (err as Error).message, 'network_error');
    }

    if (!res.ok || !res.body) {
      clearTimeout(timer);
      const errBody = await res.json().catch(() => ({})) as Record<string, any>;
      throw new AICPError(
        res.status,
        errBody?.error?.message ?? `HTTP ${res.status}`,
        errBody?.error?.type    ?? 'api_error',
      );
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const delta  = parsed?.choices?.[0]?.delta?.content;
            if (delta) yield delta as string;
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } finally {
      clearTimeout(timer);
      reader.releaseLock();
    }
  }
}

// ─── Re-export types consumers need ──────────────────────────────────────────

export type {
  AICPClientOptions,
  AcceptInviteOptions,
  AddProviderOptions,
  ApiKey,
  AuthResponse,
  Candidate,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatMessage,
  CreateKeyOptions,
  CreateKeyResponse,
  CreateProjectOptions,
  ExcludedProvider,
  InviteInfo,
  InviteResponse,
  Invitation,
  ListHistoryParams,
  ListRequestsParams,
  LoginOptions,
  Member,
  ModelInfo,
  Period,
  Project,
  ProviderConfig,
  ProviderTestResult,
  ReplayData,
  Recommendation,
  RequestDetail,
  RequestSummary,
  RoutingAlias,
  RoutingConfig,
  RoutingDecision,
  RoutingDecisionSummary,
  SignupOptions,
  TimelineEvent,
  UpdateProjectOptions,
  UsageBreakdown,
  UsageOverview,
  UsageRecommendations,
  UsageSeriesPoint,
  UserRole,
} from './types';
