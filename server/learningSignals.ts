import fs from 'fs';
import path from 'path';

const FILE = path.resolve(process.cwd(), 'data', 'learning_signals.json');
const recent = new Map<string, number>();

type Signal = { helpful: number; unhelpful: number; updatedAt: string };
function read(): Record<string, Signal> { try { return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {}; } catch { return {}; } }
function write(data: Record<string, Signal>) { const tmp = `${FILE}.tmp`; fs.writeFileSync(tmp, JSON.stringify(data, null, 2)); fs.renameSync(tmp, FILE); }
export function recordHelpfulFeedback(postId: string, helpful: boolean, fingerprint: string): Signal {
  const key = `${fingerprint}:${postId}`; const now = Date.now(); const last = recent.get(key) || 0;
  if (now - last < 86400000) return read()[postId] || { helpful: 0, unhelpful: 0, updatedAt: new Date(0).toISOString() };
  recent.set(key, now);
  const all = read(); const current = all[postId] || { helpful: 0, unhelpful: 0, updatedAt: '' };
  if (helpful) current.helpful += 1; else current.unhelpful += 1;
  current.updatedAt = new Date().toISOString(); all[postId] = current; write(all); return current;
}
export function getLearningSignals() { return read(); }
