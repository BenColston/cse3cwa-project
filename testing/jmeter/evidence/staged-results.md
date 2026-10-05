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
| 10,000 | 10,000 | 389 | 600 | 207,680 | 3,903 | 723.62 | 7,351 | 338.29 |

The 10-, 100- and 1,000-user stages completed the expected user and request counts. Response checks
verified the status codes, phoneme data, related activity IDs and exact stored
HTML content. Their recorded error rate was 0%. The 10,000-user stage launched
all its users but recorded a 1.88% error rate and skipped dependent requests
after failed word-list creation. It did not pass. See
[the detailed 10,000-user findings](users-10000-findings.md) for errors, recovery
and limitations. After its cleanup, `/health` returned 200 and no test lists remained.

## Interpretation

The configured user count is the total number of virtual users launched during
the stage. Users can finish their two iterations while later users are still
starting. Peak concurrency is taken from the largest `allThreads` count in the
HTTP sample data. The 1,000-user stage therefore tested 1,000 users over time,
with an observed peak of 29 active users, rather than 1,000 simultaneous users.

Measured throughput rose as the planned arrival rate increased. At the highest
passing stage, average HTTP response time was 13.45 ms and 95% of requests completed
within 29 ms. At 10,000 configured users, average elapsed time increased to
723.62 ms and timeouts occurred. The table's p95 uses the runner's nearest-rank
calculation over all samples; the JMeter dashboard's windowed estimate can
differ, as explained in the detailed findings. The small
difference between the first two stages does not show that more load improves
performance; warm caches and normal timing variation can affect short runs.

The first three stages establish successful operation for their finite, ramped workloads;
the last demonstrates degraded behaviour under its larger workload.
They do not establish maximum capacity, the breaking point, or sustained
1,000-user concurrency. To test that separately, use longer workflows or a
duration-based profile and verify its actual active-thread graph.

JMeter sends HTTP requests and checks stored generated HTML; it does not run
the generated activity's JavaScript under load. The Playwright tests cover
the browser generation/download/gameplay workflow.

## Evidence Files

- `users-10-summary.json`, `users-100-summary.json`, `users-1000-summary.json`, `users-10000-summary.json`
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
| 10,000 | `users-10000-20261006-010048-4fd24f` |

Open `report/index.html` in each run folder to show the JMeter dashboard, request
statistics and active-thread graph in the video. Keep these raw results with
your recording evidence; the saved summaries preserve the comparison.

## Reproduce

From the project root, with the app running and fixtures exported:

```powershell
./testing/jmeter/run-load-test.ps1 -Users 10 -Loops 2 -RampUp 10
./testing/jmeter/run-load-test.ps1 -Users 100 -Loops 2 -RampUp 30
./testing/jmeter/run-load-test.ps1 -Users 1000 -Loops 2 -RampUp 120
./testing/jmeter/run-load-test.ps1 -Users 10000 -Loops 2 -RampUp 600
```

Run one command at a time and review its results before increasing the load.
New runs create their own timestamped folders and do not overwrite this evidence.
