import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Response } from "express";
import { randomUUID } from "crypto";

// Initialize Cloudinary with environment variables
// Parse CLOUDINARY_URL if provided (format: cloudinary://api_key:api_secret@cloud_name)
if (process.env.CLOUDINARY_URL) {
  const urlMatch = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@([^\/]+)/);
  if (urlMatch) {
    cloudinary.config({
      cloud_name: urlMatch[3],
      api_key: urlMatch[1],
      api_secret: urlMatch[2],
    });
  }
} else {
  // Use individual environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
  });
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private publicFolder: string;
  private privateFolder: string;

  constructor() {
    // Use environment variables for folder paths, with defaults
    this.publicFolder = process.env.PUBLIC_OBJECT_SEARCH_PATHS?.split(',')[0] || 'public';
    this.privateFolder = process.env.PRIVATE_OBJECT_DIR || 'private';
  }

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || this.publicFolder;
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
    const dir = process.env.PRIVATE_OBJECT_DIR || this.privateFolder;
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Set it in environment variables."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<string | null> {
    // Cloudinary doesn't have a direct "search" - we'll try to get the resource
    // For public files, we can construct the URL directly
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const cleanSearchPath = searchPath.replace(/^\/+/, '');
      const cleanFilePath = filePath.replace(/^\/+/, '');
      const publicId = `${cleanSearchPath}/${cleanFilePath}`.replace(/\/+/g, '/');
      
      try {
        const result = await cloudinary.api.resource(publicId);
        if (result) {
          return result.secure_url;
        }
      } catch (error: any) {
        // Resource not found, try next path
        if (error.http_code !== 404) {
          console.error(`Error searching for public object ${publicId}:`, error);
        }
      }
    }
    return null;
  }

  async downloadObject(fileUrl: string, res: Response, cacheTtlSec: number = 3600) {
    try {
      // For Cloudinary, we redirect to the secure URL
      // Or we can proxy the file if needed
      res.set({
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });
      
      // Redirect to Cloudinary URL
      res.redirect(fileUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const privateFolder = this.getPrivateObjectDir();
    const objectId = randomUUID();
    
    // Generate upload signature for Cloudinary
    // Cloudinary uses upload presets or signed uploads
    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET || cloudinary.config().api_secret || '';
    
    if (!apiSecret) {
      throw new Error('CLOUDINARY_API_SECRET must be set');
    }
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: `${privateFolder}/contracts`,
        public_id: objectId,
        resource_type: 'raw', // For PDFs and documents
      },
      apiSecret
    );

    const apiKey = process.env.CLOUDINARY_API_KEY || cloudinary.config().api_key || '';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || cloudinary.config().cloud_name || '';
    
    // Return upload URL with parameters
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload?timestamp=${timestamp}&signature=${signature}&api_key=${apiKey}&folder=${encodeURIComponent(`${privateFolder}/contracts`)}&public_id=${objectId}`;

    return uploadUrl;
  }

  async getObjectEntityFile(objectPath: string): Promise<string> {
    if (!objectPath.startsWith("/contracts/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    entityDir = entityDir.replace(/^\/+/, '');
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const publicId = `${entityDir}${entityId}`.replace(/\/+/g, '/');
    
    try {
      // Verify the resource exists
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'raw',
      });
      
      if (!result) {
        throw new ObjectNotFoundError();
      }
      
      // Return the secure URL
      return result.secure_url;
    } catch (error: any) {
      if (error.http_code === 404) {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    // If it's already a Cloudinary URL, extract the public_id
    if (rawPath.includes('cloudinary.com')) {
      try {
        const url = new URL(rawPath);
        const pathParts = url.pathname.split('/');
        const resourceTypeIndex = pathParts.findIndex(p => ['image', 'video', 'raw'].includes(p));
        if (resourceTypeIndex !== -1 && pathParts[resourceTypeIndex + 1] === 'upload') {
          // Extract public_id from Cloudinary URL
          const publicIdParts = pathParts.slice(resourceTypeIndex + 2);
          const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
          
          // Check if it's in the contracts folder
          if (publicId.startsWith(`${this.getPrivateObjectDir()}/contracts/`)) {
            const entityId = publicId.replace(`${this.getPrivateObjectDir()}/contracts/`, '');
            return `/contracts/${entityId}`;
          }
        }
      } catch (error) {
        // Not a valid URL, return as is
      }
    }
    
    // If it's already in the /contracts/ format, return as is
    if (rawPath.startsWith("/contracts/")) {
      return rawPath;
    }
    
    return rawPath;
  }

  // Helper method to upload a file directly (for server-side uploads)
  async uploadFile(fileBuffer: Buffer, folder: string, filename: string, options?: {
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    public_id?: string;
  }): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: options?.public_id || filename,
          resource_type: options?.resource_type || 'raw',
          ...options,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed: no result returned'));
          }
        }
      );
      
      uploadStream.end(fileBuffer);
    });
  }
}

// Export cloudinary instance for direct use if needed
export { cloudinary };
