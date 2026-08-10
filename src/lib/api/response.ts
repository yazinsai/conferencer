export type ApiMeta = {
  next_cursor?: string;
  limit?: number;
};

export type ApiSuccess<T> = {
  data: T;
  meta?: ApiMeta;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export function jsonData<T>(data: T, meta?: ApiMeta, init?: ResponseInit) {
  const body: ApiSuccess<T> = meta ? { data, meta } : { data };
  return Response.json(body, init);
}

export function apiError(
  code: string,
  message: string,
  status = 400,
): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status });
}

export function notFound(message = "Not found") {
  return apiError("NOT_FOUND", message, 404);
}

export function badRequest(message: string) {
  return apiError("BAD_REQUEST", message, 400);
}

export function unauthorized(message = "Unauthorized") {
  return apiError("UNAUTHORIZED", message, 401);
}
