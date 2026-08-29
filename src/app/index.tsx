import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ClipScreen, type ClipResult } from '@/components/clip-screen';
import { IntakeForm } from '@/components/intake-form';
import { BATCH_SIZE, nextBatch } from '@/study/batch';
import type { Clip } from '@/study/corpus';
import {
  createParticipant,
  loadParticipant,
  saveParticipant,
  type Intake,
  type StoredParticipant,
} from '@/study/participant';
import * as db from '@/study/supabase';

type Stage = 'loading' | 'notice' | 'intake' | 'batch' | 'done' | 'exhausted';

export default function StudyScreen() {
  const [stage, setStage] = useState<Stage>('loading');
  const [participant, setParticipant] = useState<StoredParticipant | null>(null);
  const [batch, setBatch] = useState<Clip[]>([]);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const stored = loadParticipant();
    if (stored) {
      setParticipant(stored);
      startBatch(stored);
    } else {
      setStage('notice');
    }
  }, []);

  function startBatch(current: StoredParticipant) {
    const clips = nextBatch(current.seenClipIds);
    if (clips.length === 0) {
      setStage('exhausted');
      return;
    }
    setBatch(clips);
    setPosition(0);
    setStage('batch');
  }

  async function beginStudy(intake: Intake) {
    const created = createParticipant(intake);
    setParticipant(created);
    startBatch(created);
    await syncParticipant(created);
  }

  // Returns whether the Participant exists in the database; Transcriptions reference it.
  async function syncParticipant(current: StoredParticipant): Promise<boolean> {
    if (current.synced) return true;
    try {
      await db.saveParticipant({
        id: current.id,
        country: current.intake.country,
        dialect_self_description: current.intake.dialectSelfDescription || null,
        mandarin_exposure: current.intake.mandarinExposure,
        knows_pinyin: current.intake.knowsPinyin,
      });
      const synced = { ...current, synced: true };
      setParticipant(synced);
      saveParticipant(synced);
      return true;
    } catch (error) {
      console.error('Could not save participant', error);
      return false;
    }
  }

  async function recordResult(clip: Clip, result: ClipResult) {
    if (!participant) return;

    const seen: StoredParticipant = {
      ...participant,
      seenClipIds: [...participant.seenClipIds, clip.id],
    };
    const finished = position + 1 >= batch.length;
    const updated = finished ? { ...seen, batchesDone: seen.batchesDone + 1 } : seen;

    setParticipant(updated);
    saveParticipant(updated);
    if (finished) setStage('done');
    else setPosition(position + 1);

    try {
      if (!(await syncParticipant(updated))) return;
      await db.saveTranscription({
        participant_id: participant.id,
        clip_id: clip.id,
        text: result.text,
        skipped: result.skipped,
        replays: result.replays,
        ms_to_submit: result.msToSubmit,
        batch_number: participant.batchesDone + 1,
        position_in_batch: position + 1,
      });
    } catch (error) {
      // A failed write must never trap the Participant on a Clip.
      console.error('Could not save transcription', error);
    }
  }

  if (stage === 'loading') return <View style={styles.screen} />;

  if (stage === 'notice') {
    return (
      <Message
        title="¿Cómo suena el chino en español?"
        body={
          'Vas a escuchar palabras en chino mandarín y escribir lo que oigas, con tus propias letras. ' +
          'No hay respuestas correctas: nos interesa exactamente lo que te suene a ti.\n\n' +
          'Tus respuestas son anónimas y se usarán con fines de investigación.'
        }
        action="Empezar"
        onPress={() => setStage('intake')}
      />
    );
  }

  if (stage === 'intake') return <IntakeForm onSubmit={beginStudy} />;

  if (stage === 'exhausted') {
    return (
      <Message
        title="Ya las has escuchado todas"
        body="No quedan audios nuevos para ti. Muchas gracias por participar."
      />
    );
  }

  if (stage === 'done') {
    return (
      <Message
        title="¡Gracias!"
        body={`Has transcrito ${batch.length} audios. ¿Te animas con ${BATCH_SIZE} más?`}
        action="Seguir"
        onPress={() => participant && startBatch(participant)}
      />
    );
  }

  const clip = batch[position];
  return (
    <ClipScreen
      key={clip.id}
      clip={clip}
      position={position + 1}
      total={batch.length}
      onDone={result => recordResult(clip, result)}
    />
  );
}

function Message({
  title,
  body,
  action,
  onPress,
}: Readonly<{
  title: string;
  body: string;
  action?: string;
  onPress?: () => void;
}>) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {action && onPress && (
        <Pressable style={styles.action} onPress={onPress}>
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: { fontSize: 26, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24 },
  action: {
    marginTop: 16,
    backgroundColor: '#208AEF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionText: { color: 'white', fontSize: 17, fontWeight: '600' },
});
