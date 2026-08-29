import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Exposure, Intake } from '@/study/participant';

const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Guinea Ecuatorial',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Puerto Rico',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro',
];

const EXPOSURES: { value: Exposure; label: string }[] = [
  { value: 'none', label: 'Nunca he tenido contacto con el chino' },
  { value: 'heard', label: 'Lo he oído, pero no lo he estudiado' },
  { value: 'studied_some', label: 'He estudiado algo de chino' },
  { value: 'fluent', label: 'Hablo chino con soltura' },
];

export function IntakeForm({ onSubmit }: Readonly<{ onSubmit: (intake: Intake) => void }>) {
  const [country, setCountry] = useState<string | null>(null);
  const [dialect, setDialect] = useState('');
  const [exposure, setExposure] = useState<Exposure | null>(null);
  const [knowsPinyin, setKnowsPinyin] = useState<boolean | null>(null);

  const complete = country !== null && exposure !== null && knowsPinyin !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.question}>¿De qué país eres?</Text>
      <View style={styles.options}>
        {COUNTRIES.map(option => (
          <Choice
            key={option}
            label={option}
            selected={country === option}
            onPress={() => setCountry(option)}
          />
        ))}
      </View>

      <Text style={styles.question}>¿Cómo describirías tu variedad de español?</Text>
      <Text style={styles.hint}>Opcional. Por ejemplo: andaluz, rioplatense, caribeño…</Text>
      <TextInput
        style={styles.input}
        value={dialect}
        onChangeText={setDialect}
        maxLength={200}
        placeholder="Opcional"
      />

      <Text style={styles.question}>¿Cuánto contacto has tenido con el chino mandarín?</Text>
      <View style={styles.options}>
        {EXPOSURES.map(option => (
          <Choice
            key={option.value}
            label={option.label}
            selected={exposure === option.value}
            onPress={() => setExposure(option.value)}
          />
        ))}
      </View>

      <Text style={styles.question}>¿Sabes leer pinyin?</Text>
      <Text style={styles.hint}>El sistema para escribir chino con letras latinas.</Text>
      <View style={styles.options}>
        <Choice label="Sí" selected={knowsPinyin === true} onPress={() => setKnowsPinyin(true)} />
        <Choice label="No" selected={knowsPinyin === false} onPress={() => setKnowsPinyin(false)} />
      </View>

      <Pressable
        style={[styles.submit, !complete && styles.submitDisabled]}
        disabled={!complete}
        onPress={() =>
          onSubmit({
            country: country!,
            dialectSelfDescription: dialect.trim(),
            mandarinExposure: exposure!,
            knowsPinyin: knowsPinyin!,
          })
        }>
        <Text style={styles.submitText}>Empezar</Text>
      </Pressable>
    </ScrollView>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: Readonly<{
  label: string;
  selected: boolean;
  onPress: () => void;
}>) {
  return (
    <Pressable style={[styles.choice, selected && styles.choiceSelected]} onPress={onPress}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8, maxWidth: 640, width: '100%', alignSelf: 'center' },
  question: { fontSize: 18, fontWeight: '600', marginTop: 24 },
  hint: { fontSize: 14, opacity: 0.7 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  choice: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c7c7cc',
  },
  choiceSelected: { backgroundColor: '#208AEF', borderColor: '#208AEF' },
  choiceText: { fontSize: 15 },
  choiceTextSelected: { color: 'white', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#c7c7cc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  submit: {
    marginTop: 32,
    backgroundColor: '#208AEF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: 'white', fontSize: 17, fontWeight: '600' },
});
