# SpanishPinyin

A study of how Spanish speakers hear and write down Mandarin Chinese words, and how far
those spellings diverge from Pinyin. The app collects the raw data: it plays a Clip and
records what a Participant writes.

## Language

**Clip**:
A single short audio recording of one or two Mandarin words, with a stable identity that
exists before anyone hears it.
_Avoid_: sound, audio, file, sample

**Corpus**:
The fixed set of Clips used in the study. It is curated and loaded ahead of time, never
added to from inside the app.
_Avoid_: dataset, library

**Pinyin**:
The canonical romanisation of a Clip, known ahead of time. It is the reference the study
measures divergence against, and is never shown to a Participant.
_Avoid_: answer, ground truth, correct spelling

**Participant**:
Someone who follows the public link and transcribes Clips. They are anonymous, unknown to
the study beforehand, and recognised across visits only by an identifier their own browser
keeps.
_Avoid_: user, collaborator, annotator, volunteer

**Exposure**:
How much contact a Participant has had with Mandarin or Pinyin before taking part. It is
the variable most likely to invalidate their Transcriptions, so it is collected up front.
_Avoid_: level, experience, skill

**Dialect**:
The variety of Spanish a Participant speaks, held as two things at once: the country they
answer with, which is coarse but groupable, and how they describe their own speech, which
is rich but not.
_Avoid_: accent, region, variant

**Transcription**:
The free text one Participant wrote after hearing one Clip. It is a record of what was
heard, not an attempt at a right answer, so it is never scored or corrected.
_Avoid_: answer, guess, attempt, annotation

**Skip**:
A recorded decision that a Participant could not write down a Clip. It is data about the
Clip, not an absence of data.
_Avoid_: pass, no answer, blank

**Batch**:
A fixed-length run of Clips offered to a Participant in one go. Finishing one is the
natural stopping point, after which another may be offered.
_Avoid_: session, sitting, round, quiz

**Replay**:
One repeat listen of a Clip before the Participant commits. The number of Replays is part
of the Transcription, because a first impression and a considered answer are different data.
_Avoid_: retry, repeat
