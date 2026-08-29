import { useAudioPlayer } from 'expo-audio';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { clipUrl, type Clip } from '@/study/corpus';

export type ClipResult = {
  text: string | null;
  skipped: boolean;
  replays: number;
  msToSubmit: number;
};

type ClipScreenProps = Readonly<{
  clip: Clip;
  position: number;
  total: number;
  onDone: (result: ClipResult) => void;
}>;

export function ClipScreen({ clip, position, total, onDone }: ClipScreenProps) {
  const player = useAudioPlayer(clipUrl(clip));
  const [text, setText] = useState('');
  const [plays, setPlays] = useState(0);
  const firstPlayAt = useRef<number | null>(null);

  function play() {
    player.seekTo(0);
    player.play();
    firstPlayAt.current ??= Date.now();
    setPlays(count => count + 1);
  }

  function finish(skipped: boolean) {
    onDone({
      text: skipped ? null : text.trim(),
      skipped,
      replays: Math.max(0, plays - 1),
      msToSubmit: firstPlayAt.current === null ? 0 : Date.now() - firstPlayAt.current,
    });
  }

  const canSubmit = plays > 0 && text.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {position} / {total}
      </Text>

      <Pressable style={styles.play} onPress={play}>
        <Text style={styles.playText}>{plays === 0 ? 'Escuchar' : 'Escuchar otra vez'}</Text>
      </Pressable>

      <Text style={styles.prompt}>Escribe lo que has oído, como te suene.</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        maxLength={200}
        autoCapitalize="none"
        autoCorrect={false}
        // Submitting from the keyboard is the fastest path through a Batch.
        onSubmitEditing={() => canSubmit && finish(false)}
        returnKeyType="send"
        placeholder="…"
      />

      <Pressable
        style={[styles.submit, !canSubmit && styles.disabled]}
        disabled={!canSubmit}
        onPress={() => finish(false)}>
        <Text style={styles.submitText}>Enviar</Text>
      </Pressable>

      <Pressable style={styles.skip} onPress={() => finish(true)}>
        <Text style={styles.skipText}>No sabría escribirlo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16, maxWidth: 480, width: '100%', alignSelf: 'center', flex: 1 },
  progress: { fontSize: 14, opacity: 0.6, textAlign: 'center' },
  play: {
    backgroundColor: '#208AEF',
    borderRadius: 999,
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  playText: { color: 'white', fontSize: 20, fontWeight: '600' },
  prompt: { fontSize: 16, marginTop: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#c7c7cc',
    borderRadius: 8,
    padding: 16,
    fontSize: 20,
    textAlign: 'center',
  },
  submit: { backgroundColor: '#208AEF', borderRadius: 12, padding: 16, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 17, fontWeight: '600' },
  disabled: { opacity: 0.4 },
  skip: { padding: 12, alignItems: 'center' },
  skipText: { fontSize: 15, opacity: 0.7, textDecorationLine: 'underline' },
});
