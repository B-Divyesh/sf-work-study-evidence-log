# Practice Evidence Log demo

Open <https://work-study-evidence-log.sociobot.in/demo> or run the site locally and visit `/demo`.

The demo starts with two realistic practice blocks:

- “Reading retry signals” includes a later work-use note.
- “Comparing query plans” has an open question and no linked use yet.

The banner stays visible in demo mode. **Reset demo** restores both original records. **Start for real** deletes the demo database and returns to the user’s log.

Demo records use the IndexedDB database `demo:practice-evidence-log`. Demo preferences and license state use `demo:` localStorage keys. The regular app uses `practice-evidence-log` and unprefixed product keys. Demo mode never reads or writes the regular database.

Both `/demo` and `/?demo=1` enter the isolated sandbox. The service worker includes the sample application shell, so the demo can be tested offline after its first visit.
