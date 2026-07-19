// ─── Shared ───────────────────────────────────────────────────────────────────

export type Period = '24h' | '7d' | '30d' | '90d';
export type UserRole = 'owner' | 'project_manager' | 'developer';
export type Provider = 'openai' | 'anthropic' | 'gemini' | 'mistral';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface SignupOptions {
  orgName: string;
  email: string;
  password: string;
  userName?: string;
}

export interface LoginOptions {
  email: string;
  password: string;
}

export interface AcceptInviteOptions {
  token: string;
  name: string;
  password: string;
}

export interface Org {
  id: string;
  name: string;
  plan: string;
  email: string;
  active: boolean;
  createdAt: number;
}

export interface User {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: number;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface AuthResponse {
  org: Org;
  user: User;
  token: string;
  project?: Project;
}

export interface InviteInfo {
  orgId: string;
  orgName: string;
  email: string;
  role: UserRole;
  expiresAt: number;
}

// ─── Members & Invitations ───────────────────────────────────────────────────

export type Member = User;

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: number;
  createdAt: number;
}

export interface InviteResponse {
  invitationId: string;
  token: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface CreateProjectOptions {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateProjectOptions {
  name?: string;
  description?: string;
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  orgId: string;
  projectId?: string;
  projectName?: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  revoked: boolean;
  expiresAt: number;
  lastUsed: number;
  createdAt: number;
}

export interface CreateKeyOptions {
  name: string;
  projectId?: string;
  scopes?: string[];
  expiresAt?: number;
}

export interface CreateKeyResponse {
  keyId: string;
  keyValue: string;
}

// ─── Providers ────────────────────────────────────────────────────────────────

export interface ProviderConfig {
  id: string;
  orgId: string;
  provider: Provider | string;
  enabled: boolean;
  enabledModels: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AddProviderOptions {
  provider: Provider | string;
  apiKey: string;
  enabledModels?: string[];
}

export interface ProviderTestResult {
  healthy: boolean;
  latencyMs: number;
  error: string;
}

// ─── Routing ──────────────────────────────────────────────────────────────────

export interface RoutingWeights {
  cost: number;
  latency: number;
  quality: number;
}

export type RoutingStrategy = 'balanced' | 'cheapest' | 'fastest' | 'highest_quality' | 'manual';

/**
 * Org-level governance policy. Not enforced at the project level — project
 * routing config (`ProjectRoutingConfig`) has no `policy` field on the backend.
 */
export interface RoutingPolicy {
  preferredProviders?: string[];
  blockedProviders?: string[];
  maxCostPerRequest?: number;
  maxLatencyMs?: number;
  allowOpenSource?: boolean;
  allowProprietary?: boolean;
  allowSelfHosted?: boolean;
  allowManaged?: boolean;
  fallbackBehavior?: 'fail' | 'allow_commercial' | 'allow_global' | 'allow_cheapest';
}

export interface RoutingConfig {
  mode: 'auto' | 'manual';
  strategy: RoutingStrategy;
  manualProvider?: string;
  manualModel?: string;
  providerOrder: string[];
  providerAffinity: Record<string, unknown>;
  modelAliases: Record<string, string>;
  allowedRegions: string[];
  weights: RoutingWeights;
  params: Record<string, unknown>;
  policy: RoutingPolicy;
}

export interface RoutingAlias {
  alias: string;
  model: string;
}

export interface RoutingDecisionSummary {
  id: string;
  timestamp: string;
  project: string;
  strategy: string;
  selectedProvider: string;
  selectedModel: string;
  costUsd: number;
  latencyMs: number;
  status: string;
  requestId: string;
}

export interface Candidate {
  provider: string;
  model: string;
  costUsd: number;
  latencyMs: number;
  score: number;
  winner: boolean;
}

export interface ExcludedProvider {
  provider: string;
  reason: string;
}

export interface RoutingDecision extends RoutingDecisionSummary {
  reasons: string[];
  candidates: Candidate[];
  excluded: ExcludedProvider[];
  constraints: string[];
  requestMessages: ChatMessage[] | null;
  responseContent: string | null;
}

export interface ListHistoryParams {
  limit?: number;
  offset?: number;
  provider?: string;
  strategy?: string;
  status?: string;
}

// ─── Requests (Explorer) ──────────────────────────────────────────────────────

export interface RequestSummary {
  id: string;
  requestId: string;
  traceId: string;
  timestamp: string;
  project: string;
  strategy: string;
  selectedProvider: string;
  selectedModel: string;
  costUsd: number;
  latencyMs: number;
  routingDurationMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  status: string;
}

export interface RequestDetail extends RequestSummary {
  score: number;
  confidence: number;
  reasons: string[];
  candidates: Candidate[];
  excluded: ExcludedProvider[];
  constraints: string[];
  requestMessages: ChatMessage[] | null;
  responseContent: string | null;
}

export interface TimelineEvent {
  phase: string;
  label: string;
  startMs: number;
  durationMs: number;
}

export interface ListRequestsParams {
  limit?: number;
  offset?: number;
  search?: string;
  provider?: string;
  strategy?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReplayData {
  messages: ChatMessage[];
  model: string;
  strategy: string;
  provider: string;
}

// ─── Usage ────────────────────────────────────────────────────────────────────

export interface UsageOverview {
  totalRequests: number;
  totalSpend: number;
  baselineSpend: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  successRate: number;
  avgRoutingMs: number;
  efficiencyScore: number;
}

export interface UsageSeriesPoint {
  bucket: string;
  requests: number;
  spend: number;
  tokens: number;
  avgLatency: number;
}

export interface ProviderBreakdown {
  provider: string;
  requests: number;
  spend: number;
  avgLatency: number;
  successRate: number;
}

export interface ModelBreakdown {
  model: string;
  provider: string;
  requests: number;
  spend: number;
  avgLatency: number;
  tokens: number;
}

export interface StrategyBreakdown {
  strategy: string;
  requests: number;
  spend: number;
  avgLatency: number;
}

export interface UsageBreakdown {
  providers: ProviderBreakdown[];
  models: ModelBreakdown[];
  strategies: StrategyBreakdown[];
}

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  action: string;
  impactType: 'cost' | 'latency' | 'reliability';
  estimatedSavings: number;
}

export interface UsageRecommendations {
  efficiencyScore: number;
  recommendations: Recommendation[];
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  provider?: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  ownedBy: string;
}

// ─── Project runtime (Epic F) ─────────────────────────────────────────────────

export interface ProjectRoutingConfig {
  projectId:        string;
  orgId:            string;
  mode:             string;
  strategy:         string;
  manualProvider:   string;
  manualModel:      string;
  providerOrder:    string[];
  providerAffinity: Record<string, number>;
  modelAliases:     Record<string, string>;
  allowedRegions:   string[];
  weightsJson:      string;
  params:           Record<string, string>;
}

export interface ProjectProvider {
  projectId:     string;
  orgId:         string;
  providerId:    string;
  enabled:       boolean;
  allowedModels: string[];
}

export interface ProjectPolicy {
  projectId:        string;
  orgId:            string;
  allowedModels:    string[];
  blockedModels:    string[];
  allowedProviders: string[];
  blockedProviders: string[];
  allowedRegions:   string[];
  maxTokens:        number;
}

export interface ProjectBudget {
  projectId:    string;
  orgId:        string;
  monthlyUsd:   number;
  alertPct:     number;
  hardLimit:    boolean;
  currentSpend: number;
}

export interface ProjectEnvironment {
  id:           string;
  projectId:    string;
  orgId:        string;
  name:         string;
  slug:         string;
  description:  string;
  isProduction: boolean;
  createdAt:    string;
}

// ─── Client options ───────────────────────────────────────────────────────────

export interface AICPClientOptions {
  /** Bearer token — either a JWT session token or an `aicp-…` API key. */
  apiKey?: string;
  /** Defaults to `http://localhost:3000`. */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30 000. */
  timeout?: number;
}
