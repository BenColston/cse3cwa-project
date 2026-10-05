# 10,000-User Findings

Recorded on 6 October 2026 (Australia/Sydney), using the same local frontend,
API, JMeter 5.6.3, Java 17 runtime and fixtures as the earlier stages.

```powershell
./testing/jmeter/run-load-test.ps1 -Users 10000 -Loops 2 -RampUp 600
```

## Outcome: Failed Under Load

All 10,000 virtual users started and finished. Each was configured for two
iterations with a 100 ms pause before requests and a ten-minute ramp-up.
The observed peak was **389 active users**, not 10,000 simultaneous users.

| Measure | Recorded Result |
| --- | --- |
| Planned requests | 220,000 |
| Recorded requests | 207,680 |
| Failed requests | 3,903 |
| Overall error rate | 1.88% |
| Average elapsed time | 723.62 ms |
| Exact raw-sample p95 | 7,351 ms |
| Throughput | 338.29 requests/s |
| HTTP sample time span | 613.91 seconds |

The average and p95 include successful and failed samples. The runner returned
an error after saving the results because failures were recorded. This stage
must not be described as passing or as support for 10,000 concurrent users.

## Failures

All failed samples recorded `java.net.SocketTimeoutException`. The existing
10-second response timeout was retained throughout the run.

| Request | Samples | Timeouts | Error Rate |
| --- | --- | --- | --- |
| Health | 20,000 | 2,363 | 11.82% |
| Create word list | 20,000 | 1,540 | 7.70% |

Other request labels recorded no failures. Each failed word-list creation left
the client without a list ID, so the plan skipped eight dependent requests.
Thus 1,540 failed creations explain all 12,320 requests missing from the planned
total. Finishing a JMeter user thread does not mean its workflows passed.

The endpoint error rates are more revealing than the overall rate: the large
number of successful dependent requests dilutes the aggregate. These are HTTP
load-test failures, not `GENERATION_FAILED` analytics events in the application.

## Interpretation

The earlier 1,000-user ramped stage recorded zero failures, a 13.45 ms average
and a peak of 29 active users. This stage recorded much higher response times
and timeouts with a peak of 389 active users. The system and load generator did
not maintain the same responsiveness under this larger workload.

The generator snapshots show thousands of native Java threads awaiting their
scheduled start and working sets around 1.3-1.5 GB. Native thread count is not
the number of actively executing virtual users. These are sampled observations,
not resource peaks. The snapshots do not establish a CPU or memory bottleneck;
application/container resource telemetry was not available. Further diagnosis
should separate generator overhead, request scheduling and server/database
capacity rather than attribute all timeouts to a particular component.

The comparison CSV uses the runner's nearest-rank p95 over all raw samples.
The JMeter dashboard shows approximately **7,584.85 ms** for its estimated p95.
Its default percentile calculation uses a 20,000-sample sliding window and a
different estimator, so the figures can differ. Name the displayed measure
when presenting either value. See the
[JMeter dashboard documentation](https://jmeter.apache.org/usermanual/generating-dashboard.html).

## Recovery and Cleanup

The timed-out creation requests had still created 1,540 database word lists.
They were backed up in the raw run folder, then deleted only after checking
their generated UUID name, `JMeter load test` source, test description and this
run's creation-time window. Unrelated records were not selected.

After cleanup there were no remaining test lists and `/health` returned 200.
The raw failure results were preserved unchanged; cleanup does not turn this
run into a pass. Counts and the time window are in `users-10000-cleanup.json`.

## Evidence

- `users-10000-summary.json`: settings and measured overall/per-request results.
- `users-10000-errors.json`: failure counts by request and response code.
- `users-10000-dashboard-statistics.json`: original JMeter dashboard statistics.
- `users-10000-generator-snapshots.ndjson`: timestamped generator observations.
- `users-10000-cleanup.json`: recovery and cleanup verification.

Raw samples, logs, the test-record backup and HTML report are retained locally
under `testing/jmeter/results/users-10000-20261006-010048-4fd24f` (ignored by Git).
Open its `report/index.html` for the recording. Show the request statistics,
errors table and active-thread graph, and contrast this degraded run with the
earlier passing stages.

The runner's distinct-user count was changed to a hash set after this run to
avoid slow post-processing of large result files. The new count was checked
against the saved samples and still reports 10,000 users. This affects summary
processing only; it does not change the workload or recorded measurements.
