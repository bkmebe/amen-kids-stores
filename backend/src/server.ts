import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🚀 Amen Kids API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
});
