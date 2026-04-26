# Database Setup Guide

This document provides detailed instructions for setting up the PostgreSQL database for the NMS Backend.

## Prerequisites

- PostgreSQL 10 or higher installed
- psql command-line client installed
- Basic understanding of SQL
- Database admin or superuser access

---

## Quick Setup

### 1. Create Database

```sql
CREATE DATABASE nms_database;
```

Using psql command line:
```bash
psql -U postgres -c "CREATE DATABASE nms_database;"
```

### 2. Apply Schema

Using the provided schema.sql file:
```bash
psql -U postgres -d nms_database -f schema.sql
```

### 3. Configure Backend

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=nms_database
DB_PASSWORD=your_password
DB_PORT=5432
PORT=3000
```

### 4. Start Server

```bash
npm start
```

---

## Detailed Database Schema

### Tables Overview

#### 1. device_types
Defines types of network devices supported in the system.

```sql
CREATE TABLE device_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    supports_ping BOOLEAN DEFAULT true,
    supports_snmp BOOLEAN DEFAULT false,
    requires_power BOOLEAN DEFAULT true,
    manufacturer_default VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features:**
- Unique device type names
- Capability flags (ping, SNMP support, power requirements)
- Automatically tracked creation time

---

#### 2. devices
Physical network devices in the system.

```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_type_id UUID NOT NULL REFERENCES device_types(id),
    pole_id UUID REFERENCES poles(id) ON DELETE SET NULL,
    switch_id UUID REFERENCES switches(id) ON DELETE SET NULL,
    device_name VARCHAR(100) UNIQUE NOT NULL,
    ip_address INET UNIQUE,
    mac_address VARCHAR(50),
    brand VARCHAR(50),
    model VARCHAR(50),
    serial_number VARCHAR(100),
    installation_date DATE,
    warranty_expiry DATE,
    vlan_id INTEGER,
    port_number VARCHAR(20),
    status BOOLEAN DEFAULT true,
    last_seen TIMESTAMP,
    location TEXT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features:**
- Unique device names and IP addresses
- References to device type (required)
- Optional references to pole and switch
- Warranty tracking
- Last seen timestamp for monitoring

---

#### 3. poles
Utility distribution poles in the network.

```sql
CREATE TABLE poles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pole_number VARCHAR(20) UNIQUE NOT NULL,
    location TEXT,
    regulator_id UUID REFERENCES voltage_regulators(id) ON DELETE SET NULL,
    phase VARCHAR(10),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    distance_from_previous DOUBLE PRECISION,
    installation_date DATE,
    status BOOLEAN DEFAULT true,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features:**
- Unique pole identification
- GPS coordinates (latitude/longitude)
- Phase identification (A, B, C)
- Distance tracking between poles
- Optional regulator association

---

#### 4. switches
Network switches in the infrastructure.

```sql
CREATE TABLE switches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    ip_address INET NOT NULL UNIQUE,
    mac_address VARCHAR(50),
    switch_type VARCHAR(20),
    location TEXT,
    pole_id UUID REFERENCES poles(id) ON DELETE SET NULL,
    parent_switch_id UUID REFERENCES switches(id) ON DELETE SET NULL,
    total_ports INTEGER,
    used_ports INTEGER,
    status BOOLEAN,
    last_seen TIMESTAMP,
    snmp_enabled BOOLEAN DEFAULT true,
    firmware_version VARCHAR(50),
    brand VARCHAR(50),
    model VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features:**
- Unique IP address per switch
- Hierarchical switch relationships (parent_switch_id)
- Port utilization tracking
- SNMP enablement flag
- Firmware version tracking

---

#### 5. substations
Power substations for centralized management.

```sql
CREATE TABLE substations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    location TEXT,
    ht_panel_status BOOLEAN,
    lt_panel_status BOOLEAN,
    ups_status BOOLEAN,
    dg_status BOOLEAN,
    transformer_status BOOLEAN,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features:**
- Equipment status tracking (HT, LT, UPS, DG, Transformer)
- Last updated timestamp
- Location tracking

---

#### 6. voltage_regulators
Voltage regulation equipment.

```sql
CREATE TABLE voltage_regulators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    substation_id UUID REFERENCES substations(id) ON DELETE CASCADE,
    name VARCHAR(50),
    input_voltage DOUBLE PRECISION,
    output_voltage DOUBLE PRECISION,
    capacity_kva DOUBLE PRECISION,
    status BOOLEAN,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features:**
- Voltage input/output tracking
- Capacity specification
- Linked to substations with cascade delete

---

#### 7. alarm_events
System alarms and events.

```sql
CREATE TABLE alarm_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    pole_id UUID REFERENCES poles(id) ON DELETE SET NULL,
    switch_id UUID REFERENCES switches(id) ON DELETE SET NULL,
    substation_id UUID REFERENCES substations(id) ON DELETE SET NULL,
    regulator_id UUID REFERENCES voltage_regulators(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    message TEXT,
    event_start TIMESTAMP NOT NULL,
    event_end TIMESTAMP,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(50),
    acknowledged_at TIMESTAMP,
    source VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints:**
```
event_type IN ('DEVICE_DOWN', 'DEVICE_UP', 'POWER_FAIL', 'POWER_RESTORE', 
               'SWITCH_DOWN', 'SWITCH_UP', 'LINK_DOWN', 'LINK_UP')
severity IN ('CRITICAL', 'MAJOR', 'MINOR', 'INFO')
status IN ('ACTIVE', 'CLEARED')
```

**Key Features:**
- Multi-reference capability (device OR pole OR switch, etc.)
- Event start/end timestamp tracking
- Acknowledgment with user tracking
- Predefined event types and severity levels

---

#### 8. device_status_logs
Device performance and health metrics (time-series, partitioned).

```sql
CREATE TABLE device_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    ping_status BOOLEAN,
    snmp_status BOOLEAN,
    response_time_ms DOUBLE PRECISION,
    packet_loss DOUBLE PRECISION,
    cpu_usage DOUBLE PRECISION,
    memory_usage DOUBLE PRECISION,
    temperature DOUBLE PRECISION,
    checked_at TIMESTAMP NOT NULL
)
PARTITION BY RANGE (checked_at);
```

**Partitions:**
- device_status_logs_y2026m05 - May 2026
- Additional partitions created automatically by function

**Key Features:**
- Partitioned by month for performance
- Includes health metrics (CPU, memory, temp)
- Network metrics (response time, packet loss)
- Cascade delete when device is removed

---

#### 9. power_status_logs
Power availability and quality metrics (time-series, partitioned).

```sql
CREATE TABLE power_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    substation_id UUID,
    regulator_id UUID,
    pole_id UUID,
    power_available BOOLEAN,
    voltage DOUBLE PRECISION,
    current DOUBLE PRECISION,
    frequency DOUBLE PRECISION,
    source VARCHAR(50),
    recorded_at TIMESTAMP NOT NULL
)
PARTITION BY RANGE (recorded_at);
```

**Partitions:**
- power_status_logs_y2026m04 - April 2026
- power_status_logs_default - Default partition
- Additional partitions created automatically

**Key Features:**
- Tracks power availability
- Voltage, current, frequency metrics
- Multiple source references
- Partitioned for efficient time-series queries

---

## Indexes

The schema includes indexes for performance optimization:

```sql
CREATE INDEX idx_alarm_active ON alarm_events(status);
CREATE INDEX idx_alarm_device ON alarm_events(device_id);
CREATE INDEX idx_alarm_time ON alarm_events(event_start DESC);
CREATE INDEX idx_devices_ip ON devices(ip_address);
CREATE INDEX idx_devices_pole ON devices(pole_id);
CREATE INDEX idx_devices_switch ON devices(switch_id);
CREATE INDEX idx_devices_type ON devices(device_type_id);
CREATE INDEX idx_power_logs_main ON power_status_logs_y2026m04(substation_id, regulator_id, recorded_at DESC);
```

---

## Foreign Key Relationships

```
device_types
    ↓
devices ← poles
    ↑        ↑
switches   voltage_regulators
    ↑        ↑
  pole_id   regulator_id
    
substations
    ↓
voltage_regulators
    ↓
poles

alarm_events (can reference any of the above)
device_status_logs → devices
power_status_logs → (substation_id, regulator_id, pole_id)
```

---

## Automatic Partition Creation

The schema includes a function for automatic partition creation:

```sql
CREATE FUNCTION create_next_month_partition() RETURNS void
```

This function automatically creates new partitions for the upcoming month.

---

## Data Integrity Constraints

### Unique Constraints
- device_types.name - Device type names must be unique
- devices.device_name - Device names must be unique
- devices.ip_address - IP addresses must be unique
- poles.pole_number - Pole numbers must be unique
- switches.ip_address - Switch IP addresses must be unique

### Check Constraints
- alarm_events.event_type - Limited to predefined event types
- alarm_events.severity - Limited to CRITICAL, MAJOR, MINOR, INFO
- alarm_events.status - Limited to ACTIVE, CLEARED

---

## Maintenance

### Vacuum
Regularly clean up database:
```sql
VACUUM ANALYZE;
```

### Backup
```bash
pg_dump -U postgres nms_database > backup.sql
```

### Restore
```bash
psql -U postgres -d nms_database < backup.sql
```

### Monitor Partitions
Check existing partitions:
```sql
SELECT schemaname, tablename FROM pg_tables 
WHERE tablename LIKE 'device_status_logs%' OR tablename LIKE 'power_status_logs%';
```

---

## Troubleshooting

### Issue: "EXTENSION uuid-ossp not found"
**Solution**: UUID extension not installed
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: Connection refused
**Solution**: PostgreSQL not running
```bash
# On Windows
net start PostgreSQL-x64-15

# On Mac
brew services start postgresql

# On Linux
sudo service postgresql start
```

### Issue: Permission denied
**Solution**: Insufficient user permissions
```sql
GRANT ALL PRIVILEGES ON DATABASE nms_database TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### Issue: Cannot insert - constraint violation
**Solution**: Check foreign key references
```sql
-- List all foreign keys
SELECT constraint_name, table_name FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';
```

---

## Connection Details for Backend

Update `.env` file with:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=nms_database
DB_PASSWORD=your_password
DB_PORT=5432
```

Backend will automatically:
- Create connection pool (max 10 connections)
- Handle connection errors
- Reuse connections efficiently

---

## Verification

After setup, verify everything is working:

```sql
-- Connect to database
psql -U postgres -d nms_database

-- List all tables
\dt

-- List indexes
\di

-- Check extensions
\dx

-- Verify partitions
SELECT schemaname, tablename FROM pg_tables 
WHERE tablename LIKE '%logs%';
```

---

## Performance Tips

1. **Monitor Partition Sizes**
   ```sql
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables WHERE tablename LIKE 'device_status_logs%';
   ```

2. **Analyze Query Plans**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM devices WHERE device_name = 'Device-001';
   ```

3. **Maintain Statistics**
   ```sql
   ANALYZE device_status_logs;
   ```

---

## Next Steps

1. ✅ Database created and schema applied
2. ✅ Backend environment configured
3. ✅ Start the backend server
4. ✅ Test API endpoints using CURL or Postman
5. ✅ Insert test data as needed

See [README.md](./README.md) and [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for next steps.
