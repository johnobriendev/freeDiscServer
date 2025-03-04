// src/server.ts

import dotenv from 'dotenv';
import app from './app';
import config from './config/environment';


// Load environment variables
dotenv.config();

const PORT = config.port;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});