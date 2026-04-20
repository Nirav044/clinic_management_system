#!/usr/bin/env node
/**
 * Development startup script that loads environment variables
 * and starts both frontend and backend servers
 */
import { spawn } from 'child_process';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables from Vercel's env file
const envPaths = [
    '/vercel/share/.env.project',
    '/vercel/share/.env.snowflake'
];

envPaths.forEach(envPath => {
    if (existsSync(envPath)) {
        config({ path: envPath });
        console.log(`Loaded env from: ${envPath}`);
    }
});

// Also load local .env if it exists
if (existsSync('.env')) {
    config();
    console.log('Loaded local .env');
}

console.log('\n--- Starting SmartClinic Development Servers ---\n');

// Start the backend server
const backend = spawn('node', ['backend/server.js'], {
    env: process.env,
    stdio: 'inherit',
    cwd: process.cwd()
});

// Give backend a moment to start, then start frontend
setTimeout(() => {
    const frontend = spawn('npx', ['vite'], {
        env: process.env,
        stdio: 'inherit',
        cwd: process.cwd()
    });

    frontend.on('error', (err) => {
        console.error('Frontend error:', err);
    });
}, 2000);

backend.on('error', (err) => {
    console.error('Backend error:', err);
});

// Handle cleanup
process.on('SIGINT', () => {
    backend.kill();
    process.exit();
});
