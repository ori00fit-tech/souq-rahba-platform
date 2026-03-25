export type ApiSuccess<T = unknown> = {
  ok: true;
  data: T;
  meta: unknown | null;
  error: null;
};

export type ApiFailure = {
  ok: false;
  data: null;
  meta: unknown | null;
  error: {
    code: string;
    message: string;
  };
};

export function ok<T = unknown>(data: T, meta: unknown | null = null): ApiSuccess<T> {
  return {
    ok: true,
    data,
    meta,
    error: null,
  };
}

export function fail(code: string, message: string, meta: unknown | null = null): ApiFailure {
  return {
    ok: false,
    data: null,
    meta,
    error: {
      code,
      message,
    },
  };
}
