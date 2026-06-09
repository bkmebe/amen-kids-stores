import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🚀 Amen Kids API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);

  // Keep-alive: ping self every 10 minutes to prevent Render sleep & Supabase pause
  if (env.NODE_ENV === 'production') {
    const KEEP_ALIVE_URL = `https://amen-kids-api.onrender.com/api/health`;
    setInterval(async () => {
      try {
        await fetch(KEEP_ALIVE_URL);
        console.log('♻️ Keep-alive ping sent');
      } catch (err) {
        console.error('♻️ Keep-alive ping failed:', err);
      }
    }, 10 * 60 * 1000); // every 10 minutes
    console.log('♻️ Keep-alive enabled (every 10 min)');
  }
});
