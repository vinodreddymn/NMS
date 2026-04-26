# Network Management System (NMS) Backend API Documentation

This is a comprehensive backend API for a Network Management System built with Node.js, Express, and PostgreSQL.

## Setup Instructions

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment configuration**
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your PostgreSQL credentials
   ```bash
   cp .env.example .env
   ```

4. **Ensure PostgreSQL is running and database schema is applied**
   - Create the database using the provided `schema.sql`
   ```bash
   psql -U postgres -d nms_database -f ../schema.sql
   ```

5. **Start the server**
   ```bash
   node server.js
   ```

The server will start on `http://localhost:3000` (or the PORT specified in .env)

## Health Check
- **GET** `/health` - Check if server is running

---

## API Endpoints

### Device Types
- **POST** `/api/device-types` - Create a new device type
- **GET** `/api/device-types` - Get all device types (paginated)
- **GET** `/api/device-types/:id` - Get a specific device type
- **PUT** `/api/device-types/:id` - Update a device type
- **DELETE** `/api/device-types/:id` - Delete a device type

### Devices
- **POST** `/api/devices` - Create a new device
- **GET** `/api/devices` - Get all devices (paginated)
- **GET** `/api/devices/:id` - Get a specific device
- **GET** `/api/devices/by-pole/:poleId` - Get devices by pole
- **GET** `/api/devices/by-switch/:switchId` - Get devices by switch
- **GET** `/api/devices/by-type/:deviceTypeId` - Get devices by type
- **GET** `/api/devices/search?q=searchTerm` - Search devices by name, IP, or MAC
- **PUT** `/api/devices/:id` - Update a device
- **DELETE** `/api/devices/:id` - Delete a device

### Poles
- **POST** `/api/poles` - Create a new pole
- **GET** `/api/poles` - Get all poles (paginated)
- **GET** `/api/poles/:id` - Get a specific pole
- **GET** `/api/poles/by-regulator/:regulatorId` - Get poles by regulator
- **GET** `/api/poles/by-phase/:phase` - Get poles by phase
- **PUT** `/api/poles/:id` - Update a pole
- **DELETE** `/api/poles/:id` - Delete a pole

### Switches
- **POST** `/api/switches` - Create a new switch
- **GET** `/api/switches` - Get all switches (paginated)
- **GET** `/api/switches/:id` - Get a specific switch
- **GET** `/api/switches/by-pole/:poleId` - Get switches by pole
- **GET** `/api/switches/children/:parentId` - Get child switches
- **PUT** `/api/switches/:id` - Update a switch
- **DELETE** `/api/switches/:id` - Delete a switch

### Substations
- **POST** `/api/substations` - Create a new substation
- **GET** `/api/substations` - Get all substations (paginated)
- **GET** `/api/substations/:id` - Get a specific substation
- **PUT** `/api/substations/:id` - Update a substation
- **DELETE** `/api/substations/:id` - Delete a substation

### Voltage Regulators
- **POST** `/api/voltage-regulators` - Create a new voltage regulator
- **GET** `/api/voltage-regulators` - Get all voltage regulators (paginated)
- **GET** `/api/voltage-regulators/:id` - Get a specific voltage regulator
- **GET** `/api/voltage-regulators/by-substation/:substationId` - Get regulators by substation
- **PUT** `/api/voltage-regulators/:id` - Update a voltage regulator
- **DELETE** `/api/voltage-regulators/:id` - Delete a voltage regulator

### Alarm Events
- **POST** `/api/alarm-events` - Create a new alarm event
- **GET** `/api/alarm-events` - Get all alarm events (paginated)
- **GET** `/api/alarm-events/active` - Get active alarms only
- **GET** `/api/alarm-events/:id` - Get a specific alarm event
- **GET** `/api/alarm-events/by-device/:deviceId` - Get alarms by device
- **GET** `/api/alarm-events/by-severity/:severity` - Get alarms by severity
- **GET** `/api/alarm-events/by-type/:eventType` - Get alarms by event type
- **PUT** `/api/alarm-events/:id` - Update an alarm event
- **POST** `/api/alarm-events/:id/acknowledge` - Acknowledge an alarm
- **DELETE** `/api/alarm-events/:id` - Delete an alarm event

### Device Status Logs
- **POST** `/api/device-status-logs` - Create a new device status log
- **GET** `/api/device-status-logs` - Get all device status logs (paginated)
- **GET** `/api/device-status-logs/:id` - Get a specific device status log
- **GET** `/api/device-status-logs/by-device/:deviceId` - Get logs for a device
- **GET** `/api/device-status-logs/latest/:deviceId` - Get latest status for a device
- **GET** `/api/device-status-logs/date-range?startDate=DATE&endDate=DATE` - Get logs by date range
- **GET** `/api/device-status-logs/metrics/:deviceId?days=7` - Get average metrics
- **DELETE** `/api/device-status-logs/:id` - Delete a device status log

### Power Status Logs
- **POST** `/api/power-status-logs` - Create a new power status log
- **GET** `/api/power-status-logs` - Get all power status logs (paginated)
- **GET** `/api/power-status-logs/:id` - Get a specific power status log
- **GET** `/api/power-status-logs/by-substation/:substationId` - Get logs by substation
- **GET** `/api/power-status-logs/by-regulator/:regulatorId` - Get logs by regulator
- **GET** `/api/power-status-logs/by-pole/:poleId` - Get logs by pole
- **GET** `/api/power-status-logs/latest/:substationId` - Get latest power status
- **GET** `/api/power-status-logs/date-range?startDate=DATE&endDate=DATE` - Get logs by date range
- **GET** `/api/power-status-logs/outages` - Get power outage records
- **GET** `/api/power-status-logs/metrics/:substationId?days=7` - Get average metrics
- **DELETE** `/api/power-status-logs/:id` - Delete a power status log

---

## Request/Response Format

### Request Body Example (Device Creation)
```json
{
  "device_type_id": "uuid-here",
  "pole_id": "uuid-here",
  "switch_id": null,
  "device_name": "Device-001",
  "ip_address": "192.168.1.100",
  "mac_address": "00:11:22:33:44:55",
  "brand": "Cisco",
  "model": "C9300",
  "serial_number": "SN12345",
  "installation_date": "2024-01-15",
  "warranty_expiry": "2026-01-15",
  "vlan_id": 10,
  "port_number": "Eth0/1",
  "status": true,
  "location": "Building A",
  "remarks": "Main gateway device"
}
```

### Response Format
All endpoints return JSON with the following structure:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "limit": 100,
  "offset": 0,
  "total": 50
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Pagination

Use `limit` and `offset` query parameters to paginate results:
```
GET /api/devices?limit=50&offset=100
```

Default limit: 100
Default offset: 0

---

## Database Schema Tables

1. **device_types** - Device type definitions
2. **devices** - Physical network devices
3. **poles** - Utility poles
4. **switches** - Network switches
5. **substations** - Power substations
6. **voltage_regulators** - Voltage regulation equipment
7. **alarm_events** - System alarms and alerts
8. **device_status_logs** - Device health and performance logs (partitioned by date)
9. **power_status_logs** - Power status and metrics logs (partitioned by date)

---

## Error Handling

All errors are returned with appropriate HTTP status codes:
- `201` - Created (successful POST)
- `200` - OK (successful GET, PUT)
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Best Practices

1. Always validate input data before sending requests
2. Use pagination for large datasets
3. Include proper error handling on the client side
4. Use unique device names and IP addresses
5. Include meaningful remarks and location information
6. Regularly archive old log records for performance

---

## License

ISC
