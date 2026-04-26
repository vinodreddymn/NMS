# Quick Reference Guide

## 🚀 Getting Started (5 minutes)

### 1. Prerequisites
```bash
# Check Node.js is installed
node --version  # v14+
npm --version   # v6+

# Check PostgreSQL is running
psql --version  # v10+
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE nms_database;"

# Apply schema
psql -U postgres -d nms_database -f ../schema.sql
```

### 4. Configure Environment
```bash
# Create .env from template
cp .env.example .env

# Edit .env with your database credentials:
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=nms_database
```

### 5. Start Server
```bash
npm start
```

### 6. Test Health Check
```bash
curl http://localhost:3000/health
```

**✅ You're ready to use the API!**

---

## 📡 Common API Calls

### Get All Devices
```bash
curl http://localhost:3000/api/devices?limit=10
```

### Create New Device
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "device_type_id": "UUID",
    "device_name": "Device-001",
    "ip_address": "192.168.1.100",
    "status": true
  }'
```

### Update Device
```bash
curl -X PUT http://localhost:3000/api/devices/{ID} \
  -H "Content-Type: application/json" \
  -d '{"status": false}'
```

### Delete Device
```bash
curl -X DELETE http://localhost:3000/api/devices/{ID}
```

### Search Devices
```bash
curl http://localhost:3000/api/devices/search?q=Device-001
```

### Get Active Alarms
```bash
curl http://localhost:3000/api/alarm-events/active
```

### Acknowledge Alarm
```bash
curl -X POST http://localhost:3000/api/alarm-events/{ID}/acknowledge \
  -H "Content-Type: application/json" \
  -d '{"acknowledged_by": "admin@example.com"}'
```

---

## 📊 Entity Overview

| Entity | Count | Key Fields |
|--------|-------|-----------|
| Device Types | - | name, category, supports_ping |
| Devices | - | device_name, ip_address, mac_address |
| Poles | - | pole_number, location, phase |
| Switches | - | name, ip_address, total_ports |
| Substations | - | name, location, ups_status |
| Regulators | - | name, input_voltage, output_voltage |
| Alarms | - | event_type, severity, status |
| Device Logs | - | device_id, response_time_ms, cpu_usage |
| Power Logs | - | power_available, voltage, current |

---

## 🔧 Project Structure

```
services/          → Database operations (9 files)
controllers/       → Request handling (9 files)
routes/           → API endpoints (9 files)
config/           → Database config
app.js            → Express setup
server.js         → Entry point
```

---

## 📖 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| README.md | Overview and setup |
| API_DOCUMENTATION.md | Complete endpoint reference |
| CURL_EXAMPLES.md | 70+ testing examples |
| IMPLEMENTATION_GUIDE.md | Architecture details |
| DATABASE_SETUP.md | Database configuration |
| COMPLETION_SUMMARY.md | Implementation summary |

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check Node version
node --version

# Check if port 3000 is available
lsof -i :3000

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres -l

# Check .env credentials
cat .env

# Test connection manually
psql -U postgres -h localhost -d nms_database
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ API Response Examples

### Success Response
```json
{
  "success": true,
  "data": [...],
  "total": 50,
  "limit": 10,
  "offset": 0
}
```

### Error Response
```json
{
  "success": false,
  "error": "Device not found"
}
```

---

## 🎯 Typical Workflow

1. **Create Device Type**
   ```bash
   POST /api/device-types
   ```

2. **Create Pole**
   ```bash
   POST /api/poles
   ```

3. **Create Device**
   ```bash
   POST /api/devices (with device_type_id, pole_id)
   ```

4. **Create Alarm**
   ```bash
   POST /api/alarm-events (with device_id)
   ```

5. **Log Device Status**
   ```bash
   POST /api/device-status-logs (with device_id)
   ```

---

## 🔒 Important Constraints

### Unique Fields
- device_types.name
- devices.device_name
- devices.ip_address
- poles.pole_number
- switches.ip_address

### Required Fields
- device_type_id (in devices)
- pole_number (in poles)
- device_name (in devices)
- ip_address (in switches)

### Enum Values
- event_type: DEVICE_DOWN, DEVICE_UP, POWER_FAIL, POWER_RESTORE, etc.
- severity: CRITICAL, MAJOR, MINOR, INFO
- status: ACTIVE, CLEARED

---

## 📊 Pagination Guide

All list endpoints support pagination:

```bash
# Get first 10 records
curl http://localhost:3000/api/devices?limit=10&offset=0

# Get next 10 records
curl http://localhost:3000/api/devices?limit=10&offset=10

# Get all records
curl http://localhost:3000/api/devices?limit=1000
```

---

## 🚦 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

---

## 💡 Pro Tips

1. **Use jq for pretty output**
   ```bash
   curl http://localhost:3000/api/devices | jq
   ```

2. **Save response to file**
   ```bash
   curl http://localhost:3000/api/devices > devices.json
   ```

3. **Check response headers**
   ```bash
   curl -i http://localhost:3000/api/devices
   ```

4. **Use environment variables**
   ```bash
   BASE_URL=http://localhost:3000
   curl $BASE_URL/api/devices
   ```

---

## 📝 Notes

- All timestamps are UTC
- IDs are UUIDs (128-bit)
- Pagination default: limit=100, offset=0
- CORS is enabled
- Connection pool max: 10

---

## 🆘 Getting Help

1. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
2. Check [CURL_EXAMPLES.md](./CURL_EXAMPLES.md) for testing examples
3. Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for architecture
4. Review server logs for error messages
5. Check database logs: `psql -U postgres -d nms_database`

---

## 🎓 Learning Path

1. ✅ Setup project (this document)
2. ✅ Test health check
3. ✅ Create test data
4. ✅ Query data with different filters
5. ✅ Update records
6. ✅ Delete records
7. ✅ Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
8. ✅ Read [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

---

**Version**: 1.0.0  
**Last Updated**: April 26, 2024  
**Status**: ✅ Production Ready
