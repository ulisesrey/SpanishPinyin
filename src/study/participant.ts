export type Exposure = 'none' | 'heard' | 'studied_some' | 'fluent';

export type Intake = {
  country: string;
  dialectSelfDescription: string;
  mandarinExposure: Exposure;
  knowsPinyin: boolean;
};

type StoredParticipant = {
  id: string;
  intake: Intake;
  seenClipIds: string[];
  batchesDone: number;
  // False until the intake reached the database; a Transcription cannot be stored before it does.
  synced: boolean;
};

const KEY = 'spanishpinyin.participant';

// The study is anonymous and has no backend to ask, so the browser is the only place that
// remembers a Participant between visits. Losing it costs a duplicate Participant, nothing more.
function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadParticipant(): StoredParticipant | null {
  const raw = storage()?.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredParticipant;
  } catch {
    return null;
  }
}

export function saveParticipant(participant: StoredParticipant): void {
  storage()?.setItem(KEY, JSON.stringify(participant));
}

export function createParticipant(intake: Intake): StoredParticipant {
  const participant: StoredParticipant = {
    id: globalThis.crypto.randomUUID(),
    intake,
    seenClipIds: [],
    batchesDone: 0,
    synced: false,
  };
  saveParticipant(participant);
  return participant;
}

export type { StoredParticipant };
