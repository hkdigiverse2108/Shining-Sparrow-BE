require('dotenv').config()
import mongoose from 'mongoose';
import express from 'express'
import { config } from '../../../config';
const dbUrl: any = config.DB_URL;
const mongooseConnection = express()
mongoose.set('strictQuery', false)
mongoose.connect(
    dbUrl,
    {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
        socketTimeoutMS: 45000,         // Close inactive sockets after 45s
    }
).then(() => console.log('Database successfully connected')).catch(err => console.log(err));

export { mongooseConnection }