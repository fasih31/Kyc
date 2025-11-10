
import { db } from '../db';
import { digitalWalletCredentials, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export class IdentityWalletService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async createCredential(
    userId: string,
    credentialType: string,
    data: any,
    issuedBy: string,
    expiresAt?: Date
  ) {
    const encryptedData = this.encrypt(JSON.stringify(data));
    const verificationHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

    const [credential] = await db.insert(digitalWalletCredentials).values({
      userId,
      credentialType,
      encryptedData,
      verificationHash,
      issuedBy,
      expiresAt,
      isActive: true,
    }).returning();

    return credential;
  }

  async getCredentials(userId: string) {
    const credentials = await db.query.digitalWalletCredentials.findMany({
      where: eq(digitalWalletCredentials.userId, userId),
    });

    return credentials.map(cred => ({
      ...cred,
      data: this.decrypt(cred.encryptedData),
    }));
  }

  async verifyCredential(credentialId: string, providedHash: string): Promise<boolean> {
    const credential = await db.query.digitalWalletCredentials.findFirst({
      where: eq(digitalWalletCredentials.id, credentialId),
    });

    return credential?.verificationHash === providedHash;
  }

  async revokeCredential(credentialId: string) {
    await db.update(digitalWalletCredentials)
      .set({ isActive: false })
      .where(eq(digitalWalletCredentials.id, credentialId));
  }
}
