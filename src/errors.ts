export class AICPError extends Error {
  readonly status: number;
  readonly errorType: string;
  readonly code: string | null;

  constructor(
    status: number,
    message: string,
    errorType = 'api_error',
    code: string | null = null,
  ) {
    super(message);
    this.name = 'AICPError';
    this.status = status;
    this.errorType = errorType;
    this.code = code;
  }
}
