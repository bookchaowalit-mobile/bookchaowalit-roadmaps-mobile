import { describe, expect, it } from 'vitest';
import {
  type Milestone,
  type RoadmapItem,
  buildRoadmap,
  health,
  isValidDate,
  nextStatus,
  parseRoadmap,
  progress,
  validateMilestone,
} from './roadmap';

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).getTime();
const item = (id: string, milestoneId: string, status: RoadmapItem['status']): RoadmapItem => ({
  id,
  title: id,
  milestoneId,
  status,
});
const m1: Milestone = { id: 'm1', title: 'MVP', target: '2026-03-31' };
const m2: Milestone = { id: 'm2', title: 'Beta', target: '2026-02-15' };

describe('status and progress', () => {
  it('cycles statuses', () => {
    expect(nextStatus('planned')).toBe('in-progress');
    expect(nextStatus('in-progress')).toBe('done');
    expect(nextStatus('done')).toBe('planned');
  });

  it('counts in-progress as half', () => {
    expect(progress([item('a', 'm1', 'done'), item('b', 'm1', 'in-progress'), item('c', 'm1', 'planned'), item('d', 'm1', 'planned')])).toEqual({
      done: 1,
      inProgress: 1,
      total: 4,
      ratio: 0.375,
    });
    expect(progress([]).ratio).toBe(0);
  });
});

describe('health', () => {
  const items = [item('a', 'm1', 'planned'), item('b', 'm1', 'planned')];
  it('is on-track far from target', () => {
    expect(health(m1, items, at(2026, 1, 1))).toBe('on-track');
  });
  it('is at-risk close to target with little progress', () => {
    expect(health(m1, items, at(2026, 3, 25))).toBe('at-risk');
  });
  it('stays on-track on the target day itself, overdue after', () => {
    expect(health(m1, [item('a', 'm1', 'done'), item('b', 'm1', 'in-progress')], at(2026, 3, 31))).toBe('on-track');
    expect(health(m1, items, at(2026, 4, 1))).toBe('overdue');
  });
  it('is complete when all items are done, even if late', () => {
    expect(health(m1, [item('a', 'm1', 'done')], at(2027, 1, 1))).toBe('complete');
  });
});

describe('buildRoadmap', () => {
  it('orders milestones by target and items by status', () => {
    const view = buildRoadmap(
      [m1, m2],
      [item('z', 'm1', 'done'), item('y', 'm1', 'planned'), item('x', 'm1', 'in-progress'), item('b', 'm2', 'done')],
      at(2026, 1, 1),
    );
    expect(view.map((m) => m.id)).toEqual(['m2', 'm1']);
    expect(view[1].items.map((i) => i.id)).toEqual(['x', 'y', 'z']);
    expect(view[0].health).toBe('complete');
  });
});

describe('validation and parsing', () => {
  it('validates real dates', () => {
    expect(isValidDate('2026-02-29')).toBe(false);
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('2026-2-1')).toBe(false);
    expect(validateMilestone('', '2026-01-01')).toMatch(/title/);
    expect(validateMilestone('GA', '2026-13-01')).toMatch(/date/);
    expect(validateMilestone('GA', '2026-12-01')).toBeNull();
  });

  it('parses stored data defensively', () => {
    expect(parseRoadmap(null)).toBeNull();
    expect(parseRoadmap('{')).toBeNull();
    const parsed = parseRoadmap(
      JSON.stringify({ milestones: [m1, { id: 'bad', title: 'x', target: 'soon' }], items: [item('a', 'm1', 'done'), item('b', 'bad', 'done'), { ...item('c', 'm1', 'done'), status: 'blocked' }] }),
    );
    expect(parsed).toEqual({ milestones: [m1], items: [item('a', 'm1', 'done')] });
  });
});
