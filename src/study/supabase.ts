import { createClient } from '@supabase/supabase-js';

import type { Exposure } from './participant';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Both values ship in the public bundle by design; safety comes from the insert-only
// policies in docs/supabase-schema.sql, not from hiding the key.
const client = url && anonKey ? createClient(url, anonKey) : null;

export const isConfigured = client !== null;

export type ParticipantRow = {
  id: string;
  country: string;
  dialect_self_description: string | null;
  mandarin_exposure: Exposure;
  knows_pinyin: boolean;
};

export type TranscriptionRow = {
  participant_id: string;
  clip_id: string;
  text: string | null;
  skipped: boolean;
  replays: number;
  ms_to_submit: number;
  batch_number: number;
  position_in_batch: number;
};

export async function saveParticipant(row: ParticipantRow): Promise<void> {
  if (!client) return;
  const { error } = await client.from('participants').insert(row);
  // Upsert would need an update policy even when it never updates, so a duplicate key is
  // treated as success instead: the row is already there, which is all the caller wants.
  if (error && error.code !== '23505') throw error;
}

export async function saveTranscription(row: TranscriptionRow): Promise<void> {
  if (!client) return;
  const { error } = await client.from('transcriptions').insert(row);
  if (error) throw error;
}
