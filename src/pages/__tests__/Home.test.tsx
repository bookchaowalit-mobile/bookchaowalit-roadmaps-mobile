// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { setupIonicReact } from '@ionic/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Home from '../Home';

setupIonicReact();

const STORAGE_KEY = 'roadmap:v1';
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

/** Ionic inputs emit `ionInput` custom events rather than React `onChange`. */
function ionInput(el: Element, value: string) {
  act(() => {
    el.dispatchEvent(new CustomEvent('ionInput', { detail: { value }, bubbles: true }));
  });
}

describe('Roadmap Home page', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it('starts from the sample roadmap and persists it', () => {
    render(<Home />);
    expect(screen.getAllByText('MVP').length).toBeGreaterThan(0);
    expect(stored().milestones).toHaveLength(2);
  });

  it('cycles an item status', () => {
    render(<Home />);
    fireEvent.click(screen.getByLabelText('Offline mode: planned. Change status.'));
    expect(screen.getByLabelText('Offline mode: in-progress. Change status.')).toBeTruthy();
    expect(stored().items.find((i: { id: string }) => i.id === 'i3').status).toBe('in-progress');
  });

  it('adds an item to the selected milestone', () => {
    const { container } = render(<Home />);
    const [itemInput] = container.querySelectorAll('ion-input');
    ionInput(itemInput, 'Push notifications');
    fireEvent.click(screen.getByText('Add item'));
    expect(container.textContent).toContain('Push notifications');
    expect(stored().items.at(-1)).toMatchObject({ title: 'Push notifications', milestoneId: 'm1', status: 'planned' });
  });

  it('deletes an item and a milestone with its items', () => {
    render(<Home />);
    fireEvent.click(screen.getByLabelText('Delete Sign-in flow'));
    expect(screen.queryByText('Sign-in flow')).toBeNull();
    fireEvent.click(screen.getByLabelText('Delete milestone Public beta and its items'));
    expect(screen.queryByText('Public beta')).toBeNull();
    expect(screen.queryByText('Offline mode')).toBeNull();
    expect(stored()).toEqual({
      milestones: [{ id: 'm1', title: 'MVP', target: '2026-10-31' }],
      items: [{ id: 'i2', title: 'Roadmap board', milestoneId: 'm1', status: 'in-progress' }],
    });
  });
});
