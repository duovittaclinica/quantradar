type LogLevel = 'debug' | 'info' | 'warn' | 'error';
function log(level: LogLevel, msg: string, ctx?: string, data?: unknown) {
  if (level === 'debug' && process.env.NODE_ENV === 'production') return;
  const line = `[${new Date().toISOString()}] ${level.toUpperCase().padEnd(5)} ${ctx ? `[${ctx}] ` : ''}${msg}`;
  if (level === 'error') console.error(line, data ?? '');
  else if (level === 'warn') console.warn(line, data ?? '');
  else console.log(line, data ? JSON.stringify(data) : '');
}
export const logger = {
  debug: (msg: string, ctx?: string, data?: unknown) => log('debug', msg, ctx, data),
  info:  (msg: string, ctx?: string, data?: unknown) => log('info',  msg, ctx, data),
  warn:  (msg: string, ctx?: string, data?: unknown) => log('warn',  msg, ctx, data),
  error: (msg: string, ctx?: string, data?: unknown) => log('error', msg, ctx, data),
  child: (ctx: string) => ({
    debug: (msg: string, data?: unknown) => log('debug', msg, ctx, data),
    info:  (msg: string, data?: unknown) => log('info',  msg, ctx, data),
    warn:  (msg: string, data?: unknown) => log('warn',  msg, ctx, data),
    error: (msg: string, data?: unknown) => log('error', msg, ctx, data),
  }),
};
