import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export class FileService {
  private uploadDir = join(process.cwd(), "uploads");

  async saveFile(base64Data: string, prefix: string = "file"): Promise<string> {
    try {
      await mkdir(this.uploadDir, { recursive: true });
      
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${prefix}-${randomUUID()}.jpg`;
      const filepath = join(this.uploadDir, filename);
      
      await writeFile(filepath, buffer);
      
      return `/uploads/${filename}`;
    } catch (error) {
      console.error('File save error:', error);
      throw new Error('Failed to save file');
    }
  }

  extractBase64(dataUrl: string): string {
    const matches = dataUrl.match(/^data:image\/[a-z]+;base64,(.+)$/);
    if (!matches || matches.length !== 2) {
      return dataUrl;
    }
    return matches[1];
  }
}

export const fileService = new FileService();
