import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow()
});

export const resorts = pgTable("resorts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  amenities: text("amenities").array().notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  availableRentals: integer("available_rentals").notNull().default(0),
  priceMin: integer("price_min").notNull(),
  priceMax: integer("price_max").notNull(),
  isNewAvailability: boolean("is_new_availability").notNull().default(false),
  destination: text("destination").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resortId: varchar("resort_id").notNull().references(() => resorts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resortId: varchar("resort_id").notNull().references(() => resorts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  guests: integer("guests").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resortId: varchar("resort_id").notNull().references(() => resorts.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  pricePerNight: integer("price_per_night").notNull(),
  availableFrom: timestamp("available_from").notNull(),
  availableTo: timestamp("available_to").notNull(),
  maxGuests: integer("max_guests").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  contractDocumentUrl: text("contract_document_url"),
  contractVerificationStatus: text("contract_verification_status").notNull().default("pending"),
  escrowStatus: text("escrow_status").notNull().default("none"),
  ownershipVerified: boolean("ownership_verified").notNull().default(false),
  escrowAccountId: text("escrow_account_id"),
  salePrice: integer("sale_price"),
  isForSale: boolean("is_for_sale").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertResortSchema = createInsertSchema(resorts).omit({
  id: true,
  createdAt: true,
  reviewCount: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  isActive: true,
  contractVerificationStatus: true,
  escrowStatus: true,
  ownershipVerified: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resort = typeof resorts.$inferSelect;
export type InsertResort = z.infer<typeof insertResortSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
