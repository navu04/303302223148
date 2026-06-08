# Stage 4

## Problem

Notifications are fetched on every page load which increases database load.

## Solutions

### Pagination

Fetch notifications in chunks of 20 records.

### Redis Cache

Store:

* Unread count
* Recent notifications

### WebSocket Push

Push notifications directly to users instead of repeated polling.

### Database Indexing

Indexes on:

* student_id
* is_read
* created_at

## Tradeoffs

### Redis

Advantages:

* Extremely fast
* Reduces DB traffic

Disadvantages:

* Cache invalidation complexity

### WebSocket

Advantages:

* Real-time updates
* Better user experience

Disadvantages:

* Additional infrastructure

# Stage 5

## Problems In Current Implementation

* Sequential processing
* Very slow for 50,000 students
* Email failure can interrupt execution
* No retry mechanism
* Poor scalability

## Improved Architecture

```text
HR
 |
 v
Notification Service
 |
 v
Message Queue (Kafka/RabbitMQ)
 |
 +---- Email Workers
 |
 +---- Push Workers
 |
 +---- Database Workers
```

## Benefits

* Parallel processing
* Retry support
* Fault tolerance
* Scalability

## Revised Pseudocode

```text
function notify_all(students, message):

    save_notification_record(message)

    for each student:
        queue.publish(student, message)

Worker:

    receive_job()

    send_email()

    send_push()

    update_status()

    retry_if_failed()
```
# Stage 6

## Priority Calculation

| Notification Type | Priority |
| ----------------- | -------- |
| Placement         | 3        |
| Result            | 2        |
| Event             | 1        |

## Sorting Strategy

1. Higher priority notifications first.
2. If priorities are equal, latest timestamp first.
3. Return top 10 notifications.

## Time Complexity

Sorting N notifications:

O(N log N)

## Future Optimization

Use a Priority Queue (Heap) to maintain Top 10 notifications efficiently.