const CHECKPOINT_PREFIX = 'PanelFlow_checkpoint_';

export async function saveCheckpoint(
  stepId: string,
  data: unknown
): Promise<void> {
  const key = `${CHECKPOINT_PREFIX}${stepId}`;
  const state = { stepId, completed: true, data, timestamp: Date.now() };
  localStorage.setItem(key, JSON.stringify(state));
}

export async function loadCheckpoint(
  stepId: string
): Promise<{ stepId: string; completed: boolean; data: unknown; timestamp: number } | null> {
  const key = `${CHECKPOINT_PREFIX}${stepId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearCheckpoint(stepId: string): Promise<void> {
  const key = `${CHECKPOINT_PREFIX}${stepId}`;
  localStorage.removeItem(key);
}

export async function clearAllCheckpoints(): Promise<void> {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(CHECKPOINT_PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
}
