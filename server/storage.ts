import { photos, admins, type Photo, type InsertPhoto, type Admin, type InsertAdmin } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  getPhoto(id: number): Promise<Photo | undefined>;
  getAllPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updatePhotoHomePage(id: number, homePage: boolean): Promise<Photo | undefined>;
}

export class DatabaseStorage implements IStorage {
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(`Database operation failed (attempt ${attempt}/3):`, error);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    throw lastError;
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.executeWithRetry(async () => {
      const [photo] = await db.select().from(photos).where(eq(photos.id, id));
      return photo || undefined;
    });
  }

  async getAllPhotos(): Promise<Photo[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(photos);
    });
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    return this.executeWithRetry(async () => {
      const [photo] = await db
        .insert(photos)
        .values(insertPhoto)
        .returning();
      return photo;
    });
  }

  async deletePhoto(id: number): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const [deleted] = await db
        .delete(photos)
        .where(eq(photos.id, id))
        .returning();
      return !!deleted;
    });
  }

  async updatePhotoHomePage(id: number, homePage: boolean): Promise<Photo | undefined> {
    return this.executeWithRetry(async () => {
      const [updated] = await db
        .update(photos)
        .set({ homePage })
        .where(eq(photos.id, id))
        .returning();
      return updated;
    });
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return this.executeWithRetry(async () => {
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.username, username));
      return admin || undefined;
    });
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    return this.executeWithRetry(async () => {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      const [createdAdmin] = await db
        .insert(admins)
        .values({ ...admin, password: hashedPassword })
        .returning();
      return createdAdmin;
    });
  }
}

export const storage = new DatabaseStorage();