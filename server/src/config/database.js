import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Continue if custom DNS set is restricted
}

import mongoose from 'mongoose';

let memoryServer = null;

// Direct Atlas replica set connection string that bypasses DNS SRV queries completely
export const ATLAS_DIRECT_REPLICA_URI =
  'mongodb://balamurugan:bala%402007@ac-bmlex1m-shard-00-00.spoq4xe.mongodb.net:27017,ac-bmlex1m-shard-00-01.spoq4xe.mongodb.net:27017,ac-bmlex1m-shard-00-02.spoq4xe.mongodb.net:27017/college_management?ssl=true&replicaSet=atlas-gbyff1-shard-0&authSource=admin&retryWrites=true&w=majority';

/**
 * Sanitizes MongoDB URIs by safely URL-encoding username and password
 * (preventing crashes when passwords contain unescaped '@' characters),
 * and ensuring database name 'college_management' is present.
 */
export function sanitizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;

  const trimmed = rawUri.trim();
  const schemeMatch = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!schemeMatch) return trimmed;

  const scheme = schemeMatch[1];
  const rest = schemeMatch[2];

  // If there are credentials (user:password@host...)
  const atIndex = rest.lastIndexOf('@');
  if (atIndex === -1) return trimmed;

  const authPart = rest.substring(0, atIndex);
  const hostAndRest = rest.substring(atIndex + 1);

  const colonIndex = authPart.indexOf(':');
  if (colonIndex === -1) return trimmed;

  const rawUser = authPart.substring(0, colonIndex);
  const rawPass = authPart.substring(colonIndex + 1);

  // Decode first in case already partially encoded, then encode
  const user = encodeURIComponent(decodeURIComponent(rawUser));
  const pass = encodeURIComponent(decodeURIComponent(rawPass));

  let hostPart = hostAndRest;
  let dbPart = 'college_management';
  let queryPart = 'retryWrites=true&w=majority';

  if (hostAndRest.includes('/')) {
    const slashIdx = hostAndRest.indexOf('/');
    hostPart = hostAndRest.substring(0, slashIdx);
    const afterSlash = hostAndRest.substring(slashIdx + 1);

    if (afterSlash.includes('?')) {
      const qIdx = afterSlash.indexOf('?');
      const db = afterSlash.substring(0, qIdx).trim();
      if (db) dbPart = db;
      const q = afterSlash.substring(qIdx + 1).trim();
      if (q) queryPart = q;
    } else {
      const db = afterSlash.trim();
      if (db) dbPart = db;
    }
  } else if (hostAndRest.includes('?')) {
    const qIdx = hostAndRest.indexOf('?');
    hostPart = hostAndRest.substring(0, qIdx);
    queryPart = hostAndRest.substring(qIdx + 1).trim();
  }

  return `${scheme}${user}:${pass}@${hostPart}/${dbPart}?${queryPart}`;
}

const connectDB = async () => {
  const rawUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://balamurugan:bala%402007@cluster0.spoq4xe.mongodb.net/college_management?retryWrites=true&w=majority';

  const sanitizedUri = sanitizeMongoUri(rawUri);

  // Attempt 1: Connect via primary URI (SRV or direct)
  const MONGO_OPTIONS = {
    family: 4, // Force IPv4 to prevent ISP IPv6 middlebox SSL drops
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 1,
  };

  // Attempt 1: Connect via primary URI (SRV or direct)
  try {
    const conn = await mongoose.connect(sanitizedUri, MONGO_OPTIONS);

    console.log(`✅ MongoDB Atlas Connected! Host: ${conn.connection.host} (DB: ${conn.connection.name})`);
    await verifyAndSeedFreshDb();
    return conn;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection attempt failed: ${err.message}`);

    // Attempt 2: If primary was SRV and failed, try direct Atlas replica-set connection
    if (sanitizedUri.includes('cluster0.spoq4xe.mongodb.net')) {
      try {
        console.log('🔄 Attempting direct MongoDB Atlas replica-set connection (bypassing SRV DNS)...');
        const conn = await mongoose.connect(ATLAS_DIRECT_REPLICA_URI, MONGO_OPTIONS);

        console.log(`✅ MongoDB Atlas Connected directly via Replica Set! Host: ${conn.connection.host} (DB: ${conn.connection.name})`);
        await verifyAndSeedFreshDb();
        return conn;
      } catch (directErr) {
        console.warn(`⚠️ Direct Atlas replica-set attempt also failed: ${directErr.message}`);
      }
    }

    // Attempt 3: In-memory fallback if no internet or Atlas cluster unreachable
    console.log('💡 Initializing MongoDB Memory Server as seamless local fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { launchTimeout: 60000 },
      });
      const memoryUri = memoryServer.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${memoryUri}`);
      await verifyAndSeedFreshDb();
      return conn;
    } catch (memErr) {
      console.error('❌ Failed to launch in-memory MongoDB:', memErr.message);
      console.warn('⚠️ Server will run, but database operations may fail until MongoDB is accessible.');
    }
  }
};

async function verifyAndSeedFreshDb() {
  try {
    const User = (await import('../models/User.js')).default;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Populating fresh MongoDB database with sample academic seed data...');
      const { seed } = await import('../../scripts/seed.js');
      await seed(false);
    } else {
      console.log(`📊 Connected database contains ${userCount} registered user accounts.`);
    }
  } catch (seedErr) {
    console.warn('Note on auto-seed verification:', seedErr.message);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

export default connectDB;
