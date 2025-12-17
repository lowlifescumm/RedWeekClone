import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";

// Google Cloud Storage configuration from environment variables
const GCS_BUCKET_NAME = process.env.OBJECT_STORAGE_BUCKET || process.env.GCS_BUCKET_NAME;
const GCS_PROJECT_ID = process.env.GCS_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const GCS_KEY_FILE = process.env.GCS_KEY_FILE; // Path to JSON key file
const GCS_CREDENTIALS = process.env.GCS_CREDENTIALS; // JSON string of credentials

// Initialize Google Cloud Storage client
let storageClient: Storage;

if (GCS_CREDENTIALS) {
  // Use credentials from environment variable (JSON string)
  try {
    const credentials = JSON.parse(GCS_CREDENTIALS);
    storageClient = new Storage({
      projectId: GCS_PROJECT_ID,
      credentials,
    });
  } catch (error) {
    throw new Error(
      "Invalid GCS_CREDENTIALS format. Must be a valid JSON string."
    );
  }
} else if (GCS_KEY_FILE) {
  // Use key file path
  storageClient = new Storage({
    projectId: GCS_PROJECT_ID,
    keyFilename: GCS_KEY_FILE,
  });
} else {
  // Try to use default credentials (for local development with gcloud CLI)
  storageClient = new Storage({
    projectId: GCS_PROJECT_ID,
  });
}

if (!GCS_BUCKET_NAME) {
  console.warn(
    "OBJECT_STORAGE_BUCKET or GCS_BUCKET_NAME not set. Object storage operations will fail."
  );
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private bucketName: string;
  private publicPath: string;
  private privatePath: string;

  constructor() {
    if (!GCS_BUCKET_NAME) {
      throw new Error(
        "OBJECT_STORAGE_BUCKET or GCS_BUCKET_NAME must be set in environment variables"
      );
    }
    
    this.bucketName = GCS_BUCKET_NAME;
    // Use environment variables for paths, with defaults
    this.publicPath = process.env.PUBLIC_OBJECT_SEARCH_PATHS?.split(',')[0] || 'public';
    this.privatePath = process.env.PRIVATE_OBJECT_DIR || '.private';
  }

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || this.publicPath;
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Set it in environment variables (comma-separated paths)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || this.privatePath;
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Set it in environment variables."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    const bucket = storageClient.bucket(this.bucketName);
    
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`.replace(/\/+/g, '/'); // Normalize slashes
      const file = bucket.file(fullPath);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }

  async downloadObject(file: File, res: Response, cacheTtlSec: number = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      const stream = file.createReadStream();
      stream.on("error", (err: any) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/contracts/${objectId}`.replace(/\/+/g, '/');
    
    const bucket = storageClient.bucket(this.bucketName);
    const file = bucket.file(fullPath);

    // Generate signed URL for upload (PUT method, 15 minutes expiry)
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: 'application/pdf', // Default, can be overridden
    });

    return signedUrl;
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/contracts/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`.replace(/\/+/g, '/');
    
    const bucket = storageClient.bucket(this.bucketName);
    const objectFile = bucket.file(objectEntityPath);
    
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/contracts/${entityId}`;
  }
}

// Export the storage client for direct use if needed
export { storageClient as objectStorageClient };
