# Network Management System (NMS) Backend

Complete CRUD backend API for Network Management System with support for devices, poles, switches, substations, voltage regulators, alarms, and status logs.

## Features

- ✅ Full CRUD operations for 9 database entities
- ✅ RESTful API design
- ✅ Comprehensive error handling
- ✅ Pagination support
- ✅ Advanced filtering and search
- ✅ Database partitioning for performance
- ✅ PostgreSQL with connection pooling

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v10 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup database**
   ```bash
   # Create PostgreSQL database and apply schema
   psql -U postgres -c "CREATE DATABASE nms_database;"
   psql -U postgres -d nms_database -f ../schema.sql
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

## Project Structure

```
naiss-backend/
├── controllers/          # Request handlers for each entity
├── services/            # Business logic and database operations
├── routes/              # API endpoint definitions
├── config/              # Database configuration
├── app.js               # Express app setup
├── server.js            # Server entry point
├── package.json         # Dependencies
├── .env.example         # Environment variables template
├── API_DOCUMENTATION.md # Complete API reference
├── CURL_EXAMPLES.md     # Example API calls
└── README.md            # This file
```

## Implemented Entities

### 1. Device Types
Database table: `device_types`
- Create, read, update, delete device types
- Query devices by type characteristics

### 2. Devices
Database table: `devices`
- Complete device management (CRUD)
- Filter by pole, switch, or device type
- Search by name, IP address, or MAC address

### 3. Poles
Database table: `poles`
- Manage utility poles
- Group by regulator or phase
- Track GPS coordinates and distances

### 4. Switches
Database table: `switches`
- Network switch management
- Support hierarchical switch relationships
- Track port utilization

### 5. Substations
Database table: `substations`
- Substation status monitoring
- Track equipment health (HT/LT panels, UPS, DG, transformer)

### 6. Voltage Regulators
Database table: `voltage_regulators`
- Monitor voltage regulation equipment
- Link to substations
- Track capacity and voltage metrics

### 7. Alarm Events
Database table: `alarm_events`
- Comprehensive alarm management
- Filter by device, severity, or event type
- Acknowledge alarms with user tracking
- Event types: DEVICE_DOWN, POWER_FAIL, LINK_DOWN, etc.
- Severity levels: CRITICAL, MAJOR, MINOR, INFO

### 8. Device Status Logs
Database table: `device_status_logs` (time-series, partitioned by month)
- Performance metrics: response time, packet loss, CPU, memory, temperature
- Latest status retrieval
- Average metrics calculation over time periods

### 9. Power Status Logs
Database table: `power_status_logs` (time-series, partitioned by month)
- Power availability tracking
- Voltage, current, frequency metrics
- Power outage detection
- Average metrics calculation

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint reference.

### Example Requests

#### Create Device Type
```bash
curl -X POST http://localhost:3000/api/device-types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Router",
    "category": "Network Equipment",
    "supports_ping": true,
    "supports_snmp": true,
    "requires_power": true
  }'
```

#### Get All Devices
```bash
curl http://localhost:3000/api/devices?limit=50&offset=0
```

#### Search Devices
```bash
curl http://localhost:3000/api/devices/search?q=Device-001
```

See [CURL_EXAMPLES.md](./CURL_EXAMPLES.md) for more examples.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### Error Response
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

## Pagination

All list endpoints support pagination:
- `limit`: Number of records (default: 100)
- `offset`: Starting position (default: 0)

Example: `GET /api/devices?limit=25&offset=50`

## Database Performance Features

1. **Partitioned Tables**: Time-series tables (device_status_logs, power_status_logs) are partitioned by month for better performance
2. **Indexed Columns**: Common query paths have database indexes
3. **Connection Pooling**: PostgreSQL connection pool for efficient resource usage
4. **Optimized Queries**: Services use efficient SQL with proper joins and filters

## Error Handling

The API implements comprehensive error handling:
- Input validation
- Resource not found handling
- Database constraint violations
- Connection error management

HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## Development

### Running the Server
```bash
npm start
```

### Health Check
```bash
curl http://localhost:3000/health
```

### Testing with Curl
See [CURL_EXAMPLES.md](./CURL_EXAMPLES.md) for comprehensive API testing examples.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify .env file contains correct credentials
- Check that database exists: `psql -U postgres -l | grep nms_database`
- Verify schema is loaded: `psql -U postgres -d nms_database -c "\dt"`

### Port Already in Use
- Change PORT in .env file
- Or kill process using port 3000: `lsof -ti:3000 | xargs kill -9`

### Missing Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- Authentication and authorization
- Request validation middleware
- Rate limiting
- API logging
- WebSocket support for real-time updates
- Data export (CSV, Excel)
- Advanced reporting

## License

ISC

## Support

For issues and questions, please check the API_DOCUMENTATION.md file or review the service implementations.
