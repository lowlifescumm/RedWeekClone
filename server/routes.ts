import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertReviewSchema, insertBookingSchema, insertListingSchema, insertResortSchema } from "@shared/schema";
import { inventoryService } from "./inventory-service";
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

  // Inventory sync routes
  app.get("/api/inventory/providers", async (req, res) => {
    try {
      const providers = inventoryService.getProviders();
      res.json({ providers });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  app.post("/api/inventory/sync/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const { filters } = req.body;
      
      const result = await inventoryService.syncInventory(
        provider,
        filters,
        async (resorts) => await storage.createResortsInBulk(resorts)
      );
      
      res.json(result);
    } catch (error) {
      console.error("Inventory sync error:", error);
      res.status(500).json({ 
        message: "Inventory sync failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/inventory/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = inventoryService.getSyncHistory(limit);
      res.json({ history });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync history" });
    }
  });

  app.post("/api/inventory/preview/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const { filters } = req.body;
      
      const result = await inventoryService.syncInventory(provider, filters);
      
      res.json({
        ...result,
        preview: true,
        message: "Preview only - no data was saved"
      });
    } catch (error) {
      console.error("Inventory preview error:", error);
      res.status(500).json({ 
        message: "Inventory preview failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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

  // Get current user endpoint
  app.get("/api/users/me", async (req, res) => {
    try {
      // For now, we'll simulate session with a simple check
      // In a real app, this would check session/JWT
      res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to get current user" });
    }
  });

  // Logout endpoint
  app.post("/api/users/logout", async (req, res) => {
    try {
      // In a real app, this would clear session/invalidate JWT
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      // In a real app, check if user is admin via session/JWT
      const users = await storage.getUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Update user (admin only)
  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validate the update data
      const validatedData = insertUserSchema.omit({ password: true }).parse(updateData);
      
      const updatedUser = await storage.updateUser(id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Resort admin routes
  app.post("/api/admin/resorts", async (req, res) => {
    try {
      const resortData = insertResortSchema.parse(req.body);
      const newResort = await storage.createResort(resortData);
      res.json(newResort);
    } catch (error) {
      console.error("Create resort error:", error);
      res.status(500).json({ message: "Failed to create resort" });
    }
  });

  app.patch("/api/admin/resorts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const validatedData = insertResortSchema.parse(updateData);
      const updatedResort = await storage.updateResort(id, validatedData);
      
      if (!updatedResort) {
        return res.status(404).json({ message: "Resort not found" });
      }
      
      res.json(updatedResort);
    } catch (error) {
      console.error("Update resort error:", error);
      res.status(500).json({ message: "Failed to update resort" });
    }
  });

  app.delete("/api/admin/resorts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteResort(id);
      if (!success) {
        return res.status(404).json({ message: "Resort not found" });
      }
      
      res.json({ message: "Resort deleted successfully" });
    } catch (error) {
      console.error("Delete resort error:", error);
      res.status(500).json({ message: "Failed to delete resort" });
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
