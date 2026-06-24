import { LogLevel } from 'typeorm';

export function resolveDbLogging(raw?: string): boolean | LogLevel[] {
  if (!raw || raw === 'false') return false;
  if (raw === 'true') return ['query', 'error', 'warn'];
  return raw.split(',').map((level) => level.trim()) as LogLevel[];
}
