import { describe, expect, it } from 'vitest';
import { type RoadmapData, removeItem, removeMilestone } from './roadmap';

const data: RoadmapData = {
  milestones: [
    { id: 'm1', title: 'MVP', target: '2026-10-31' },
    { id: 'm2', title: 'Beta', target: '2026-12-15' },
  ],
  items: [
    { id: 'i1', title: 'Sign-in', milestoneId: 'm1', status: 'done' },
    { id: 'i2', title: 'Offline', milestoneId: 'm2', status: 'planned' },
  ],
};

describe('removing roadmap entries', () => {
  it('removeItem drops only that item', () => {
    expect(removeItem(data, 'i1').items.map((i) => i.id)).toEqual(['i2']);
    expect(removeItem(data, 'i1').milestones).toHaveLength(2);
  });

  it('removeMilestone also drops its items', () => {
    const next = removeMilestone(data, 'm2');
    expect(next.milestones.map((m) => m.id)).toEqual(['m1']);
    expect(next.items.map((i) => i.id)).toEqual(['i1']);
  });
});
