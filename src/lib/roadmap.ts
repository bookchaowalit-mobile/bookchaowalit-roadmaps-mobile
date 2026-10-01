/**
 * Pure roadmap logic (no Ionic/DOM imports) so it can be unit-tested.
 */

export type Status = 'planned' | 'in-progress' | 'done';

export interface Milestone {
  id: string;
  title: string;
  /** Target date, `YYYY-MM-DD`. */
  target: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  milestoneId: string;
  status: Status;
}

export interface Progress {
  done: number;
  inProgress: number;
  total: number;
  /** 0..1, counting in-progress items as half done. */
  ratio: number;
}

export type Health = 'complete' | 'on-track' | 'at-risk' | 'overdue';

export interface MilestoneView extends Milestone {
  items: RoadmapItem[];
  progress: Progress;
  health: Health;
}

export const STATUSES: readonly Status[] = ['planned', 'in-progress', 'done'];

export const nextStatus = (s: Status): Status => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];

export function progress(items: RoadmapItem[]): Progress {
  const done = items.filter((i) => i.status === 'done').length;
  const inProgress = items.filter((i) => i.status === 'in-progress').length;
  const total = items.length;
  return { done, inProgress, total, ratio: total ? (done + inProgress * 0.5) / total : 0 };
}

const DAY = 86_400_000;
/** Local midnight at the start of the day after `ymd` (DST-safe: not `+ 24h`). */
const endOfDay = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d + 1).getTime();
};

/** Zero-width characters that `trim()` keeps but nobody can see. */
const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF]/g;

/** True when a title has nothing visible in it (whitespace or zero-width only). */
export const isBlank = (title: string): boolean => !title.replace(INVISIBLE, '').trim();

/**
 * complete: every item done. overdue: target passed with work left.
 * at-risk: within 14 days of the target and under 50% progress.
 */
export function health(milestone: Milestone, items: RoadmapItem[], now: number): Health {
  const p = progress(items);
  if (p.total > 0 && p.done === p.total) return 'complete';
  const target = endOfDay(milestone.target);
  if (now >= target) return 'overdue';
  if (target - now <= 14 * DAY && p.ratio < 0.5) return 'at-risk';
  return 'on-track';
}

/** Milestones sorted by target date, each with its items (planned last) and stats. */
export function buildRoadmap(milestones: Milestone[], items: RoadmapItem[], now: number): MilestoneView[] {
  const order: Record<Status, number> = { 'in-progress': 0, planned: 1, done: 2 };
  return [...milestones]
    .sort((a, b) => a.target.localeCompare(b.target))
    .map((m) => {
      const own = items
        .filter((i) => i.milestoneId === m.id)
        .sort((a, b) => order[a.status] - order[b.status] || a.title.localeCompare(b.title));
      return { ...m, items: own, progress: progress(own), health: health(m, own, now) };
    });
}

export function isValidDate(ymd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function validateMilestone(title: string, target: string): string | null {
  if (isBlank(title)) return 'Milestone title is required.';
  if (!isValidDate(target)) return 'Target must be a real date (YYYY-MM-DD).';
  return null;
}

export interface RoadmapData {
  milestones: Milestone[];
  items: RoadmapItem[];
}

/** Parses stored JSON defensively; items pointing at unknown milestones are dropped. */
export function parseRoadmap(json: string | null): RoadmapData | null {
  if (!json) return null;
  try {
    const data = JSON.parse(json) as Partial<RoadmapData>;
    if (!Array.isArray(data.milestones) || !Array.isArray(data.items)) return null;
    const milestones = data.milestones.filter(
      (m): m is Milestone =>
        typeof m?.id === 'string' && typeof m.title === 'string' && typeof m.target === 'string' && isValidDate(m.target),
    );
    const ids = new Set(milestones.map((m) => m.id));
    const items = data.items.filter(
      (i): i is RoadmapItem =>
        typeof i?.id === 'string' && typeof i.title === 'string' && ids.has(i.milestoneId) && STATUSES.includes(i.status),
    );
    return { milestones, items };
  } catch {
    return null;
  }
}

/** Removes one item. */
export function removeItem(data: RoadmapData, id: string): RoadmapData {
  return { ...data, items: data.items.filter((i) => i.id !== id) };
}

/** Removes a milestone together with the items planned under it. */
export function removeMilestone(data: RoadmapData, id: string): RoadmapData {
  return {
    milestones: data.milestones.filter((m) => m.id !== id),
    items: data.items.filter((i) => i.milestoneId !== id),
  };
}
