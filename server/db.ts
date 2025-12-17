import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://ethanfitzhenry_db_user:bDDTtKUKfXNTN7qZ@cluster0.cq9y4vu.mongodb.net/?appName=Cluster0';

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let client: MongoClient | null = null;
let db: Db | null = null;

// MongoDB connection options for Atlas
// Note: mongodb+srv:// automatically enables TLS, so we don't set tls explicitly
const mongoOptions: MongoClientOptions = {
  retryWrites: true,
  retryReads: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 10,
  minPoolSize: 1,
  // Don't set directConnection for SRV records - let MongoDB handle discovery
};

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    // Clean up connection string - ensure it has proper format
    let connectionString = MONGODB_URI.trim();
    
    // For mongodb+srv://, ensure we have proper parameters
    if (connectionString.includes('mongodb+srv://')) {
      // Ensure retryWrites is in the connection string if not already present
      if (!connectionString.includes('retryWrites')) {
        const separator = connectionString.includes('?') ? '&' : '?';
        connectionString = `${connectionString}${separator}retryWrites=true`;
      }
    }

    console.log('Attempting to connect to MongoDB Atlas...');
    client = new MongoClient(connectionString, mongoOptions);
    
    // Connect to MongoDB
    await client.connect();
    
    // Verify connection by pinging the admin database
    await client.db('admin').command({ ping: 1 });
    
    db = client.db('redweek_clone');
    console.log('Successfully connected to MongoDB Atlas');
    return db;
  } catch (error: any) {
    console.error('Failed to connect to MongoDB:', error);
    const maskedUri = MONGODB_URI.replace(/:[^:@]+@/, ':****@');
    console.error('Connection string (masked):', maskedUri);
    
    // Provide helpful error message
    if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      console.error('SSL/TLS Error detected. Please check:');
      console.error('1. MongoDB Atlas Network Access allows connections from Render IPs');
      console.error('2. Database user has proper permissions');
      console.error('3. Connection string is correct');
    }
    
    // Clean up on error
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing MongoDB client:', closeError);
      }
      client = null;
      db = null;
    }
    
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
