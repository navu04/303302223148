# Stage 2: Database Design & Persistence

## Database Selection Rationale

### Chosen Database: MongoDB (NoSQL)

**Why MongoDB:**
1. **Flexibility** - Notification schema can vary (different types, priorities)
2. **Scalability** - Horizontal scaling for large user base
3. **JSON-like Structure** - Natural fit for JavaScript/Node.js applications
4. **Real-time Queries** - Quick retrieval of unread notifications
5. **Easy Indexing** - Index on userId, createdAt for fast queries

**Alternatives Considered:**
- **PostgreSQL (SQL)** - Rigid schema, but excellent for relational data
- **Redis** - Fast but not suitable for persistent storage
- **Firebase** - Managed but vendor lock-in

---

## Database Schema

### Collections Structure

#### 1. Notifications Collection

```javascript
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "title", "message", "type", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { 
          bsonType: "string",
          description: "Unique user identifier"
        },
        title: { 
          bsonType: "string",
          minLength: 3,
          maxLength: 100,
          description: "Notification title"
        },
        message: { 
          bsonType: "string",
          minLength: 5,
          maxLength: 500,
          description: "Notification message"
        },
        description: { 
          bsonType: "string",
          maxLength: 2000,
          description: "Detailed description (optional)"
        },
        type: { 
          enum: ["success", "info", "warning", "error", "alert"],
          description: "Notification type"
        },
        priority: { 
          enum: ["low", "medium", "high", "critical"],
          description: "Notification priority"
        },
        category: { 
          bsonType: "string",
          description: "Category: account, job, system, etc."
        },
        isRead: { 
          bsonType: "bool",
          description: "Read status"
        },
        actionUrl: { 
          bsonType: "string",
          description: "URL to navigate on action (optional)"
        },
        createdAt: { 
          bsonType: "date",
          description: "Creation timestamp"
        },
        updatedAt: { 
          bsonType: "date",
          description: "Last update timestamp"
        },
        expiresAt: { 
          bsonType: "date",
          description: "Expiration timestamp for auto-delete"
        },
        metadata: {
          bsonType: "object",
          description: "Additional data (optional)"
        }
      }
    }
  }
})
```

#### 2. Indexes for Performance

```javascript
// Index for quick user notifications retrieval
db.notifications.createIndex({ userId: 1, createdAt: -1 })

// Index for finding unread notifications
db.notifications.createIndex({ userId: 1, isRead: 1 })

// Index for expiration cleanup
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Index for notification type queries
db.notifications.createIndex({ userId: 1, type: 1 })

// Index for priority queries
db.notifications.createIndex({ userId: 1, priority: 1 })
```

---

## MongoDB Queries

### 1. Get All Notifications for User

```javascript
db.notifications.find({
  userId: "user-123"
}).sort({ createdAt: -1 }).limit(50)

// Count total and unread
db.notifications.aggregate([
  { $match: { userId: "user-123" } },
  { $group: {
    _id: null,
    totalCount: { $sum: 1 },
    unreadCount: { $sum: { $cond: ["$isRead", 0, 1] } }
  }}
])
```

### 2. Get Unread Notifications

```javascript
db.notifications.find({
  userId: "user-123",
  isRead: false
}).sort({ priority: -1, createdAt: -1 })
```

### 3. Mark Single Notification as Read

```javascript
db.notifications.updateOne(
  { _id: ObjectId("..."), userId: "user-123" },
  { 
    $set: { 
      isRead: true,
      updatedAt: new Date()
    }
  }
)
```

### 4. Mark All as Read

```javascript
db.notifications.updateMany(
  { userId: "user-123", isRead: false },
  { 
    $set: { 
      isRead: true,
      updatedAt: new Date()
    }
  }
)
```

### 5. Create New Notification

```javascript
db.notifications.insertOne({
  userId: "user-123",
  title: "Registration Successful",
  message: "Your registration has been confirmed",
  description: "You can now access all features",
  type: "success",
  priority: "high",
  category: "account",
  isRead: false,
  actionUrl: "/dashboard/profile",
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  metadata: { source: "registration_system" }
})
```

### 6. Delete Notification

```javascript
db.notifications.deleteOne({
  _id: ObjectId("..."),
  userId: "user-123"
})
```

### 7. Delete Expired Notifications

```javascript
db.notifications.deleteMany({
  expiresAt: { $lt: new Date() }
})
```

### 8. Bulk Operations

```javascript
// Mark all priority high as read
db.notifications.updateMany(
  { userId: "user-123", priority: "high" },
  { $set: { isRead: true, updatedAt: new Date() } }
)

// Delete all low priority older than 30 days
db.notifications.deleteMany({
  userId: "user-123",
  priority: "low",
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})
```

---

## Scalability & Performance Issues

### Issue 1: Data Volume Explosion

**Problem:**
- Each user generates hundreds of notifications annually
- Queries become slow with millions of records

**Solutions:**
1. **Partitioning by Date** - Archive old notifications to separate collection
   ```javascript
   // Monthly collection strategy
   db.notifications_2026_06.find({ userId: "user-123" })
   ```

2. **TTL Index** - Auto-delete notifications after expiration
   ```javascript
   db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
   ```

3. **Aggregation Pipeline** - Complex queries use aggregation
   ```javascript
   db.notifications.aggregate([
     { $match: { userId: "user-123" } },
     { $group: { _id: "$type", count: { $sum: 1 } } }
   ])
   ```

---

### Issue 2: Query Performance Degradation

**Problem:**
- Random field access on millions of documents
- Full collection scans

**Solutions:**
1. **Strategic Indexing**
   ```javascript
   // Compound index for common query pattern
   db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })
   ```

2. **Query Optimization**
   ```javascript
   // Bad query
   db.notifications.find({ userId: "user-123" }).toArray()
   
   // Good query with pagination
   db.notifications
     .find({ userId: "user-123" })
     .sort({ createdAt: -1 })
     .skip((pageNum - 1) * pageSize)
     .limit(pageSize)
   ```

3. **Caching Layer** - Use Redis for frequently accessed data
   ```javascript
   // Cache unread count
   cache.set(`user-123:unread`, 5, 300) // 5 min TTL
   ```

---

### Issue 3: Concurrent Updates

**Problem:**
- Multiple simultaneous mark-as-read requests
- Potential race conditions

**Solutions:**
1. **Atomic Operations**
   ```javascript
   db.notifications.findOneAndUpdate(
     { _id: ObjectId("..."), userId: "user-123" },
     { $set: { isRead: true, updatedAt: new Date() } },
     { returnDocument: "after" }
   )
   ```

2. **Transaction Support** (MongoDB 4.0+)
   ```javascript
   session = db.getMongo().startSession()
   session.startTransaction()
   try {
     db.notifications.updateOne(..., { session })
     db.users.updateOne(..., { session })
     session.commitTransaction()
   } catch (error) {
     session.abortTransaction()
   }
   ```

---

### Issue 4: Storage Optimization

**Problem:**
- Redundant data storage
- Inefficient indexing consuming disk space

**Solutions:**
1. **Field Compression**
   ```javascript
   // Store abbreviated types
   "type": "S" // instead of "success"
   "priority": "H" // instead of "high"
   ```

2. **Remove Unnecessary Fields**
   ```javascript
   db.notifications.updateMany(
     {},
     { $unset: { tempField: "" } }
   )
   ```

3. **Archive Old Data**
   ```javascript
   // Move 1-year-old records to archive collection
   db.notifications.find({ createdAt: { $lt: cutoffDate } })
     .forEach(doc => db.notifications_archive.insertOne(doc))
   ```

---

## Comparison: SQL vs NoSQL

| Aspect | MongoDB (NoSQL) | PostgreSQL (SQL) |
|--------|-----------------|------------------|
| **Schema Flexibility** | Flexible, evolving schema | Rigid, predefined schema |
| **Scalability** | Horizontal (Sharding) | Vertical primarily |
| **Query Performance** | Fast for simple queries | Complex joins efficient |
| **Data Consistency** | Eventual consistency | ACID guaranteed |
| **Storage** | Larger due to JSON | Compact binary format |
| **Indexing** | Quick multi-field indexes | Powerful constraint options |

**Recommendation:** MongoDB chosen for this notification system due to flexible schema requirements and horizontal scalability needs.

---

## Implementation Considerations

### Connection Pooling
```javascript
const mongoClient = new MongoClient(uri, {
  maxPoolSize: 100,
  minPoolSize: 10
})
```

### Backup Strategy
```bash
# Daily backup
mongodump --uri="mongodb://user:pass@host:27017/dbname" --out=./backup_$(date +%Y%m%d)
```

### Monitoring
- Connection pool usage
- Query execution time
- Disk space consumption
- Index efficiency

---

## Submission
**Stage 2 Completed:** Database design including:
- ✅ Database selection rationale
- ✅ Complete schema with validation
- ✅ Strategic indexes for performance
- ✅ CRUD MongoDB queries
- ✅ Scalability issue identification & solutions
- ✅ SQL vs NoSQL comparison
- ✅ Implementation best practices
