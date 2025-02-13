import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull().default(''),
  type: text("type").notNull().default('image'), // 'image' or 'video'
  featured: boolean("featured").notNull().default(false),
  homePage: boolean("home_page").notNull().default(false)
});

// Admin schemas
export const insertAdminSchema = createInsertSchema(admins).omit({ 
  id: true 
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({ 
  id: true 
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

// Empty sample photos array - allowing for fresh start
export const samplePhotos: InsertPhoto[] = [];