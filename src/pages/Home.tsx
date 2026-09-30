import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  type Health,
  type RoadmapData,
  type Status,
  buildRoadmap,
  nextStatus,
  parseRoadmap,
  validateMilestone,
} from '../lib/roadmap';

const STORAGE_KEY = 'roadmap:v1';
const SAMPLE: RoadmapData = {
  milestones: [
    { id: 'm1', title: 'MVP', target: '2026-10-31' },
    { id: 'm2', title: 'Public beta', target: '2026-12-15' },
  ],
  items: [
    { id: 'i1', title: 'Sign-in flow', milestoneId: 'm1', status: 'done' },
    { id: 'i2', title: 'Roadmap board', milestoneId: 'm1', status: 'in-progress' },
    { id: 'i3', title: 'Offline mode', milestoneId: 'm2', status: 'planned' },
  ],
};

function load(): RoadmapData {
  try {
    return parseRoadmap(localStorage.getItem(STORAGE_KEY)) ?? SAMPLE;
  } catch {
    return SAMPLE;
  }
}

const STATUS_COLOR: Record<Status, string> = { planned: 'medium', 'in-progress': 'warning', done: 'success' };
const HEALTH_COLOR: Record<Health, string> = { complete: 'success', 'on-track': 'primary', 'at-risk': 'warning', overdue: 'danger' };

const Home: React.FC = () => {
  const [data, setData] = useState<RoadmapData>(load);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [target, setTarget] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemMilestone, setItemMilestone] = useState<string>(data.milestones[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable; keep working in memory.
    }
  }, [data]);

  const roadmap = useMemo(() => buildRoadmap(data.milestones, data.items, Date.now()), [data]);

  const addMilestone = () => {
    const problem = validateMilestone(milestoneTitle, target);
    setError(problem);
    if (problem) return;
    const id = `m${Date.now()}`;
    setData((d) => ({ ...d, milestones: [...d.milestones, { id, title: milestoneTitle.trim(), target }] }));
    setItemMilestone((current) => current || id);
    setMilestoneTitle('');
    setTarget('');
  };

  const addItem = () => {
    if (!itemTitle.trim() || !itemMilestone) {
      setError('Item needs a title and a milestone.');
      return;
    }
    setError(null);
    setData((d) => ({
      ...d,
      items: [...d.items, { id: `i${Date.now()}`, title: itemTitle.trim(), milestoneId: itemMilestone, status: 'planned' }],
    }));
    setItemTitle('');
  };

  const cycle = (id: string) =>
    setData((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, status: nextStatus(i.status) } : i)) }));

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Roadmap</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {roadmap.map((m) => (
          <IonCard key={m.id}>
            <IonCardHeader>
              <IonCardTitle>{m.title}</IonCardTitle>
              <IonCardSubtitle>
                Target {m.target} · {m.progress.done}/{m.progress.total} done ·{' '}
                <IonText color={HEALTH_COLOR[m.health]}>{m.health}</IonText>
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonProgressBar aria-label={`${m.title} progress`} color={HEALTH_COLOR[m.health]} value={m.progress.ratio} />
              <IonList lines="none">
                {m.items.length === 0 && <p>No items yet.</p>}
                {m.items.map((i) => (
                  <IonItem key={i.id}>
                    <IonLabel className="ion-text-wrap">{i.title}</IonLabel>
                    <IonChip
                      aria-label={`${i.title}: ${i.status}. Tap to change status.`}
                      color={STATUS_COLOR[i.status]}
                      onClick={() => cycle(i.id)}
                      role="button"
                      slot="end"
                    >
                      {i.status}
                    </IonChip>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        ))}

        {error && (
          <IonText color="danger" role="alert">
            <p>{error}</p>
          </IonText>
        )}

        <IonList inset>
          <IonItem>
            <IonInput label="New item" labelPlacement="stacked" onIonInput={(e) => setItemTitle(String(e.detail.value ?? ''))} value={itemTitle} />
          </IonItem>
          <IonItem>
            <IonSelect label="Milestone" onIonChange={(e) => setItemMilestone(e.detail.value)} value={itemMilestone}>
              {data.milestones.map((m) => (
                <IonSelectOption key={m.id} value={m.id}>
                  {m.title}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>
        <IonButton expand="block" onClick={addItem}>
          Add item
        </IonButton>

        <IonList inset>
          <IonItem>
            <IonInput label="New milestone" labelPlacement="stacked" onIonInput={(e) => setMilestoneTitle(String(e.detail.value ?? ''))} value={milestoneTitle} />
          </IonItem>
          <IonItem>
            <IonInput label="Target date" labelPlacement="stacked" onIonInput={(e) => setTarget(String(e.detail.value ?? ''))} type="date" value={target} />
          </IonItem>
        </IonList>
        <IonButton expand="block" fill="outline" onClick={addMilestone}>
          Add milestone
        </IonButton>
      </IonContent>
    </IonPage>
  );
};
export default Home;
