import type { NextApiResponse } from 'next';
import { ApiSuccess, ApiError } from '../types';
export function ok<T>(res: NextApiResponse, data: T, meta?: ApiSuccess<T>['meta']): void {
  res.status(200).json({ success: true, data, ...(meta ? { meta } : {}) } satisfies ApiSuccess<T>);
}
export function created<T>(res: NextApiResponse, data: T): void {
  res.status(201).json({ success: true, data } satisfies ApiSuccess<T>);
}
export function badRequest(res: NextApiResponse, message: string, details?: unknown): void {
  res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message, details } } satisfies ApiError);
}
export function unauthorized(res: NextApiResponse, message = 'Não autorizado'): void {
  res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message } } satisfies ApiError);
}
export function forbidden(res: NextApiResponse, message = 'Acesso negado'): void {
  res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message } } satisfies ApiError);
}
export function notFound(res: NextApiResponse, resource = 'Recurso'): void {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `${resource} não encontrado` } } satisfies ApiError);
}
export function serverError(res: NextApiResponse, err: unknown): void {
  const message = err instanceof Error ? err.message : 'Erro interno do servidor';
  console.error('[API Error]', err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } } satisfies ApiError);
}
export function methodNotAllowed(res: NextApiResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Método não permitido. Use: ${allowed.join(', ')}` } } satisfies ApiError);
}
