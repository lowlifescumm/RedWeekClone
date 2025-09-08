import { eq, ilike, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  resorts, 
  reviews, 
  bookings, 
  listings,
  siteSettings,
  propertyInquiries,
  type User,
  type InsertUser,
  type Resort,
  type InsertResort,
  type Review,
  type InsertReview,
  type Booking,
  type InsertBooking,
  type Listing,
  type InsertListing,
  type SiteSetting,
  type InsertSiteSetting,
  type PropertyInquiry,
  type InsertPropertyInquiry
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase()));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = {
      ...insertUser,
      email: insertUser.email.toLowerCase().trim(),
      username: insertUser.username.toLowerCase().trim(),
      role: insertUser.role || 'user',
    };

    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<Omit<User, 'id' | 'createdAt' | 'password'>>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        email: updateData.email ? updateData.email.toLowerCase().trim() : undefined,
        username: updateData.username ? updateData.username.toLowerCase().trim() : undefined,
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Resort methods
  async getResorts(): Promise<Resort[]> {
    return await db.select().from(resorts).orderBy(desc(resorts.createdAt));
  }

  async getResort(id: string): Promise<Resort | undefined> {
    const [resort] = await db.select().from(resorts).where(eq(resorts.id, id));
    return resort || undefined;
  }

  async getResortsByDestination(destination: string): Promise<Resort[]> {
    return await db
      .select()
      .from(resorts)
      .where(ilike(resorts.destination, `%${destination}%`))
      .orderBy(desc(resorts.rating));
  }

  async getNewAvailabilityResorts(): Promise<Resort[]> {
    return await db
      .select()
      .from(resorts)
      .where(eq(resorts.isNewAvailability, true))
      .orderBy(desc(resorts.createdAt));
  }

  async getTopResorts(): Promise<Resort[]> {
    return await db
      .select()
      .from(resorts)
      .orderBy(desc(resorts.rating))
      .limit(12);
  }

  async searchResorts(query: string): Promise<Resort[]> {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(resorts)
      .where(
        sql`${resorts.name} ILIKE ${searchTerm} OR 
            ${resorts.location} ILIKE ${searchTerm} OR 
            ${resorts.destination} ILIKE ${searchTerm}`
      )
      .orderBy(desc(resorts.rating));
  }

  async createResort(insertResort: InsertResort): Promise<Resort> {
    const resortData = {
      ...insertResort,
      reviewCount: 0,
      availableRentals: insertResort.availableRentals || 0,
      isNewAvailability: insertResort.isNewAvailability || false,
    };

    const [resort] = await db.insert(resorts).values(resortData).returning();
    return resort;
  }

  async createResortsInBulk(insertResorts: InsertResort[]): Promise<Resort[]> {
    const resortsData = insertResorts.map(insertResort => ({
      ...insertResort,
      reviewCount: 0,
      availableRentals: insertResort.availableRentals || 0,
      isNewAvailability: insertResort.isNewAvailability || false,
    }));

    return await db.insert(resorts).values(resortsData).returning();
  }

  async updateResort(id: string, updateData: Partial<Omit<Resort, 'id'>>): Promise<Resort | undefined> {
    const [updatedResort] = await db
      .update(resorts)
      .set(updateData)
      .where(eq(resorts.id, id))
      .returning();
    
    return updatedResort || undefined;
  }

  async deleteResort(id: string): Promise<boolean> {
    const result = await db.delete(resorts).where(eq(resorts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Review methods
  async getReviewsByResort(resortId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.resortId, resortId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    
    // Update resort review count
    await db
      .update(resorts)
      .set({ 
        reviewCount: sql`${resorts.reviewCount} + 1`
      })
      .where(eq(resorts.id, insertReview.resortId));

    return review;
  }

  // Booking methods
  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const bookingData = {
      ...insertBooking,
      status: "pending",
    };

    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  // Listing methods
  async getListingsByOwner(ownerId: string): Promise<Listing[]> {
    return await db
      .select()
      .from(listings)
      .where(eq(listings.ownerId, ownerId))
      .orderBy(desc(listings.createdAt));
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing || undefined;
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const listingData = {
      ...insertListing,
      isActive: true,
      contractVerificationStatus: "pending",
      escrowStatus: "none",
      ownershipVerified: false,
    };

    const [listing] = await db.insert(listings).values(listingData).returning();
    return listing;
  }

  async updateListing(id: string, updateData: Partial<Omit<Listing, 'id' | 'createdAt'>>): Promise<Listing | undefined> {
    const [updatedListing] = await db
      .update(listings)
      .set(updateData)
      .where(eq(listings.id, id))
      .returning();
    
    return updatedListing || undefined;
  }

  // Site Settings methods
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async getSiteSettingsByCategory(category: string): Promise<SiteSetting[]> {
    return await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.category, category))
      .orderBy(siteSettings.key);
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return await db
      .select()
      .from(siteSettings)
      .orderBy(siteSettings.category, siteSettings.key);
  }

  async setSiteSetting(insertSetting: InsertSiteSetting): Promise<SiteSetting> {
    const [setting] = await db
      .insert(siteSettings)
      .values({
        ...insertSetting,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: insertSetting.value,
          category: insertSetting.category,
          description: insertSetting.description,
          isEncrypted: insertSetting.isEncrypted,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return setting;
  }

  async deleteSiteSetting(key: string): Promise<boolean> {
    const result = await db.delete(siteSettings).where(eq(siteSettings.key, key));
    return (result.rowCount || 0) > 0;
  }

  // Property Inquiry methods
  async getPropertyInquiries(): Promise<PropertyInquiry[]> {
    return await db
      .select()
      .from(propertyInquiries)
      .orderBy(desc(propertyInquiries.createdAt));
  }

  async getPropertyInquiry(id: string): Promise<PropertyInquiry | undefined> {
    const [inquiry] = await db.select().from(propertyInquiries).where(eq(propertyInquiries.id, id));
    return inquiry || undefined;
  }

  async createPropertyInquiry(insertInquiry: InsertPropertyInquiry): Promise<PropertyInquiry> {
    const inquiryData = {
      ...insertInquiry,
      status: "new",
    };

    const [inquiry] = await db.insert(propertyInquiries).values(inquiryData).returning();
    return inquiry;
  }

  async updatePropertyInquiry(id: string, updateData: Partial<Omit<PropertyInquiry, 'id' | 'createdAt'>>): Promise<PropertyInquiry | undefined> {
    const [updatedInquiry] = await db
      .update(propertyInquiries)
      .set(updateData)
      .where(eq(propertyInquiries.id, id))
      .returning();
    
    return updatedInquiry || undefined;
  }

  // Seed data for initial setup
  async seedData(): Promise<void> {
    // Check if data already exists
    const existingResorts = await this.getResorts();
    if (existingResorts.length > 0) {
      console.log("Database already seeded, skipping seed data");
      return;
    }

    console.log("Seeding database with initial data...");

    // Seed resort data
    const seedResorts: InsertResort[] = [
      {
        name: "Marriott's Aruba Surf Club",
        location: "Palm Beach, Aruba",
        description: "Luxurious beachfront resort with world-class amenities",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Beach Access", "Pool", "Spa", "Restaurant", "Fitness Center"],
        rating: "4.8",
        availableRentals: 1442,
        priceMin: 136,
        priceMax: 7143,
        isNewAvailability: false,
        destination: "Aruba"
      },
      {
        name: "Marriott's Ko Olina Beach Club",
        location: "Kapolei, Hawaii",
        description: "Tropical paradise with oceanfront villas",
        imageUrl: "https://images.unsplash.com/photo-1571770095004-6b61b1cf308a?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Beach Access", "Pool", "Tennis", "Golf", "Kids Club"],
        rating: "4.7",
        availableRentals: 1052,
        priceMin: 257,
        priceMax: 1921,
        isNewAvailability: false,
        destination: "Hawaii"
      },
      {
        name: "Westin Princeville Ocean Resort Villas",
        location: "Princeville, Hawaii",
        description: "Luxury beachfront resort with ocean views",
        imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Ocean View", "Pool", "Spa", "Restaurant"],
        rating: "4.6",
        availableRentals: 324,
        priceMin: 200,
        priceMax: 1200,
        isNewAvailability: true,
        destination: "Hawaii"
      },
      {
        name: "Club Wyndham Austin",
        location: "Austin, Texas", 
        description: "Modern downtown hotel with city skyline views",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["City View", "Pool", "Fitness Center", "Restaurant"],
        rating: "4.3",
        availableRentals: 234,
        priceMin: 125,
        priceMax: 400,
        isNewAvailability: true,
        destination: "Texas"
      },
      {
        name: "Club Wyndham Bonnet Creek Resort",
        location: "Lake Buena Vista, Florida",
        description: "Family-friendly resort near Disney World",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Disney Shuttle", "Pool", "Kids Club", "Restaurant"],
        rating: "4.2",
        availableRentals: 2158,
        priceMin: 47,
        priceMax: 800,
        isNewAvailability: false,
        destination: "Florida"
      },
      {
        name: "Marriott's Crystal Shores",
        location: "Marco Island, Florida",
        description: "Beachfront luxury with pristine white sand beaches",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&w=800&h=600",
        amenities: ["Beach Access", "Pool", "Spa", "Golf"],
        rating: "4.7",
        availableRentals: 691,
        priceMin: 171,
        priceMax: 2050,
        isNewAvailability: true,
        destination: "Florida"
      }
    ];

    const createdResorts = await this.createResortsInBulk(seedResorts);
    console.log(`Created ${createdResorts.length} resorts`);

    // Create test users if in development
    if (process.env.NODE_ENV === 'development') {
      try {
        await this.createUser({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'user'
        });
        console.log('Created test user: testuser / test@example.com');

        await this.createUser({
          username: 'admin',
          email: 'admin@tailoredtimeshare.com',
          password: 'admin123',
          firstName: 'Site',
          lastName: 'Administrator',
          role: 'admin'
        });
        console.log('Created admin user: admin / admin@tailoredtimeshare.com');
      } catch (error) {
        console.log('Test users may already exist, skipping creation');
      }
    }

    // Seed some sample reviews
    if (createdResorts.length > 0) {
      const sampleReviews: InsertReview[] = [
        {
          resortId: createdResorts[0].id,
          userId: "sample-user-1",
          rating: 5,
          title: "Amazing vacation experience",
          content: "LOVE Tailored Timeshare Solutions. We have rented units and also placed our units for rent. Each time every sale went through smoothly."
        },
        {
          resortId: createdResorts[1].id,
          userId: "sample-user-2",
          rating: 5,
          title: "Excellent service",
          content: "Efficient and effective customer service. Highly recommend. Tailored Timeshare Solutions handled every aspect of the rental."
        }
      ];

      for (const review of sampleReviews) {
        try {
          await this.createReview(review);
        } catch (error) {
          console.log('Sample reviews may have issues, continuing...');
        }
      }
    }

    console.log("Database seeding completed!");
  }
}