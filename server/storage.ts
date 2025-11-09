import { db } from "@db";
import { 
  users, 
  verifications, 
  documents, 
  auditLogs,
  type User, 
  type InsertUser,
  type Verification,
  type InsertVerification,
  type Document,
  type InsertDocument,
  type AuditLog,
  type InsertAuditLog
} from "@shared/schema";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getVerification(id: string): Promise<Verification | undefined>;
  listVerifications(filters?: { status?: string; userId?: string }): Promise<Verification[]>;
  createVerification(verification: InsertVerification): Promise<Verification>;
  updateVerification(id: string, data: Partial<InsertVerification>): Promise<Verification | undefined>;
  
  getDocument(verificationId: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(verificationId: string): Promise<AuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getVerification(id: string): Promise<Verification | undefined> {
    const result = await db.select().from(verifications).where(eq(verifications.id, id)).limit(1);
    return result[0];
  }

  async listVerifications(filters?: { status?: string; userId?: string }): Promise<Verification[]> {
    let query = db.select().from(verifications).orderBy(desc(verifications.createdAt));
    
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(verifications.status, filters.status));
    }
    if (filters?.userId) {
      conditions.push(eq(verifications.userId, filters.userId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query;
  }

  async createVerification(insertVerification: InsertVerification): Promise<Verification> {
    const result = await db.insert(verifications).values(insertVerification).returning();
    return result[0];
  }

  async updateVerification(id: string, data: Partial<InsertVerification>): Promise<Verification | undefined> {
    const result = await db
      .update(verifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(verifications.id, id))
      .returning();
    return result[0];
  }

  async getDocument(verificationId: string): Promise<Document | undefined> {
    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.verificationId, verificationId))
      .limit(1);
    return result[0];
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const result = await db.insert(documents).values(insertDocument).returning();
    return result[0];
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const result = await db.insert(auditLogs).values(insertLog).returning();
    return result[0];
  }

  async getAuditLogs(verificationId: string): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.verificationId, verificationId))
      .orderBy(desc(auditLogs.timestamp));
  }
}

export const storage = new DatabaseStorage();
