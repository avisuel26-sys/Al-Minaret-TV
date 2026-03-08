import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const publicDir = path.join(process.cwd(), 'public');

  // Explicitly serve manifest.json with correct content type
  app.get('/manifest.json', (req, res) => {
    const manifestPath = path.join(publicDir, 'manifest.json');
    console.log(`Serving manifest from: ${manifestPath}`);
    res.sendFile(manifestPath, {
      headers: {
        'Content-Type': 'application/manifest+json',
      },
    }, (err) => {
      if (err) {
        console.error('Error serving manifest.json:', err);
        res.status(404).send('Manifest not found');
      }
    });
  });

  // Explicitly serve icons with correct content type to fix PWABuilder issues
  app.get('/icons/:iconName', (req, res) => {
    const iconPath = path.join(publicDir, 'icons', req.params.iconName);
    res.sendFile(iconPath, {
      headers: {
        'Content-Type': 'image/png',
      },
    }, (err) => {
      if (err) {
        console.error(`Error serving icon ${req.params.iconName}:`, err);
        res.status(404).send('Icon not found');
      }
    });
  });

  // Serve static files from public directory explicitly
  app.use(express.static(publicDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
