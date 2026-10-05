# JMeter Load Testing

This plan measures the builder's HTTP and database workflow. Each virtual user
loads a builder page, creates, reads and updates a five-word phoneme list, creates
an activity configuration, stores a real generated HTML fixture, retrieves and
checks that HTML, then deletes its activity and word list. Every HTTP response is
checked for the expected status and key content. Successful setup steps are not
included in the timing results.

Wordle and Word Search alternate between users and iterations. The default two
iterations let a one-user smoke test cover both types. The stored HTML fixtures
come from the actual builders and use the same five words as the test payload.
JMeter does not execute the HTML's JavaScript or recreate browser interactions;
the Playwright tests verify generation, download and gameplay. The builder page
request measures the HTML response, not the browser's asset loading/rendering.

## Setup

1. Use Java 17 (for example [Temurin 17](https://adoptium.net/temurin/releases/?version=17)) and download the binary ZIP from the
   [official JMeter download page](https://jmeter.apache.org/download_jmeter.cgi).
   Extract it and locate `bin/jmeter.bat`. The runner also recognises a local
   copy at `.tools/apache-jmeter-5.6.3/bin/jmeter.bat`.
   Java 25 is incompatible with this JMeter release's bundled Groovy compiler.
   Pass `-JavaHome` with the Java 17 installation directory if needed. The runner
   also detects a Java 17 ZIP extracted under `.tools/java17` and temporarily
   selects it for JMeter without changing the system Java installation.
2. Start Docker Desktop and run `docker compose up --build -d` from the project
   root. Use a development/test database, as the workflow creates test records.
3. If necessary, run `npm install` and `npm run test:e2e:install` from `frontend`.
4. Export the actual generated files from the project root:

   ```powershell
   node testing/jmeter/export-fixtures.mjs
   ```

The fixture exporter opens each generated HTML file to check its heading. It
also triggers normal application usage events; account for those events when
showing dashboard totals. Fixtures and tool binaries are ignored by Git. Export
fresh fixtures after changing the HTML generators.

## First Run

Run this from the project root. Replace the JMeter path if installed elsewhere:

```powershell
./testing/jmeter/run-load-test.ps1 -Users 1 -Loops 2 -RampUp 1
# Or:
./testing/jmeter/run-load-test.ps1 -Users 1 -Loops 2 -RampUp 1 -JMeterPath 'C:\Tools\apache-jmeter-5.6.3\bin\jmeter.bat'
# With a separate Java installation:
./testing/jmeter/run-load-test.ps1 -Users 1 -JavaHome 'C:\Tools\jdk-17'
```

The runner checks that the application and fixtures are available, then uses
JMeter's CLI mode. Each run has a unique folder under `testing/jmeter/results`:

- `samples.jtl`: HTTP sample timings, status, activity type, and assertion errors.
- `jmeter.log`: JMeter diagnostics.
- `summary.json`: run settings, counts, errors, average and 95th percentile
  response times, and request throughput, overall and by request label.
- `report/index.html`: the JMeter HTML dashboard for the video.

A run with failed samples returns an error, even if JMeter itself exits normally.
Review both failed samples and the log. Setup/compiler overhead and time spent
thinking are not included in individual HTTP response times.

## Staged Load

The completed 10-, 100- and 1,000-user runs and their measured concurrency are
documented in [evidence/staged-results.md](evidence/staged-results.md). Selected
JSON summaries and a comparison CSV are saved alongside that document.

The verified one-user baseline is saved in
[evidence/smoke-summary.json](evidence/smoke-summary.json): two iterations,
both activity types, 22 HTTP samples and zero failures. This is a functional
smoke check of the load-test plan, not evidence of high-load capacity.

Run one stage at a time and review its results before proceeding. The same plan
supports the brief's suggested 1, 10, 100, 1,000 and 10,000 virtual-user settings:

| Users | Example Ramp-Up | Loops Per User |
| --- | --- | --- |
| 1 | 1 second | 2 |
| 10 | 10 seconds | 2 |
| 100 | 30 seconds | 2 |
| 1,000 | 120 seconds | 2 |
| 10,000 | 600 seconds | 2 |

For example, the next stage is:

```powershell
./testing/jmeter/run-load-test.ps1 -Users 10 -Loops 2 -RampUp 10
```

`Users` is the configured virtual-user count, not a claim that all those users
are active simultaneously. With a finite loop count, early users may finish
before later users start. Use the report's active-thread graph to describe the
observed concurrency. Keep loops and think time comparable when comparing runs.
`-ThinkMs` defaults to a 100 ms pause before each request. You can increase loops
to maintain concurrency longer; record that setting alongside the results.

Do not launch the largest stages automatically. If the machine cannot sustain
them, use smaller equivalent staged levels (for example 1, 10, 25, 50, 100),
which the brief allows, and explain that choice. Record CPU/memory use for both
the Docker services and Java load generator. Running JMeter and the application
on the same PC can make the generator itself the bottleneck.

Normal iterations delete only the records they created; word-list deletion also
cascades to related activities and outputs. An interrupted or failed run can
leave uniquely named `JMeter ...` records. Check the saved-data view afterwards
and remove only those test records. These load requests do not fabricate usage
events, so their output-storage counts should not be interpreted as browser
generation events.

## Video Evidence

Show a stage command, its completed summary and HTML report. Compare measured
throughput, average/p95 response times and error rates between stages. Explain
any failures or plateau and relate them to the active-thread graph and resource
usage. Keep conclusions limited to the environment and workload actually tested.
The test plan and scripts belong in Git; raw result folders are ignored. Keep
selected summaries or screenshots separately as assessment evidence.

## Sources

- [JMeter CLI and installation](https://jmeter.apache.org/usermanual/get-started.html)
- [JMeter load-testing best practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [JMeter component reference](https://jmeter.apache.org/usermanual/component_reference.html)
