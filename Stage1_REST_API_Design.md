# Stage 1: REST API Design

## Overview
This document defines REST API endpoints for the notification system that display notifications to users when they are logged in.

## Core Actions Identified
1. **Get Notifications** - Retrieve all notifications for logged-in user
2. **Mark as Read** - Mark a notification as read
3. **Delete Notification** - Delete a specific notification
4. **Submit Notification** - Create a new notification (Admin)
5. **Get Notification Details** - Get single notification details

---

## REST API Endpoints

### 1. Get All Notifications (GET)
**Endpoint:** `GET /evaluation-service/notifications`

**Description:** Retrieve all notifications for the logged-in user

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Response (Status Code: 200):**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "notificationId": "notif-001",
      "userId": "user-123",
      "title": "Registration Successful",
      "message": "Your registration has been confirmed",
      "type": "success",
      "priority": "high",
      "isRead": false,
      "createdAt": "2026-06-08T10:30:00Z",
      "expiresAt": "2026-06-15T10:30:00Z"
    },
    {
      "notificationId": "notif-002",
      "userId": "user-123",
      "title": "New Job Opportunity",
      "message": "A new job opportunity matching your profile",
      "type": "info",
      "priority": "medium",
      "isRead": true,
      "createdAt": "2026-06-07T14:20:00Z",
      "expiresAt": "2026-06-14T14:20:00Z"
    }
  ],
  "totalCount": 2,
  "unreadCount": 1
}
```

**Error Response (Status Code: 401):**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid token"
}
```

---

### 2. Get Single Notification (GET)
**Endpoint:** `GET /evaluation-service/notifications/:notificationId`

**Description:** Retrieve details of a specific notification

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**URL Parameters:**
- `notificationId` (string, required) - Unique notification identifier

**Response (Status Code: 200):**
```json
{
  "success": true,
  "message": "Notification retrieved successfully",
  "data": {
    "notificationId": "notif-001",
    "userId": "user-123",
    "title": "Registration Successful",
    "message": "Your registration has been confirmed",
    "description": "Detailed description of the notification content",
    "type": "success",
    "priority": "high",
    "category": "account",
    "isRead": false,
    "actionUrl": "/dashboard/profile",
    "createdAt": "2026-06-08T10:30:00Z",
    "expiresAt": "2026-06-15T10:30:00Z"
  }
}
```

---

### 3. Mark Notification as Read (PUT)
**Endpoint:** `PUT /evaluation-service/notifications/:notificationId/read`

**Description:** Mark a specific notification as read

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**URL Parameters:**
- `notificationId` (string, required)

**Request Body:**
```json
{
  "isRead": true
}
```

**Response (Status Code: 200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notificationId": "notif-001",
    "isRead": true,
    "updatedAt": "2026-06-08T10:35:00Z"
  }
}
```

---

### 4. Delete Notification (DELETE)
**Endpoint:** `DELETE /evaluation-service/notifications/:notificationId`

**Description:** Delete a specific notification

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**URL Parameters:**
- `notificationId` (string, required)

**Response (Status Code: 200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "notificationId": "notif-001",
    "deletedAt": "2026-06-08T10:40:00Z"
  }
}
```

**Error Response (Status Code: 404):**
```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

### 5. Create Notification (POST) - Admin Only
**Endpoint:** `POST /evaluation-service/notifications`

**Description:** Create a new notification (Admin/System)

**Headers:**
```json
{
  "Authorization": "Bearer <admin-token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "userId": "user-123",
  "title": "Important Update",
  "message": "Please update your profile information",
  "description": "Optional detailed description",
  "type": "warning",
  "priority": "high",
  "category": "account",
  "actionUrl": "/dashboard/profile",
  "expiresIn": 7
}
```

**Response (Status Code: 201):**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "notificationId": "notif-003",
    "userId": "user-123",
    "title": "Important Update",
    "message": "Please update your profile information",
    "type": "warning",
    "priority": "high",
    "isRead": false,
    "createdAt": "2026-06-08T11:00:00Z",
    "expiresAt": "2026-06-15T11:00:00Z"
  }
}
```

---

### 6. Mark All as Read (PUT) - Bulk Action
**Endpoint:** `PUT /evaluation-service/notifications/read-all`

**Description:** Mark all notifications as read for logged-in user

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Status Code: 200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 5,
    "updatedAt": "2026-06-08T11:05:00Z"
  }
}
```

---

### 7. Delete All Notifications (DELETE) - Bulk Action
**Endpoint:** `DELETE /evaluation-service/notifications`

**Description:** Delete all notifications for logged-in user

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response (Status Code: 200):**
```json
{
  "success": true,
  "message": "All notifications deleted successfully",
  "data": {
    "deletedCount": 5,
    "deletedAt": "2026-06-08T11:10:00Z"
  }
}
```

---

## API Response Standards

### Success Response (Status Code: 200/201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* actual data */ }
}
```

### Error Response
**Status Code: 400** - Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "errors": ["Field 'title' is required"]
}
```

**Status Code: 401** - Unauthorized
```json
{
  "success": false,
  "message": "Authentication failed - Invalid or expired token"
}
```

**Status Code: 403** - Forbidden
```json
{
  "success": false,
  "message": "Access denied - Insufficient permissions"
}
```

**Status Code: 404** - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**Status Code: 500** - Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "errorId": "error-001"
}
```

---

## Notification Types
- `success` - Successful operations
- `info` - Information notifications
- `warning` - Warning messages
- `error` - Error notifications
- `alert` - Urgent alerts

## Priority Levels
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `critical` - Critical/Urgent

## Naming Conventions
- Endpoint paths use lowercase with hyphens: `/evaluation-service/notifications`
- Query parameters use camelCase: `?isRead=true&priority=high`
- JSON fields use camelCase: `notificationId`, `isRead`, `createdAt`
- Resource IDs follow pattern: `notif-XXX`, `user-XXX`

---

## Submission
**Stage 1 Completed:** REST API endpoints designed with:
- ✅ Clear and consistent naming conventions
- ✅ Predictable endpoint structure
- ✅ Complete JSON request/response schemas
- ✅ Proper HTTP status codes
- ✅ Error handling patterns
