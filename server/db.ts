import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://ethanfitzhenry_db_user:6BuZiIKo4AtvRZlO@cluster0.cq9y4vu.mongodb.net/?appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let client: MongoClient | null = null;
let db: Db | null = null;

// MongoDB connection options with proper SSL/TLS configuration
const mongoOptions: MongoClientOptions = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  retryWrites: true,
  retryReads: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10,
  minPoolSize: 2,
};

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    // Ensure connection string has proper SSL parameters
    let connectionString = MONGODB_URI;
    if (!connectionString.includes('tls=true') && !connectionString.includes('ssl=true')) {
      // Add SSL parameter if not present
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString = `${connectionString}${separator}tls=true`;
    }

    client = new MongoClient(connectionString, mongoOptions);
    await client.connect();
    db = client.db('redweek_clone');
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Disconnected from MongoDB');
  }
}

// Initialize connection on import
let dbPromise: Promise<Db> | null = null;

export function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = connectToDatabase();
  }
  return dbPromise;
}
