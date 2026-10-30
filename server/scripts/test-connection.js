import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  
  // Look for scheme
  const schemeMatch = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
  if (!schemeMatch) return rawUri;
  
  const scheme = schemeMatch[1];
  const rest = schemeMatch[2];
  
  // Check if credentials exist: user:password@host...
  const atIndex = rest.lastIndexOf('@');
  if (atIndex === -1) return rawUri;
  
  const authPart = rest.substring(0, atIndex);
  let hostAndRest = rest.substring(atIndex + 1);
  
  const colonIndex = authPart.indexOf(':');
  if (colonIndex === -1) return rawUri;
  
  const rawUser = authPart.substring(0, colonIndex);
  const rawPass = authPart.substring(colonIndex + 1);
  
  // Safely URL-encode user and password
  const user = encodeURIComponent(decodeURIComponent(rawUser));
  const pass = encodeURIComponent(decodeURIComponent(rawPass));
  
  // Check if database name is provided
  // hostAndRest may be "cluster0.spoq4xe.mongodb.net" or "cluster0.spoq4xe.mongodb.net/" or "cluster0.spoq4xe.mongodb.net/dbname?options"
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

async function runTest() {
  const inputUri = process.env.MONGODB_URI || 'mongodb+srv://balamurugan:bala@2007@cluster0.spoq4xe.mongodb.net/';
  console.log('Original URI in .env:', inputUri.replace(/:([^@]+)@/, ':****@'));
  
  const sanitized = sanitizeMongoUri(inputUri);
  console.log('Sanitized URI:', sanitized.replace(/:([^@]+)@/, ':****@'));
  
  try {
    console.log('\nTesting Primary Connection (SRV)...');
    const conn = await mongoose.connect(sanitized, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected successfully via SRV to host:', conn.connection.host);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Collections in database', mongoose.connection.name, ':', collections.map(c => c.name));
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ SRV connection failed:', err.message);
  }

  try {
    console.log('\nTesting Direct Replica Set Connection...');
    const directUri = 'mongodb://balamurugan:bala%402007@ac-bmlex1m-shard-00-00.spoq4xe.mongodb.net:27017,ac-bmlex1m-shard-00-01.spoq4xe.mongodb.net:27017,ac-bmlex1m-shard-00-02.spoq4xe.mongodb.net:27017/college_management?ssl=true&replicaSet=atlas-gbyff1-shard-0&authSource=admin&retryWrites=true&w=majority';
    const conn2 = await mongoose.connect(directUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Direct Replica Set connected successfully to host:', conn2.connection.host);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Direct Replica Set failed:', err.message);
  }
}

runTest();
