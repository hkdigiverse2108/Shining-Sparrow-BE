require('dotenv').config()
import mongoose from 'mongoose';
import express from 'express'
import { config } from '../../../config';
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"])
const dbUrl: any = config.DB_URL;
const mongooseConnection = express()
mongoose.set('strictQuery', false)
mongoose.connect(
    dbUrl,
    {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
        socketTimeoutMS: 45000,         // Close inactive sockets after 45s
        connectTimeoutMS: 10000,        // Connection timeout
        heartbeatFrequencyMS: 10000,    // Periodically check MongoDB status
        maxPoolSize: 50,                // Connection pool size
    }
).then(() => console.log('Database successfully connected')).catch(err => console.log('Database connection error:', err));

mongoose.connection.on('error', err => {
    console.error('MongoDB runtime connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost. Auto-reconnecting...');
});

export { mongooseConnection }