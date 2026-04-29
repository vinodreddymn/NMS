const express = require('express');
const cors = require('cors');

const app = express();

// Import all routes
const deviceTypeRoutes = require('./routes/deviceTypeRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const poleRoutes = require('./routes/poleRoutes');
const switchRoutes = require('./routes/switchRoutes');
const substationRoutes = require('./routes/substationRoutes');
const voltageRegulatorRoutes = require('./routes/voltageRegulatorRoutes');
const alarmEventRoutes = require('./routes/alarmEventRoutes');
const deviceStatusLogRoutes = require('./routes/deviceStatusLogRoutes');
const powerStatusLogRoutes = require('./routes/powerStatusLogRoutes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
app.use('/api', deviceTypeRoutes);
app.use('/api', deviceRoutes);
app.use('/api', poleRoutes);
app.use('/api', switchRoutes);
app.use('/api', substationRoutes);
app.use('/api', voltageRegulatorRoutes);
app.use('/api/alarm-events', alarmEventRoutes);
app.use('/api', deviceStatusLogRoutes);
app.use('/api', powerStatusLogRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

module.exports = app;



