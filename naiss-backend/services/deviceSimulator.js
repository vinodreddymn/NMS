const deviceStatusLogService = require('../services/deviceStatusLogService');
const pool = require('../config/db');

/* ============================================================
   UTIL FUNCTIONS
============================================================ */

function getRandomBoolean(trueProbability = 0.9) {
    return Math.random() < trueProbability;
}

function getRandomInRange(min, max) {
    return +(Math.random() * (max - min) + min).toFixed(2);
}

function generateDeviceMetrics() {
    const isOnline = getRandomBoolean(0.85);

    return {
        ping_status: isOnline,
        snmp_status: isOnline ? getRandomBoolean(0.95) : false,
        response_time_ms: isOnline ? getRandomInRange(5, 200) : null,
        packet_loss: isOnline ? getRandomInRange(0, 5) : 100,
        cpu_usage: isOnline ? getRandomInRange(10, 90) : null,
        memory_usage: isOnline ? getRandomInRange(20, 95) : null,
        temperature: isOnline ? getRandomInRange(30, 80) : null
    };
}

/* ============================================================
   MAIN SIMULATOR
============================================================ */

async function insertDeviceLogs() {
    try {
        const devicesResult = await pool.query(`SELECT id FROM devices`);
        const devices = devicesResult.rows;

        if (devices.length === 0) {
            console.log("⚠️ No devices found in database");
            return;
        }

        const now = new Date();

        for (const device of devices) {
            const metrics = generateDeviceMetrics();

            // ✅ USE SERVICE (THIS TRIGGERS ALARMS)
            await deviceStatusLogService.create({
                device_id: device.id,
                ping_status: metrics.ping_status,
                snmp_status: metrics.snmp_status,
                response_time_ms: metrics.response_time_ms,
                packet_loss: metrics.packet_loss,
                cpu_usage: metrics.cpu_usage,
                memory_usage: metrics.memory_usage,
                temperature: metrics.temperature,
                checked_at: now
            });
        }

        console.log(`✅ Logs + Alarm Engine executed for ${devices.length} devices at ${now.toLocaleTimeString()}`);

    } catch (error) {
        console.error("❌ Error inserting device logs:", error.message);
    }
}

/* ============================================================
   RUNNER
============================================================ */

function startSimulator() {
    console.log("🚀 Device Simulator Started (Every 30s)");

    insertDeviceLogs();
    setInterval(insertDeviceLogs, 30000);
}

module.exports = { startSimulator };

if (require.main === module) {
    startSimulator();
}