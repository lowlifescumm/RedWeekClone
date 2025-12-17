import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://ethanfitzhenry_db_user:6BuZiIKo4AtvRZlO@cluster0.cq9y4vu.mongodb.net/?appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
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
