import { MongoClient } from 'mongodb';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Use DATABASE_URL from environment - no hardcoded credentials
// Note: Make sure MongoDB Atlas Network Access allows your IP address
const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('DATABASE_URL environment variable must be set');
  console.error('Please set it in your environment or .env file');
  process.exit(1);
}

interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface ResortData {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  amenities: string[];
  rating: string;
  review_count: number;
  available_rentals: number;
  price_min: number;
  price_max: number;
  is_new_availability: boolean;
  destination: string;
  created_at: string;
}

async function importData() {
  console.log('MongoDB Import Script');
  console.log('======================');
  console.log('Make sure:');
  console.log('1. MongoDB Atlas Network Access allows your IP address (or 0.0.0.0/0)');
  console.log('2. Database user has proper permissions');
  console.log('3. Connection string is correct\n');

  const client = new MongoClient(MONGODB_URI, {
    retryWrites: true,
    retryReads: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    console.log('Connecting to MongoDB Atlas...');
    const maskedUri = MONGODB_URI.replace(/:[^:@]+@/, ':****@');
    console.log(`Connection string: ${maskedUri}\n`);
    
    await client.connect();
    const db = client.db('redweek_clone');
    console.log('✓ Connected to MongoDB Atlas\n');

    // Import Users
    console.log('\n=== Importing Users ===');
    // Try multiple paths for the JSON file
    let usersPath = join(process.cwd(), 'scripts', 'users.json');
    if (!existsSync(usersPath)) {
      usersPath = join(process.cwd(), '..', 'Downloads', 'users.json');
    }
    if (!existsSync(usersPath)) {
      usersPath = 'c:\\Users\\Usuario\\Downloads\\users.json';
    }
    if (!existsSync(usersPath)) {
      throw new Error(`Users JSON file not found. Tried: ${usersPath}`);
    }
    console.log(`Reading users from: ${usersPath}`);
    const usersData: UserData[] = JSON.parse(readFileSync(usersPath, 'utf-8'));
    
    const usersCollection = db.collection('users');
    
    // Clear existing users (optional - comment out if you want to keep existing)
    // await usersCollection.deleteMany({});
    
    for (const user of usersData) {
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ 
        $or: [
          { _id: user.id },
          { email: user.email.toLowerCase() },
          { username: user.username.toLowerCase() }
        ]
      });

      if (existingUser) {
        console.log(`User ${user.username} already exists, skipping...`);
        continue;
      }

      // Transform to MongoDB schema format
      const userDoc = {
        _id: user.id,
        username: user.username.toLowerCase().trim(),
        email: user.email.toLowerCase().trim(),
        password: user.password,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || 'user',
        createdAt: new Date(user.created_at),
      };

      await usersCollection.insertOne(userDoc);
      console.log(`Imported user: ${user.username} (${user.email})`);
    }

    console.log(`\n✓ Imported ${usersData.length} users`);

    // Import Resorts
    console.log('\n=== Importing Resorts ===');
    // Try multiple paths for the JSON file
    let resortsPath = join(process.cwd(), 'scripts', 'resorts.json');
    if (!existsSync(resortsPath)) {
      resortsPath = join(process.cwd(), '..', 'Downloads', 'resorts.json');
    }
    if (!existsSync(resortsPath)) {
      resortsPath = 'c:\\Users\\Usuario\\Downloads\\resorts.json';
    }
    if (!existsSync(resortsPath)) {
      throw new Error(`Resorts JSON file not found. Tried: ${resortsPath}`);
    }
    console.log(`Reading resorts from: ${resortsPath}`);
    const resortsData: ResortData[] = JSON.parse(readFileSync(resortsPath, 'utf-8'));
    
    const resortsCollection = db.collection('resorts');
    
    // Clear existing resorts (optional - comment out if you want to keep existing)
    // await resortsCollection.deleteMany({});
    
    for (const resort of resortsData) {
      // Check if resort already exists
      const existingResort = await resortsCollection.findOne({ 
        $or: [
          { _id: resort.id },
          { name: resort.name }
        ]
      });

      if (existingResort) {
        console.log(`Resort ${resort.name} already exists, skipping...`);
        continue;
      }

      // Transform to MongoDB schema format
      const resortDoc = {
        _id: resort.id,
        name: resort.name,
        location: resort.location,
        description: resort.description,
        imageUrl: resort.image_url,
        amenities: resort.amenities,
        rating: resort.rating,
        reviewCount: resort.review_count || 0,
        availableRentals: resort.available_rentals,
        priceMin: resort.price_min,
        priceMax: resort.price_max,
        isNewAvailability: resort.is_new_availability,
        destination: resort.destination,
        createdAt: new Date(resort.created_at),
      };

      await resortsCollection.insertOne(resortDoc);
      console.log(`Imported resort: ${resort.name}`);
    }

    console.log(`\n✓ Imported ${resortsData.length} resorts`);

    console.log('\n=== Import Complete ===');
    console.log(`Total users: ${await usersCollection.countDocuments()}`);
    console.log(`Total resorts: ${await resortsCollection.countDocuments()}`);

  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the import
importData().catch(console.error);

