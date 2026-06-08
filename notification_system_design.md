# Notification System Design

## Final Improvements Applied

### Changes Made
1. Standardized database choice to **PostgreSQL** across all stages.
2. Replaced direct Email + DB transaction example with **Transactional Outbox Pattern**.
3. Replaced unrealistic "64 days -> 2-3 minutes" claims with realistic scalability wording.
4. Kept Stage 1–5 structure intact and interview-friendly.

---

# Stage 4: Performance Optimization

## Problem Statement

Notifications are fetched on every page load, causing excessive database load and poor response times.

## Solutions

### Pagination
Fetch notifications in chunks (20–50 records).

### Redis Cache
Cache:
- Recent notifications
- Unread notification count

### WebSocket Push
Push notifications in real time instead of repeated polling.

### Infinite Scroll / Lazy Loading
Load additional notifications only when required.

## Recommended Architecture

User
↓
API Gateway
↓
Redis Cache
↓ (cache miss)
PostgreSQL

### Benefits
- Reduced DB load
- Faster response times
- Better user experience
- Improved scalability

## Tradeoffs

### Redis

Advantages:
- Extremely fast
- Reduces DB traffic

Disadvantages:
- Cache invalidation complexity
- Additional infrastructure

### WebSocket

Advantages:
- Real-time updates
- Reduced polling

Disadvantages:
- Persistent connection management
- Additional operational complexity

---

# Stage 5: Bulk Notification Processing

## Problems In Existing Implementation

- Sequential processing
- Poor scalability
- Email failures interrupt workflow
- No retry mechanism
- Long execution time for 50,000 students
- Difficult monitoring and recovery

## Recommended Architecture

HR Portal
↓
Notification Service
↓
PostgreSQL
↓
Outbox Table
↓
Message Queue (Kafka / RabbitMQ)
↓
Email Workers
↓
Push Notification Workers
↓
WebSocket Gateway

## Why This Architecture?

- Asynchronous processing
- Retry support
- Fault tolerance
- Horizontal scalability
- Progress tracking
- Better reliability

## What Happens If Email Fails For 200 Students?

- Notification record remains stored in database.
- Failed jobs are retried automatically.
- Exponential backoff is used.
- After max retries, messages move to Dead Letter Queue (DLQ).
- Operations team can inspect and replay failed jobs.

## Should DB Save And Email Send Happen Together?

No.

Email is an external service and should not be part of the same database transaction.

### Recommended Approach: Transactional Outbox Pattern

Database Transaction:

1. Save notification record.
2. Save outbox event.
3. Commit transaction.

Worker Process:

1. Read event from Outbox table.
2. Send email.
3. Send push notification.
4. Mark event as processed.

Benefits:

- No lost notifications.
- Reliable delivery.
- Recovery after crashes.
- Better consistency.

## Revised Pseudocode

```text
function notify_all(student_ids, message):

    begin_transaction()

    batch_id = create_batch(message)

    for each student_id:

        save_notification(
            batch_id,
            student_id,
            message
        )

        save_outbox_event(
            batch_id,
            student_id,
            message
        )

    commit_transaction()


Outbox Worker:

    while true:

        event = get_next_unprocessed_event()

        try:

            send_email(event)

            send_push_notification(event)

            mark_event_processed(event)

        except:

            retry_with_exponential_backoff(event)

            move_to_dlq_if_retry_limit_exceeded(event)
```

## Performance Improvement

Instead of processing 50,000 students sequentially, the system processes notifications using multiple workers in parallel.

Result:

- Massive reduction in processing time
- Improved throughput
- Better fault tolerance
- Supports future growth to hundreds of thousands or millions of notifications

---

## Conclusion

The final design provides:

- Real-time notification delivery
- Optimized database access
- Redis caching
- WebSocket updates
- Reliable bulk notification processing
- Retry and recovery mechanisms
- Transactional Outbox Pattern
- Horizontal scalability

# Stage 6

## Priority Inbox

Priority Inbox displays the top N unread notifications based on:

1. Notification Type Weight
2. Recency

### Weight Mapping

| Type | Weight |
|--------|--------|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

### Ranking Formula

score = weight × 1,000,000,000 + timestamp_epoch

### Efficient Top 10 Retrieval

A Min Heap of size 10 is maintained.

Advantages:

- O(N log K) complexity
- Memory efficient
- Supports continuous incoming notifications
- Suitable for real-time systems

### Data Structure

Priority Queue (Min Heap)

### Complexity

Insertion:

O(log K)

Top 10 Retrieval:

O(N log K)

Where:

K = 10

This approach is significantly faster than sorting all notifications using O(N log N).

# Stage 7

## Frontend Implementation

Technology:
- React
- Material UI
- Axios
- React Router

Pages:
1. All Notifications
2. Priority Inbox

Features:
- Pagination
- Notification Type Filter
- Read/Unread Differentiation
- Responsive Design
- Priority Sorting

Priority Order:
Placement > Result > Event

For notifications of the same type,
newer notifications are shown first.

Read notifications are tracked using
localStorage and displayed differently
from unread notifications.

The application runs on:

http://localhost:3000