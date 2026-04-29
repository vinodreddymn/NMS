const alarmEventService = require('../services/alarmEventService');

class AlarmEventController {

  /* ============================================================
     HELPERS
  ============================================================ */

  _parsePagination = (query) => {
    return {
      limit: Number.isFinite(+query.limit) ? +query.limit : 100,
      offset: Number.isFinite(+query.offset) ? +query.offset : 0
    };
  };

  _error = (res, message = 'Internal Server Error', code = 500) => {
    return res.status(code).json({
      success: false,
      error: message
    });
  };

  /* ============================================================
     CREATE
  ============================================================ */

  create = async (req, res) => {
    try {
      const { device_id, event_type } = req.body;

      if (!device_id || !event_type) {
        return this._error(res, 'device_id and event_type are required', 400);
      }

      const result = await alarmEventService.create(req.body);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  /* ============================================================
     ACTIVE (DEFAULT VIEW)
  ============================================================ */

  getActive = async (req, res) => {
    try {
      const { limit, offset } = this._parsePagination(req.query);

      const [data, count] = await Promise.all([
        alarmEventService.getActive(limit, offset),
        alarmEventService.getActiveCount()
      ]);

      return res.json({
        success: true,
        data,
        total: count,
        limit,
        offset
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  /* ============================================================
     HISTORY
  ============================================================ */

  getAll = async (req, res) => {
    try {
      const { limit, offset } = this._parsePagination(req.query);

      const data = await alarmEventService.getAll(limit, offset);

      return res.json({
        success: true,
        data,
        limit,
        offset
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  getById = async (req, res) => {
    try {
      const data = await alarmEventService.getById(req.params.id);

      if (!data) {
        return this._error(res, 'Alarm not found', 404);
      }

      return res.json({
        success: true,
        data
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  /* ============================================================
     FILTERS
  ============================================================ */

  getByDeviceId = async (req, res) => {
    try {
      const { limit, offset } = this._parsePagination(req.query);

      const data = await alarmEventService.getByDeviceId(
        req.params.deviceId,
        limit,
        offset
      );

      return res.json({
        success: true,
        data,
        limit,
        offset
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  getBySeverity = async (req, res) => {
    try {
      const { limit, offset } = this._parsePagination(req.query);

      const data = await alarmEventService.getBySeverity(
        req.params.severity,
        limit,
        offset
      );

      return res.json({
        success: true,
        data,
        limit,
        offset
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  getByEventType = async (req, res) => {
    try {
      const { limit, offset } = this._parsePagination(req.query);

      const data = await alarmEventService.getByEventType(
        req.params.eventType,
        limit,
        offset
      );

      return res.json({
        success: true,
        data,
        limit,
        offset
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  /* ============================================================
     ACTIONS
  ============================================================ */

  acknowledge = async (req, res) => {
    try {
      const { acknowledged_by } = req.body;

      if (!acknowledged_by) {
        return this._error(res, 'acknowledged_by is required', 400);
      }

      const result = await alarmEventService.acknowledge(
        req.params.id,
        acknowledged_by
      );

      if (!result) {
        return this._error(res, 'Alarm not found', 404);
      }

      return res.json({
        success: true,
        data: result,
        message: 'Alarm acknowledged'
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  clear = async (req, res) => {
    try {
      const result = await alarmEventService.clearAlarm(req.params.id);

      if (!result) {
        return this._error(res, 'Active alarm not found', 404);
      }

      return res.json({
        success: true,
        data: result,
        message: 'Alarm cleared'
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  /* ============================================================
     UPDATE
  ============================================================ */

  update = async (req, res) => {
    try {
      const result = await alarmEventService.update(
        req.params.id,
        req.body
      );

      if (!result) {
        return this._error(res, 'Alarm not found', 404);
      }

      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };

  /* ============================================================
     DELETE
  ============================================================ */

  delete = async (req, res) => {
    try {
      const result = await alarmEventService.delete(req.params.id);

      if (!result) {
        return this._error(res, 'Alarm not found', 404);
      }

      return res.json({
        success: true,
        data: result,
        message: 'Alarm deleted'
      });
    } catch (err) {
      console.error(err);
      return this._error(res);
    }
  };
}

module.exports = new AlarmEventController();