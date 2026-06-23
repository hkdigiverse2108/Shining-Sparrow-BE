require('dotenv').config();
import mongoose from 'mongoose';
import { settingsModel } from './database/models/settings';

async function run() {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error('DB_URL is not defined in .env');
    return;
  }
  await mongoose.connect(dbUrl);
  console.log('Connected to DB');
  const settings = await settingsModel.findOne({ isDeleted: false });
  console.log('Current settings in DB:', settings);
  await mongoose.disconnect();
}

run().catch(console.error);
