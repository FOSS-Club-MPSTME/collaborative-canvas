require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  try {
    const activePainting = db.prepare("SELECT * FROM paintings WHERE status = 'active'").get();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      activePainting: activePainting ? activePainting.name : 'None'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Serve built React static files in production / offline mode
const staticPath = path.join(__dirname, '../client/dist');
app.use(express.static(staticPath));

// Fallback all non-API requests to React app router
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(staticPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Collaborative Canvas Server</title></head>
        <body style="font-family: sans-serif; padding: 2rem; background: #111; color: #eee;">
          <h2>Collaborative Pixel Canvas Server</h2>
          <p>API status: <strong>Online</strong></p>
          <p>Client build not found yet at <code>client/dist</code>. Run <code>npm run build</code> to compile frontend assets.</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(` Pixel Canvas Server running at http://${HOST}:${PORT}`);
  console.log(` Local Network Access: http://<YOUR-LOCAL-IP>:${PORT}`);
  console.log(`====================================================`);
});
