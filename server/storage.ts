import { type User, type InsertUser, type Resort, type InsertResort, type Review, type InsertReview, type Booking, type InsertBooking, type Listing, type InsertListing } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Resort methods
  getResorts(): Promise<Resort[]>;
  getResort(id: string): Promise<Resort | undefined>;
  getResortsByDestination(destination: string): Promise<Resort[]>;
  getNewAvailabilityResorts(): Promise<Resort[]>;
  getTopResorts(): Promise<Resort[]>;
  searchResorts(query: string): Promise<Resort[]>;
  createResort(resort: InsertResort): Promise<Resort>;

  // Review methods
  getReviewsByResort(resortId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Booking methods
  getBookingsByUser(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;

  // Listing methods
  getListingsByOwner(ownerId: string): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private resorts: Map<string, Resort>;
  private reviews: Map<string, Review>;
  private bookings: Map<string, Booking>;
  private listings: Map<string, Listing>;

  constructor() {
    this.users = new Map();
    this.resorts = new Map();
    this.reviews = new Map();
    this.bookings = new Map();
    this.listings = new Map();
    this.seedData();
    this.migrateUserData();
  }

  private seedData() {
    // Seed resort data
    const seedResorts: Resort[] = [
      {
        id: "1",
        name: "Marriott's Aruba Surf Club",
        location: "Palm Beach, Aruba",
        description: "Luxurious beachfront resort with world-class amenities",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Beach Access", "Pool", "Spa", "Restaurant", "Fitness Center"],
        rating: "4.8",
        reviewCount: 1780,
        availableRentals: 1442,
        priceMin: 136,
        priceMax: 7143,
        isNewAvailability: false,
        destination: "Aruba",
        createdAt: new Date()
      },
      {
        id: "2", 
        name: "Marriott's Ko Olina Beach Club",
        location: "Kapolei, Hawaii",
        description: "Tropical paradise with oceanfront villas",
        imageUrl: "https://images.unsplash.com/photo-1571770095004-6b61b1cf308a?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Beach Access", "Pool", "Tennis", "Golf", "Kids Club"],
        rating: "4.7",
        reviewCount: 1225,
        availableRentals: 1052,
        priceMin: 257,
        priceMax: 1921,
        isNewAvailability: false,
        destination: "Hawaii",
        createdAt: new Date()
      },
      {
        id: "3",
        name: "Westin Princeville Ocean Resort Villas",
        location: "Princeville, Hawaii",
        description: "Luxury beachfront resort with ocean views",
        imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Ocean View", "Pool", "Spa", "Restaurant"],
        rating: "4.6",
        reviewCount: 892,
        availableRentals: 324,
        priceMin: 200,
        priceMax: 1200,
        isNewAvailability: true,
        destination: "Hawaii",
        createdAt: new Date()
      },
      {
        id: "4",
        name: "Club Wyndham Austin",
        location: "Austin, Texas",
        description: "Modern downtown hotel with city skyline views",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["City View", "Pool", "Fitness Center", "Restaurant"],
        rating: "4.3",
        reviewCount: 456,
        availableRentals: 234,
        priceMin: 125,
        priceMax: 400,
        isNewAvailability: true,
        destination: "Texas",
        createdAt: new Date()
      },
      {
        id: "5",
        name: "Club Wyndham Bonnet Creek Resort",
        location: "Lake Buena Vista, Florida",
        description: "Family-friendly resort near Disney World",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Disney Shuttle", "Pool", "Kids Club", "Restaurant"],
        rating: "4.2",
        reviewCount: 187,
        availableRentals: 2158,
        priceMin: 47,
        priceMax: 800,
        isNewAvailability: false,
        destination: "Florida",
        createdAt: new Date()
      },
      {
        id: "6",
        name: "Marriott's Crystal Shores",
        location: "Marco Island, Florida",
        description: "Beachfront luxury with pristine white sand beaches",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Beach Access", "Pool", "Spa", "Golf"],
        rating: "4.7",
        reviewCount: 763,
        availableRentals: 691,
        priceMin: 171,
        priceMax: 2050,
        isNewAvailability: true,
        destination: "Florida",
        createdAt: new Date()
      }
    ];

    seedResorts.forEach(resort => this.resorts.set(resort.id, resort));

    // Seed review data
    const seedReviews: Review[] = [
      {
        id: "1",
        resortId: "1",
        userId: "user1",
        rating: 5,
        title: "Amazing vacation experience",
        content: "LOVE Tailored Timeshare Solutions. We have rented units and also placed our units for rent. Each time every sale went through smoothly. Tailored Timeshare Solutions has helped improve our vacation experiences tremendously.",
        createdAt: new Date()
      },
      {
        id: "2",
        resortId: "2",
        userId: "user2",
        rating: 5,
        title: "Excellent service",
        content: "Efficient and effective customer service. Highly recommend. Tailored Timeshare Solutions handled every aspect of the rental, they made me very comfortable.",
        createdAt: new Date()
      },
      {
        id: "3",
        resortId: "3",
        userId: "user3",
        rating: 5,
        title: "Very easy to set up",
        content: "Very easy to set up! Everyone was very helpful and answered my questions in a timely manner. Great communication from Tailored Timeshare Solutions!",
        createdAt: new Date()
      }
    ];

    seedReviews.forEach(review => this.reviews.set(review.id, review));
  }

  private migrateUserData() {
    // Normalize existing user data to ensure case-insensitive lookups work
    const users = Array.from(this.users.values());
    users.forEach(user => {
      const normalizedUser = {
        ...user,
        email: user.email.toLowerCase().trim(),
        username: user.username.toLowerCase().trim()
      };
      this.users.set(user.id, normalizedUser);
    });
    console.log(`Migrated ${users.length} users to normalized format`);

    // Create test user for development
    if (process.env.NODE_ENV === 'development') {
      const testUser = {
        id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        createdAt: new Date()
      };
      this.users.set(testUser.id, testUser);
      console.log('Created test user: testuser / test@example.com');

      // Create admin user
      const adminUser = {
        id: 'admin-user-1',
        username: 'admin',
        email: 'admin@tailoredtimeshare.com',
        password: 'admin123',
        firstName: 'Site',
        lastName: 'Administrator',
        role: 'admin',
        createdAt: new Date()
      };
      this.users.set(adminUser.id, adminUser);
      console.log('Created admin user: admin / admin@tailoredtimeshare.com');
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      email: insertUser.email.toLowerCase().trim(),
      username: insertUser.username.toLowerCase().trim(),
      role: insertUser.role || 'user',
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getResorts(): Promise<Resort[]> {
    return Array.from(this.resorts.values());
  }

  async getResort(id: string): Promise<Resort | undefined> {
    return this.resorts.get(id);
  }

  async getResortsByDestination(destination: string): Promise<Resort[]> {
    return Array.from(this.resorts.values()).filter(resort => 
      resort.destination.toLowerCase().includes(destination.toLowerCase())
    );
  }

  async getNewAvailabilityResorts(): Promise<Resort[]> {
    return Array.from(this.resorts.values()).filter(resort => resort.isNewAvailability);
  }

  async getTopResorts(): Promise<Resort[]> {
    return Array.from(this.resorts.values())
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 12);
  }

  async searchResorts(query: string): Promise<Resort[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.resorts.values()).filter(resort =>
      resort.name.toLowerCase().includes(lowercaseQuery) ||
      resort.location.toLowerCase().includes(lowercaseQuery) ||
      resort.destination.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createResort(insertResort: InsertResort): Promise<Resort> {
    const id = randomUUID();
    const resort: Resort = { 
      ...insertResort, 
      id, 
      reviewCount: 0, 
      availableRentals: insertResort.availableRentals || 0,
      isNewAvailability: insertResort.isNewAvailability || false,
      createdAt: new Date() 
    };
    this.resorts.set(id, resort);
    return resort;
  }

  async getReviewsByResort(resortId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.resortId === resortId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { ...insertReview, id, createdAt: new Date() };
    this.reviews.set(id, review);
    return review;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { ...insertBooking, id, status: "pending", createdAt: new Date() };
    this.bookings.set(id, booking);
    return booking;
  }

  async getListingsByOwner(ownerId: string): Promise<Listing[]> {
    return Array.from(this.listings.values()).filter(listing => listing.ownerId === ownerId);
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = randomUUID();
    const listing: Listing = { ...insertListing, id, isActive: true, createdAt: new Date() };
    this.listings.set(id, listing);
    return listing;
  }
}

export const storage = new MemStorage();
