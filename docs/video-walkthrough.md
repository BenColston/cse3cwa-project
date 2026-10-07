# Assignment 3 Video Walkthrough

Benjamin Colston, student 22557298. Aim for approximately 7 minutes 30 seconds;
the brief allows 3-8 minutes. Keep face visible and provide narration throughout.
This script describes implemented behaviour, not guaranteed marks. Complete the
approval and merge of the `Polish` stage before the final recording.

## Preparation

1. Commit, review, and merge the approved work before filming. Demonstrate the
   same version that will be packaged and submitted.
2. Start Docker Desktop. In PowerShell at the repository root run
   `docker compose up --build -d`. Open `http://localhost:3000/dashboard`.
3. Confirm API health and the recorded report load. Keep your existing teacher
   records. If a sample batch already exists, review it before removal; do not
   delete teacher data just to create a clean demonstration.
4. Open the GitHub repository homepage and commits, the Prisma schema, and the
   JMeter/Lighthouse evidence ahead of time. Keep unrelated tabs and secrets out
   of the recording.
5. Prepare a terminal in `frontend` for `npm run test:e2e`. These commands run in
   PowerShell, not the browser console. Install dependencies and Chromium before
   recording, not during the walkthrough.
6. Rehearse both stored-data builders. Use the existing simulated configurations
   for quick cleanup; saving a new teacher configuration against the sample list
   deliberately blocks batch removal until that dependency is handled.
7. Keep the student ID ready. Review the seven-source APA draft in `references.md`
   and the official LMS AI acknowledgement requirements.

## 0:00-0:25 Identity

**Show:** Your face and student ID clearly.

**Say:** "I'm Benjamin Colston, student number 22557298. This is my Assessment 3
phoneme activity builder. I will demonstrate stored-data activities, dashboard
reporting, operational monitoring, and the testing evidence."

## 0:25-0:55 Architecture and Health

**Show:** Running application, then briefly the Prisma schema and health endpoint.
To show the HTTP status explicitly, run this in PowerShell:

```powershell
(Invoke-WebRequest http://localhost:4080/health -UseBasicParsing).StatusCode
```

**Say:** "The three-tier architecture is the React and Next.js presentation
layer, the backend application layer exposed through APIs, and the PostgreSQL
data layer accessed through Prisma. The database stores phoneme arrays, activity
settings, generated outputs, and usage events. The health endpoint returns 200;
it checks API liveness, while the metrics endpoint also retrieves database data."

## 0:55-2:05 Dashboard and Simulated Records

**Do:** Show the recorded dashboard. Scroll to **Create sample records** and click
it. Show the simulated view and warning, reload, then select **Simulated
demonstration** again. Briefly switch to **Recorded usage** to show separation.

**Say:** "The dashboard reports saved lists and configurations, builder visits,
page-time samples, successful and failed generation events, and stored outputs.
Configuration totals are current records, not lifetime creations. Recorded usage
includes normal testing and audit visits.

"The sample dataset is persisted in PostgreSQL and survives a reload. It includes
one word list, both activity types, hints, settings, and sample usage events.
Its five successes, one failure, and 30-second average are simulated, not real
classroom results. The failure warning is labelled, and these events are excluded
from the recorded report."

## 2:05-3:45 Stored Data and Playable Outputs

**Do:** In Wordle, load **[Simulated] Wordle classroom activity**. Show the saved
source, select **Generate HTML**, then **Store generated HTML**. In Saved Data,
download the stored Wordle output and open it. Enter `θ`, `ɪ`, `n` and check the
phonemes. Generate and store a fresh file so it includes the compact board and
side-by-side desktop keyboard; older stored downloads retain their original HTML.

Then load **[Simulated] Word Search classroom activity** in Word Search, store
its generated HTML, and download it from Saved Data. Open it and demonstrate
finding one sequence with drag or keyboard selection. Rehearse the selected
sequence first; **Show answers** can help locate it when preparing.

**Say:** "These builders load saved database configurations and phoneme content
rather than relying only on the local example. The generated HTML is stored
against the activity, retrieved through Saved Data, and works as a standalone
file. Multi-character phonemes remain individual units. Wordle checks guesses,
and Word Search supports keyboard and exact-instance drag selection."

## 3:45-4:10 Scoped Cleanup

**Do:** Return to Dashboard, remove sample records, and confirm. Show the recorded
view with the original teacher content still available.

**Say:** "Simulation ownership is stored in the database. Cleanup removes only
that batch and its associated outputs, not similarly named teacher records. It
refuses removal when a teacher configuration depends on the sample list."

## 4:10-4:55 Playwright

**Do:** In PowerShell inside `frontend`, run `npm run test:e2e` and show the result.
If running a later version, state its actual count and outcome rather than
reading an outdated number from this script.

**Say:** "The current review passed 22 end-to-end tests. They cover CRUD,
dashboard states, source isolation, concurrent sample creation, protected
cleanup, and both persisted playable downloads. They also check keyboard
navigation, compact Wordle layouts across different screen sizes, and that drag
selection marks the exact word instance selected."

## 4:55-5:45 JMeter

**Show:** `testing/jmeter/evidence/staged-results.md`, the comparison CSV, and a
saved JMeter HTML dashboard. Show the final smoke summary if useful. Do not run
the long high-load stages during the recording.

**Say:** "JMeter tests the HTTP and database workflow for both activity types.
The pre-polish one-user smoke check passed all 22 requests. Earlier staged tests
used 10, 100, 1,000, and 10,000 configured users. The first three passed; the
largest stage had a 1.88 percent timeout rate and peak active threads of 389.
That is not evidence of 10,000 simultaneous users or proven production capacity.
JMeter checks stored HTML responses; Playwright checks actual gameplay."

## 5:45-6:35 Lighthouse and Accessibility

**Show:** Original baseline reports and the latest retained summary/reports in
`testing/lighthouse/evidence`. Briefly show keyboard focus or a mobile layout.

**Say:** "Lighthouse identified missing accessible labels and invalid ARIA usage.
The original Wordle audit scored 90 and the generated Word Search audit scored
93. Labelling and semantic fixes improved those results. The latest retained
run has 18 accessibility checks scoring 100. Keyboard selection, visible focus,
and mobile layout were also tested. A score of 100 does not guarantee WCAG
compliance, and screen-reader checks remain a manual follow-up."

## 6:35-7:15 GitHub and Code Quality

**Show:** `https://github.com/BenColston/CSE3CWA-Project`, then its commit history.
From the repository's Code page, use the commits/history link above the file
list; its displayed count may change. Show meaningful stages and one relevant
diff, not only the number of commits.

**Say:** "The repository shows development in separate branches with reviewed
steps for the backend, testing, accessibility, dashboard, and simulations. The
code separates frontend components, API routes, validation, database models,
and game logic. Documentation explains setup, evidence, and limitations."

## 7:15-7:30 Conclusion

**Say:** "This completes the database-backed activity and reporting workflow.
The submission includes the project code and repository link, this walkthrough,
reviewed references, and the required AI acknowledgement."

Only state that those items are included after you have actually prepared them.
Check the finished video's duration, audio, face/ID visibility, and readable
screen content before uploading. Use the LMS submission instructions to resolve
the brief's conflicting video-only and similarity-score wording.
