# API Testing Examples - Using cURL

This file contains practical cURL examples for testing all API endpoints.

## Base URL
Replace `http://localhost:3000` with your actual server URL.

---

## Health Check

```bash
curl http://localhost:3000/health
```

---

## Device Types - CRUD

### Create Device Type
```bash
curl -X POST http://localhost:3000/api/device-types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Router",
    "category": "Network Equipment",
    "description": "Enterprise network router",
    "supports_ping": true,
    "supports_snmp": true,
    "requires_power": true,
    "manufacturer_default": "Cisco"
  }'
```

### Get All Device Types
```bash
curl http://localhost:3000/api/device-types?limit=10&offset=0
```

### Get Device Type by ID
```bash
curl http://localhost:3000/api/device-types/{device-type-id}
```

### Update Device Type
```bash
curl -X PUT http://localhost:3000/api/device-types/{device-type-id} \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "supports_snmp": false
  }'
```

### Delete Device Type
```bash
curl -X DELETE http://localhost:3000/api/device-types/{device-type-id}
```

---

## Devices - CRUD

### Create Device
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "device_type_id": "device-type-uuid",
    "pole_id": null,
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
  }'
```

### Get All Devices
```bash
curl http://localhost:3000/api/devices?limit=50&offset=0
```

### Get Device by ID
```bash
curl http://localhost:3000/api/devices/{device-id}
```

### Search Devices
```bash
curl http://localhost:3000/api/devices/search?q=Device-001&limit=10
```

### Get Devices by Pole
```bash
curl http://localhost:3000/api/devices/by-pole/{pole-id}?limit=20&offset=0
```

### Get Devices by Device Type
```bash
curl http://localhost:3000/api/devices/by-type/{device-type-id}?limit=20
```

### Update Device
```bash
curl -X PUT http://localhost:3000/api/devices/{device-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": false,
    "remarks": "Device under maintenance"
  }'
```

### Delete Device
```bash
curl -X DELETE http://localhost:3000/api/devices/{device-id}
```

---

## Poles - CRUD

### Create Pole
```bash
curl -X POST http://localhost:3000/api/poles \
  -H "Content-Type: application/json" \
  -d '{
    "pole_number": "POLE-001",
    "location": "Main Street, Area-1",
    "regulator_id": null,
    "phase": "A",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "distance_from_previous": 50.5,
    "installation_date": "2024-01-01",
    "status": true,
    "remarks": "Primary distribution pole"
  }'
```

### Get All Poles
```bash
curl http://localhost:3000/api/poles?limit=50&offset=0
```

### Get Pole by ID
```bash
curl http://localhost:3000/api/poles/{pole-id}
```

### Get Poles by Phase
```bash
curl http://localhost:3000/api/poles/by-phase/A?limit=20
```

### Update Pole
```bash
curl -X PUT http://localhost:3000/api/poles/{pole-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": false,
    "remarks": "Pole under maintenance"
  }'
```

### Delete Pole
```bash
curl -X DELETE http://localhost:3000/api/poles/{pole-id}
```

---

## Switches - CRUD

### Create Switch
```bash
curl -X POST http://localhost:3000/api/switches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Switch-001",
    "ip_address": "192.168.1.50",
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "switch_type": "L3",
    "location": "Server Room",
    "pole_id": null,
    "parent_switch_id": null,
    "total_ports": 48,
    "used_ports": 32,
    "status": true,
    "snmp_enabled": true,
    "firmware_version": "16.12.04",
    "brand": "Cisco",
    "model": "Catalyst 2960X"
  }'
```

### Get All Switches
```bash
curl http://localhost:3000/api/switches?limit=20&offset=0
```

### Get Switch by ID
```bash
curl http://localhost:3000/api/switches/{switch-id}
```

### Get Switches by Pole
```bash
curl http://localhost:3000/api/switches/by-pole/{pole-id}
```

### Get Child Switches
```bash
curl http://localhost:3000/api/switches/children/{parent-switch-id}
```

### Update Switch
```bash
curl -X PUT http://localhost:3000/api/switches/{switch-id} \
  -H "Content-Type: application/json" \
  -d '{
    "used_ports": 35,
    "status": true
  }'
```

### Delete Switch
```bash
curl -X DELETE http://localhost:3000/api/switches/{switch-id}
```

---

## Substations - CRUD

### Create Substation
```bash
curl -X POST http://localhost:3000/api/substations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Substation-001",
    "location": "Downtown Area",
    "ht_panel_status": true,
    "lt_panel_status": true,
    "ups_status": true,
    "dg_status": true,
    "transformer_status": true
  }'
```

### Get All Substations
```bash
curl http://localhost:3000/api/substations?limit=20&offset=0
```

### Get Substation by ID
```bash
curl http://localhost:3000/api/substations/{substation-id}
```

### Update Substation
```bash
curl -X PUT http://localhost:3000/api/substations/{substation-id} \
  -H "Content-Type: application/json" \
  -d '{
    "dg_status": false,
    "ups_status": true
  }'
```

### Delete Substation
```bash
curl -X DELETE http://localhost:3000/api/substations/{substation-id}
```

---

## Voltage Regulators - CRUD

### Create Voltage Regulator
```bash
curl -X POST http://localhost:3000/api/voltage-regulators \
  -H "Content-Type: application/json" \
  -d '{
    "substation_id": "substation-uuid",
    "name": "Regulator-A",
    "input_voltage": 440.0,
    "output_voltage": 415.0,
    "capacity_kva": 100.0,
    "status": true
  }'
```

### Get All Voltage Regulators
```bash
curl http://localhost:3000/api/voltage-regulators?limit=20&offset=0
```

### Get Regulator by ID
```bash
curl http://localhost:3000/api/voltage-regulators/{regulator-id}
```

### Get Regulators by Substation
```bash
curl http://localhost:3000/api/voltage-regulators/by-substation/{substation-id}
```

### Update Voltage Regulator
```bash
curl -X PUT http://localhost:3000/api/voltage-regulators/{regulator-id} \
  -H "Content-Type: application/json" \
  -d '{
    "output_voltage": 420.0,
    "status": true
  }'
```

### Delete Voltage Regulator
```bash
curl -X DELETE http://localhost:3000/api/voltage-regulators/{regulator-id}
```

---

## Alarm Events - CRUD

### Create Alarm Event
```bash
curl -X POST http://localhost:3000/api/alarm-events \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "device-uuid",
    "pole_id": null,
    "switch_id": null,
    "substation_id": null,
    "regulator_id": null,
    "event_type": "DEVICE_DOWN",
    "severity": "CRITICAL",
    "status": "ACTIVE",
    "message": "Device is not responding to ping",
    "event_start": "2024-04-26T10:30:00Z",
    "event_end": null,
    "source": "monitoring-system"
  }'
```

### Get All Alarm Events
```bash
curl http://localhost:3000/api/alarm-events?limit=50&offset=0
```

### Get Active Alarms Only
```bash
curl http://localhost:3000/api/alarm-events/active?limit=20
```

### Get Alarm by ID
```bash
curl http://localhost:3000/api/alarm-events/{alarm-id}
```

### Get Alarms by Device
```bash
curl http://localhost:3000/api/alarm-events/by-device/{device-id}?limit=20
```

### Get Alarms by Severity
```bash
curl http://localhost:3000/api/alarm-events/by-severity/CRITICAL
```

### Get Alarms by Event Type
```bash
curl http://localhost:3000/api/alarm-events/by-type/DEVICE_DOWN
```

### Update Alarm Event
```bash
curl -X PUT http://localhost:3000/api/alarm-events/{alarm-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CLEARED",
    "event_end": "2024-04-26T11:30:00Z"
  }'
```

### Acknowledge Alarm
```bash
curl -X POST http://localhost:3000/api/alarm-events/{alarm-id}/acknowledge \
  -H "Content-Type: application/json" \
  -d '{
    "acknowledged_by": "admin@company.com"
  }'
```

### Delete Alarm Event
```bash
curl -X DELETE http://localhost:3000/api/alarm-events/{alarm-id}
```

---

## Device Status Logs - CRUD

### Create Device Status Log
```bash
curl -X POST http://localhost:3000/api/device-status-logs \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "device-uuid",
    "ping_status": true,
    "snmp_status": true,
    "response_time_ms": 25.5,
    "packet_loss": 0.0,
    "cpu_usage": 45.2,
    "memory_usage": 62.8,
    "temperature": 38.5,
    "checked_at": "2024-04-26T10:30:00Z"
  }'
```

### Get All Device Status Logs
```bash
curl http://localhost:3000/api/device-status-logs?limit=50&offset=0
```

### Get Device Status Log by ID
```bash
curl http://localhost:3000/api/device-status-logs/{log-id}
```

### Get Logs for Specific Device
```bash
curl http://localhost:3000/api/device-status-logs/by-device/{device-id}?limit=100&offset=0
```

### Get Latest Status for Device
```bash
curl http://localhost:3000/api/device-status-logs/latest/{device-id}
```

### Get Logs by Date Range
```bash
curl "http://localhost:3000/api/device-status-logs/date-range?startDate=2024-04-20&endDate=2024-04-26&limit=100"
```

### Get Average Metrics (Last 7 Days)
```bash
curl http://localhost:3000/api/device-status-logs/metrics/{device-id}?days=7
```

### Delete Device Status Log
```bash
curl -X DELETE http://localhost:3000/api/device-status-logs/{log-id}
```

---

## Power Status Logs - CRUD

### Create Power Status Log
```bash
curl -X POST http://localhost:3000/api/power-status-logs \
  -H "Content-Type: application/json" \
  -d '{
    "substation_id": "substation-uuid",
    "regulator_id": null,
    "pole_id": null,
    "power_available": true,
    "voltage": 415.5,
    "current": 150.2,
    "frequency": 50.05,
    "source": "main-grid",
    "recorded_at": "2024-04-26T10:30:00Z"
  }'
```

### Get All Power Status Logs
```bash
curl http://localhost:3000/api/power-status-logs?limit=50&offset=0
```

### Get Power Status Log by ID
```bash
curl http://localhost:3000/api/power-status-logs/{log-id}
```

### Get Logs by Substation
```bash
curl http://localhost:3000/api/power-status-logs/by-substation/{substation-id}?limit=100
```

### Get Logs by Regulator
```bash
curl http://localhost:3000/api/power-status-logs/by-regulator/{regulator-id}?limit=100
```

### Get Logs by Pole
```bash
curl http://localhost:3000/api/power-status-logs/by-pole/{pole-id}?limit=100
```

### Get Latest Power Status
```bash
curl http://localhost:3000/api/power-status-logs/latest/{substation-id}
```

### Get Logs by Date Range
```bash
curl "http://localhost:3000/api/power-status-logs/date-range?startDate=2024-04-20&endDate=2024-04-26&limit=100"
```

### Get Power Outage Records
```bash
curl http://localhost:3000/api/power-status-logs/outages?limit=50&offset=0
```

### Get Average Metrics (Last 7 Days)
```bash
curl http://localhost:3000/api/power-status-logs/metrics/{substation-id}?days=7
```

### Delete Power Status Log
```bash
curl -X DELETE http://localhost:3000/api/power-status-logs/{log-id}
```

---

## Testing Tips

1. **Store IDs for Testing**: After creating resources, save the returned IDs for use in subsequent requests
   
2. **Use Pretty JSON Output**: Pipe cURL output to `jq` for better readability:
   ```bash
   curl http://localhost:3000/api/devices | jq
   ```

3. **Save cURL Responses**: Save response to file:
   ```bash
   curl http://localhost:3000/api/devices > devices.json
   ```

4. **Test with Data**: Create some test data before running GET requests

5. **Check Headers**: View response headers:
   ```bash
   curl -i http://localhost:3000/api/devices
   ```

---

## Common Issues

- If getting 404 errors, verify the API server is running
- If getting 400 errors, check JSON syntax in POST/PUT requests
- If getting 500 errors, check server logs
- For connection refused errors, ensure server is running on correct port

---
