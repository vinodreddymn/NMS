# NMS Backend Implementation Guide

This document provides a complete overview of the implemented CRUD backend for the Network Management System.

## Implementation Summary

### What Has Been Implemented

#### ✅ Complete CRUD Operations for 9 Database Entities:

1. **Device Types** - Device type definitions and capabilities
2. **Devices** - Physical network devices with all attributes
3. **Poles** - Utility distribution poles with GPS data
4. **Switches** - Network switches with hierarchical support
5. **Substations** - Power substations with equipment status
6. **Voltage Regulators** - Voltage regulation equipment
7. **Alarm Events** - System alarms with acknowledgment support
8. **Device Status Logs** - Performance metrics and health data
9. **Power Status Logs** - Power availability and quality metrics

#### ✅ Features Included

- Full CRUD (Create, Read, Update, Delete) operations
- Advanced filtering and search capabilities
- Pagination support for all list endpoints
- Database relationship handling
- Error handling and validation
- Health check endpoint
- RESTful API design
- Service-Controller architecture
- Connection pooling for database efficiency

---

## Project Structure

```
naiss-backend/
├── services/
│   ├── deviceTypeService.js
│   ├── deviceService.js
│   ├── poleService.js
│   ├── switchService.js
│   ├── substationService.js
│   ├── voltageRegulatorService.js
│   ├── alarmEventService.js
│   ├── deviceStatusLogService.js
│   └── powerStatusLogService.js
├── controllers/
│   ├── deviceTypeController.js
│   ├── deviceController.js
│   ├── poleController.js
│   ├── switchController.js
│   ├── substationController.js
│   ├── voltageRegulatorController.js
│   ├── alarmEventController.js
│   ├── deviceStatusLogController.js
│   └── powerStatusLogController.js
├── routes/
│   ├── deviceTypeRoutes.js
│   ├── deviceRoutes.js
│   ├── poleRoutes.js
│   ├── switchRoutes.js
│   ├── substationRoutes.js
│   ├── voltageRegulatorRoutes.js
│   ├── alarmEventRoutes.js
│   ├── deviceStatusLogRoutes.js
│   └── powerStatusLogRoutes.js
├── config/
│   └── db.js                    # PostgreSQL connection pool
├── app.js                        # Express application setup
├── server.js                     # Server entry point
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── README.md                     # Quick start guide
├── API_DOCUMENTATION.md          # Complete API reference
├── CURL_EXAMPLES.md              # Testing examples
├── IMPLEMENTATION_GUIDE.md       # This file
└── DATABASE_SETUP.md             # Database configuration
```

---

## Architecture Pattern

### Service-Controller Architecture

```
Request → Routes → Controllers → Services → Database
                         ↓
                    Response
```

1. **Routes** - Define API endpoints
2. **Controllers** - Handle HTTP requests/responses
3. **Services** - Business logic and database operations
4. **Database** - PostgreSQL with connection pooling

---

## API Endpoints Summary

### Total Endpoints: 70+

#### Device Types (5 endpoints)
- POST /api/device-types
- GET /api/device-types
- GET /api/device-types/:id
- PUT /api/device-types/:id
- DELETE /api/device-types/:id

#### Devices (9 endpoints)
- POST /api/devices
- GET /api/devices
- GET /api/devices/:id
- GET /api/devices/search
- GET /api/devices/by-pole/:poleId
- GET /api/devices/by-switch/:switchId
- GET /api/devices/by-type/:deviceTypeId
- PUT /api/devices/:id
- DELETE /api/devices/:id

#### Poles (7 endpoints)
- POST /api/poles
- GET /api/poles
- GET /api/poles/:id
- GET /api/poles/by-regulator/:regulatorId
- GET /api/poles/by-phase/:phase
- PUT /api/poles/:id
- DELETE /api/poles/:id

#### Switches (7 endpoints)
- POST /api/switches
- GET /api/switches
- GET /api/switches/:id
- GET /api/switches/by-pole/:poleId
- GET /api/switches/children/:parentId
- PUT /api/switches/:id
- DELETE /api/switches/:id

#### Substations (5 endpoints)
- POST /api/substations
- GET /api/substations
- GET /api/substations/:id
- PUT /api/substations/:id
- DELETE /api/substations/:id

#### Voltage Regulators (6 endpoints)
- POST /api/voltage-regulators
- GET /api/voltage-regulators
- GET /api/voltage-regulators/:id
- GET /api/voltage-regulators/by-substation/:substationId
- PUT /api/voltage-regulators/:id
- DELETE /api/voltage-regulators/:id

#### Alarm Events (10 endpoints)
- POST /api/alarm-events
- GET /api/alarm-events
- GET /api/alarm-events/active
- GET /api/alarm-events/:id
- GET /api/alarm-events/by-device/:deviceId
- GET /api/alarm-events/by-severity/:severity
- GET /api/alarm-events/by-type/:eventType
- PUT /api/alarm-events/:id
- POST /api/alarm-events/:id/acknowledge
- DELETE /api/alarm-events/:id

#### Device Status Logs (8 endpoints)
- POST /api/device-status-logs
- GET /api/device-status-logs
- GET /api/device-status-logs/:id
- GET /api/device-status-logs/by-device/:deviceId
- GET /api/device-status-logs/latest/:deviceId
- GET /api/device-status-logs/date-range
- GET /api/device-status-logs/metrics/:deviceId
- DELETE /api/device-status-logs/:id

#### Power Status Logs (11 endpoints)
- POST /api/power-status-logs
- GET /api/power-status-logs
- GET /api/power-status-logs/:id
- GET /api/power-status-logs/by-substation/:substationId
- GET /api/power-status-logs/by-regulator/:regulatorId
- GET /api/power-status-logs/by-pole/:poleId
- GET /api/power-status-logs/latest/:substationId
- GET /api/power-status-logs/date-range
- GET /api/power-status-logs/outages
- GET /api/power-status-logs/metrics/:substationId
- DELETE /api/power-status-logs/:id

---

## Database Features Utilized

### Partitioning
- `device_status_logs` - Partitioned by month (checked_at)
- `power_status_logs` - Partitioned by month (recorded_at)
- Benefits: Improved query performance, easier maintenance, faster backups

### Indexes
- All foreign key columns indexed
- Time-based queries indexed for performance
- Device/IP/MAC lookups optimized

### Constraints
- Unique constraints on natural keys (device_name, ip_address, pole_number, etc.)
- Check constraints on enums (event_type, severity, status)
- Foreign key constraints for referential integrity

---

## How Each Service Works

### Base Service Pattern

All services follow this pattern:

```javascript
class EntityService {
    async create(data) { /* Insert */ }
    async getAll(limit, offset) { /* Select with pagination */ }
    async getById(id) { /* Select by ID */ }
    async update(id, data) { /* Update fields */ }
    async delete(id) { /* Delete */ }
    async getCount() { /* Count records */ }
}
```

### Extended Methods

Services also include specialized methods:

**DeviceService:**
- `getByPoleId()` - Filter devices by pole
- `getBySwitchId()` - Filter devices by switch
- `getByDeviceTypeId()` - Filter by type
- `search()` - Full-text search across name/IP/MAC

**AlarmEventService:**
- `getActive()` - Get only active alarms
- `getByDeviceId()` - Filter by device
- `getBySeverity()` - Filter by severity level
- `getByEventType()` - Filter by event type
- `acknowledge()` - Mark alarm as acknowledged

**DeviceStatusLogService:**
- `getByDeviceId()` - Get logs for device
- `getLatestForDevice()` - Get most recent status
- `getByDateRange()` - Query historical data
- `getAverageMetrics()` - Calculate averages over time

---

## Starting the Server

### Prerequisites
1. PostgreSQL database created
2. Schema applied
3. .env configured

### Commands

```bash
# Install dependencies (if not already done)
npm install

# Start server
npm start

# Or for development
node server.js
```

Server starts on port specified in .env (default: 3000)

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "Server is running",
  "timestamp": "2024-04-26T10:30:00.000Z"
}
```

---

## Testing the API

### Option 1: Using cURL
See [CURL_EXAMPLES.md](./CURL_EXAMPLES.md) for comprehensive examples

Quick example:
```bash
curl http://localhost:3000/api/devices?limit=10
```

### Option 2: Using Postman
1. Import the API endpoints
2. Set base URL to `http://localhost:3000`
3. Test each endpoint

### Option 3: Using VS Code REST Client
Create file `test.http`:
```
GET http://localhost:3000/api/devices
```

---

## Error Handling

All endpoints include error handling:

### 200 - Success
```json
{
  "success": true,
  "data": [...]
}
```

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Invalid input"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Device not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Performance Considerations

1. **Pagination**: Always use limit/offset for large datasets
2. **Indexes**: Leverage indexes on foreign keys and time columns
3. **Connection Pooling**: Database uses connection pool (max 10 connections)
4. **Partitioned Tables**: Time-series data automatically partitioned
5. **Query Optimization**: Services use efficient SQL without N+1 queries

---

## Security Notes

Current implementation has basic error handling. For production, add:
- Input validation middleware
- SQL injection prevention (parameterized queries - already used)
- Authentication/Authorization
- Rate limiting
- CORS configuration
- HTTPS/SSL

---

## Common Operations

### Creating Related Records

Example: Create a device on a specific pole:

```bash
# 1. Get pole ID first
curl http://localhost:3000/api/poles

# 2. Create device with pole reference
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "device_type_id": "...",
    "pole_id": "pole-uuid-from-step-1",
    ...
  }'
```

### Querying Relationships

```bash
# Get all devices on a specific pole
curl http://localhost:3000/api/devices/by-pole/{pole-id}

# Get all switches connected to a pole
curl http://localhost:3000/api/switches/by-pole/{pole-id}

# Get all regulators in a substation
curl http://localhost:3000/api/voltage-regulators/by-substation/{substation-id}
```

### Time Series Queries

```bash
# Get average performance metrics for a device
curl http://localhost:3000/api/device-status-logs/metrics/{device-id}?days=7

# Get historical power data
curl "http://localhost:3000/api/power-status-logs/date-range?startDate=2024-04-01&endDate=2024-04-26"
```

---

## Next Steps / Future Enhancements

1. **Authentication**
   - Add JWT authentication
   - User role-based access control
   - API key support

2. **Validation**
   - Input validation middleware
   - Email/phone format validation
   - IP address validation

3. **Logging**
   - Request/response logging
   - Audit trail for changes
   - Error logging

4. **Real-time**
   - WebSocket support for live updates
   - Server-sent events (SSE)

5. **Advanced Features**
   - Bulk operations
   - Data export (CSV, Excel)
   - Advanced filtering
   - Full-text search

6. **Monitoring**
   - Metrics collection
   - Performance monitoring
   - Database query analysis

---

## Troubleshooting

### Issue: Connection Refused
**Solution**: Ensure PostgreSQL is running and credentials are correct

### Issue: 404 Not Found
**Solution**: Check endpoint URL and verify route is registered in app.js

### Issue: 400 Bad Request
**Solution**: Verify JSON is valid and required fields are included

### Issue: Slow Queries
**Solution**: Check database indexes exist and consider pagination

### Issue: Out of Connections
**Solution**: Increase connection pool size or close stale connections

---

## Documentation Files

1. **README.md** - Quick start and overview
2. **API_DOCUMENTATION.md** - Complete API reference
3. **CURL_EXAMPLES.md** - Testing examples
4. **IMPLEMENTATION_GUIDE.md** - This file
5. **DATABASE_SETUP.md** - Database configuration

---

## Support

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

For testing examples, see [CURL_EXAMPLES.md](./CURL_EXAMPLES.md)

For database setup, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)
