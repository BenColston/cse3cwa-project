# Recorded JMeter Stages

Recorded on 6 October 2026 (Australia/Sydney) against the local frontend at
`http://localhost:3000` and API at `http://localhost:4080`. JMeter 5.6.3 ran with
the local Temurin Java 17 runtime. All stages used the same plan, two workflow
iterations per user, and a 100 ms pause before each request. Both Wordle and
Word Search workflows were included.

| Configured Users | Observed Users | Peak Active Users | Ramp-Up (s) | Requests | Failures | Average (ms) | p95 (ms) | Requests/s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | 10 | 4 | 10 | 220 | 0 | 11.23 | 20 | 19.47 |
| 100 | 100 | 12 | 30 | 2,200 | 0 | 10.32 | 19 | 68.96 |
| 1,000 | 1,000 | 29 | 120 | 22,000 | 0 | 13.45 | 29 | 180.11 |

Every stage completed the expected user and request counts. Response checks
verified the status codes, phoneme data, related activity IDs and exact stored
HTML content. The recorded error rate was 0% for all three stages. After the
last stage, `/health` returned 200 and no `JMeter ...` word lists remained.

## Interpretation

The configured user count is the total number of virtual users launched during
the stage. Users can finish their two iterations while later users are still
starting. Peak concurrency is taken from the largest `allThreads` count in the
HTTP sample data. The 1,000-user stage therefore tested 1,000 users over time,
with an observed peak of 29 active users, rather than 1,000 simultaneous users.

Measured throughput rose as the planned arrival rate increased. At the highest
stage, average HTTP response time was 13.45 ms and 95% of requests completed
within 29 ms. No failed responses or content assertions were recorded. The small
difference between the first two stages does not show that more load improves
performance; warm caches and normal timing variation can affect short runs.

These results establish successful operation for this finite, ramped workload.
They do not establish maximum capacity, the breaking point, or sustained
1,000-user concurrency. To test that separately, use longer workflows or a
duration-based profile and verify its actual active-thread graph.

JMeter sends HTTP requests and checks stored generated HTML; it does not run
the generated activity's JavaScript under load. The Playwright tests cover
the browser generation/download/gameplay workflow.

## Evidence Files

- `users-10-summary.json`, `users-100-summary.json`, `users-1000-summary.json`
  contain measured settings and per-request statistics.
- `staged-comparison.csv` provides the overall comparison.
- `users-1000-generator-snapshot.json` records one observation of the Java load
  generator during that run: approximately 904 MB working set on a host exposing
  12 logical processors. This is a snapshot, not a memory peak. CPU seconds are
  cumulative process time, not CPU utilisation. Native Java thread count also
  includes threads waiting for their scheduled ramp-up, so it is not the active
  virtual-user count. Application/container resource telemetry was not captured;
  these results cannot identify a CPU, database or memory bottleneck.

The raw samples, logs and generated dashboards remain in these local folders
under `testing/jmeter/results` (ignored by Git):

| Stage | Run Folder |
| --- | --- |
| 10 | `users-10-20261006-004334-24bc44` |
| 100 | `users-100-20261006-004429-540b91` |
| 1,000 | `users-1000-20261006-004548-767bfa` |

Open `report/index.html` in each run folder to show the JMeter dashboard, request
statistics and active-thread graph in the video. Keep these raw results with
your recording evidence; the saved summaries preserve the comparison.

## Reproduce

From the project root, with the app running and fixtures exported:

```powershell
./testing/jmeter/run-load-test.ps1 -Users 10 -Loops 2 -RampUp 10
./testing/jmeter/run-load-test.ps1 -Users 100 -Loops 2 -RampUp 30
./testing/jmeter/run-load-test.ps1 -Users 1000 -Loops 2 -RampUp 120
```

Run one command at a time and review its results before increasing the load.
New runs create their own timestamped folders and do not overwrite this evidence.
