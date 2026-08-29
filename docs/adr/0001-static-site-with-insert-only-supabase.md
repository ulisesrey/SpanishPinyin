# Static site writing directly to Supabase, insert-only

The app is a static Expo web export served from GitHub Pages, so there is no server of ours
between a Participant's browser and the database. The browser therefore talks to Supabase
directly with the public anon key, and the row-level security policy grants **insert and
nothing else**: any key shipped in a public JS bundle is readable by anyone, so the only
safe permission is one that is harmless in a stranger's hands.

## Consequences

- **No results screen, ever.** Showing "what others wrote" would require read access, which
  breaks the model. This suits the study anyway: revealing other Transcriptions would
  contaminate later Participants, the same reason we never reveal the Pinyin.
- **No trustworthy server-side validation.** Anything the client checks can be bypassed by
  posting straight to the API. Assume the table can contain junk rows and filter at analysis
  time; never treat stored text as clean.
- **Clip selection cannot depend on what others have done.** Serving the least-transcribed
  Clip first would need a read, so Clips are drawn at random from the ones this Participant
  has not seen. Coverage evens out on its own across enough Participants.
- **The Corpus lives in the repo, not the database.** Clips and their Pinyin are static files
  plus a manifest, so no read path is needed to start a Batch.
- **Analysis happens offline**, by the researcher, using the service key outside the app.

Reversing this means introducing a backend and re-hosting somewhere other than GitHub Pages.
That is a real cost, and it is the price paid for having no infrastructure to maintain.
