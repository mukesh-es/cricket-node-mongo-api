const express = require('express');
const router = express.Router();
const path = require('path');
const generalController = require('../controllers/generalController');
const apiCache = require('../middlewares/apiCache');
const fs = require('fs');

// GET
router.get('/', apiCache(), generalController.config);
router.get('/changelogs', apiCache(), generalController.fieldData);

// POST
router.post('/matchpicks', generalController.apiCall);


// Logs file
router.get(/^\/logs\/(.+)/, async (req, res) => {
  const requestedPath = req.params[0];
  const baseLogDir = path.join(__dirname, '..', 'logs');
  const filePath = path.join(baseLogDir, requestedPath);
  if (!filePath.startsWith(baseLogDir)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  let content;
  try {
    content = await fs.promises.readFile(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Failed to read file' });
  }

  const lines = content.trim().split('\n').filter(Boolean);

  const logs = lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (e) {
      // Don't crash the whole response
      return {
        _invalid: true,
        line: index + 1,
        raw: line.substring(0, 200) + (line.length > 200 ? '…' : ''),
        error: 'Invalid JSON'
      };
    }
  });

  res.json(logs);
});

module.exports = router;