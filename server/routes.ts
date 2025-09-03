import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertReviewSchema, insertBookingSchema, insertListingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Resort routes
  app.get("/api/resorts", async (req, res) => {
    try {
      const resorts = await storage.getResorts();
      res.json(resorts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resorts" });
    }
  });

  app.get("/api/resorts/new-availability", async (req, res) => {
    try {
      const resorts = await storage.getNewAvailabilityResorts();
      res.json(resorts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch new availability resorts" });
    }
  });

  app.get("/api/resorts/top", async (req, res) => {
    try {
      const resorts = await storage.getTopResorts();
      res.json(resorts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top resorts" });
    }
  });

  app.get("/api/resorts/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const resorts = await storage.searchResorts(q);
      res.json(resorts);
    } catch (error) {
      res.status(500).json({ message: "Failed to search resorts" });
    }
  });

  app.get("/api/resorts/destination/:destination", async (req, res) => {
    try {
      const { destination } = req.params;
      const resorts = await storage.getResortsByDestination(destination);
      res.json(resorts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resorts by destination" });
    }
  });

  app.get("/api/resorts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const resort = await storage.getResort(id);
      if (!resort) {
        return res.status(404).json({ message: "Resort not found" });
      }
      res.json(resort);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resort" });
    }
  });

  // Review routes
  app.get("/api/resorts/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getReviewsByResort(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin endpoint to create test user - temporary
  app.post("/api/admin/create-test-user", async (req, res) => {
    try {
      const testUser = {
        username: "efitzhenry",
        email: "ethan.fitzhenry@example.com",
        password: "password123",
        firstName: "Ethan",
        lastName: "Fitzhenry"
      };
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(testUser.email);
      if (existingUser) {
        return res.status(409).json({ message: "Test user already exists" });
      }
      
      const user = await storage.createUser(testUser);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ 
        message: "Test user created successfully", 
        user: userWithoutPassword,
        credentials: {
          username: testUser.username,
          email: testUser.email,
          password: testUser.password
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create test user" });
    }
  });

  // User routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists by email or username
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "User with this username already exists" });
      }

      const user = await storage.createUser(validatedData);
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/users/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email/Username and password are required" });
      }

      // Trim whitespace from email/username and password
      const trimmedIdentifier = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      // Try to find user by email first, then by username
      let user = await storage.getUserByEmail(trimmedIdentifier);
      if (!user) {
        user = await storage.getUserByUsername(trimmedIdentifier);
      }

      if (!user) {
        console.log(`Login failed: User not found for identifier: ${trimmedIdentifier}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.password !== trimmedPassword) {
        console.log(`Login failed: Password mismatch for user: ${user.email}`);
        console.log(`Expected: "${user.password}", Received: "${trimmedPassword}"`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`Login successful for: ${user.email} (username: ${user.username})`);
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/users/:id/bookings", async (req, res) => {
    try {
      const { id } = req.params;
      const bookings = await storage.getBookingsByUser(id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Listing routes
  app.post("/api/listings", async (req, res) => {
    try {
      const validatedData = insertListingSchema.parse(req.body);
      const listing = await storage.createListing(validatedData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.get("/api/users/:id/listings", async (req, res) => {
    try {
      const { id } = req.params;
      const listings = await storage.getListingsByOwner(id);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
