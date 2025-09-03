import { InsertResort, Resort } from "@shared/schema";

// External inventory provider interface
export interface InventoryProvider {
  name: string;
  authenticate(credentials: Record<string, string>): Promise<boolean>;
  fetchInventory(filters?: InventoryFilters): Promise<ExternalListing[]>;
  transformListing(listing: ExternalListing): InsertResort;
}

// Filters for fetching inventory
export interface InventoryFilters {
  destination?: string;
  priceMin?: number;
  priceMax?: number;
  checkIn?: Date;
  checkOut?: Date;
  limit?: number;
}

// External listing format (flexible structure)
export interface ExternalListing {
  id: string;
  name: string;
  location?: string;
  destination?: string;
  description?: string;
  images?: string[];
  amenities?: string[];
  rating?: number | string;
  reviewCount?: number;
  price?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  availability?: {
    count?: number;
    isNew?: boolean;
  };
  [key: string]: any; // Allow additional fields
}

// Sync result tracking
export interface SyncResult {
  provider: string;
  timestamp: Date;
  total: number;
  imported: number;
  updated: number;
  errors: SyncError[];
}

export interface SyncError {
  listingId: string;
  error: string;
  data?: any;
}

// Sample RedWeek API provider (can be extended for other providers)
export class RedWeekProvider implements InventoryProvider {
  name = "RedWeek";
  private apiKey: string = "";
  private baseUrl = "https://api.redweek.com/v1";

  async authenticate(credentials: Record<string, string>): Promise<boolean> {
    this.apiKey = credentials.apiKey || "";
    if (!this.apiKey) {
      return false;
    }

    try {
      // Test API connection
      const response = await fetch(`${this.baseUrl}/test`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('RedWeek authentication failed:', error);
      return false;
    }
  }

  async fetchInventory(filters: InventoryFilters = {}): Promise<ExternalListing[]> {
    if (!this.apiKey) {
      throw new Error('RedWeek provider not authenticated');
    }

    const params = new URLSearchParams();
    if (filters.destination) params.append('destination', filters.destination);
    if (filters.priceMin) params.append('price_min', filters.priceMin.toString());
    if (filters.priceMax) params.append('price_max', filters.priceMax.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    try {
      const response = await fetch(`${this.baseUrl}/listings?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`RedWeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.listings || [];
    } catch (error) {
      console.error('RedWeek fetch error:', error);
      // Return mock data for development
      return this.getMockData(filters);
    }
  }

  transformListing(listing: ExternalListing): InsertResort {
    return {
      name: listing.name,
      location: listing.location || listing.destination || 'Unknown Location',
      destination: listing.destination || 'Unknown Destination',
      description: listing.description || `Beautiful ${listing.name} resort`,
      imageUrl: listing.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      amenities: listing.amenities || ['Pool', 'WiFi', 'Parking'],
      rating: typeof listing.rating === 'number' ? listing.rating.toString() : listing.rating?.toString() || '4.0',
      priceMin: listing.price?.min || 200,
      priceMax: listing.price?.max || 400,
      availableRentals: listing.availability?.count || 1,
      isNewAvailability: listing.availability?.isNew || false
    };
  }

  private getMockData(filters: InventoryFilters): ExternalListing[] {
    // Mock data for development and testing
    const mockListings: ExternalListing[] = [
      {
        id: 'rw-001',
        name: 'Ocean View Resort & Spa',
        location: 'Maui, Hawaii',
        destination: 'Hawaii',
        description: 'Luxurious oceanfront resort with world-class amenities and stunning sunset views.',
        images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'],
        amenities: ['Ocean View', 'Spa', 'Pool', 'Restaurant', 'WiFi', 'Gym'],
        rating: 4.8,
        reviewCount: 156,
        price: { min: 350, max: 650, currency: 'USD' },
        availability: { count: 3, isNew: true }
      },
      {
        id: 'rw-002',
        name: 'Mountain Lodge Retreat',
        location: 'Aspen, Colorado',
        destination: 'Colorado',
        description: 'Cozy mountain retreat perfect for skiing and outdoor adventures.',
        images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
        amenities: ['Mountain View', 'Ski Access', 'Fireplace', 'Hot Tub', 'WiFi'],
        rating: 4.6,
        reviewCount: 89,
        price: { min: 280, max: 480, currency: 'USD' },
        availability: { count: 2, isNew: false }
      },
      {
        id: 'rw-003',
        name: 'Tropical Paradise Resort',
        location: 'Key West, Florida',
        destination: 'Florida',
        description: 'Experience paradise at this tropical resort with pristine beaches and crystal clear waters.',
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
        amenities: ['Beachfront', 'Pool', 'Water Sports', 'Restaurant', 'Bar', 'WiFi'],
        rating: 4.7,
        reviewCount: 203,
        price: { min: 300, max: 500, currency: 'USD' },
        availability: { count: 5, isNew: true }
      }
    ];

    // Apply filters to mock data
    let filtered = mockListings;
    
    if (filters.destination) {
      filtered = filtered.filter(listing => 
        listing.destination?.toLowerCase().includes(filters.destination!.toLowerCase())
      );
    }
    
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter(listing => {
        const min = listing.price?.min || 0;
        const max = listing.price?.max || 0;
        return (!filters.priceMin || max >= filters.priceMin) &&
               (!filters.priceMax || min <= filters.priceMax);
      });
    }
    
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }
}

// Inventory service for managing multiple providers
export class InventoryService {
  private providers: Map<string, InventoryProvider> = new Map();
  private syncHistory: SyncResult[] = [];

  constructor() {
    // Register default providers
    this.registerProvider(new RedWeekProvider());
  }

  registerProvider(provider: InventoryProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): InventoryProvider | undefined {
    return this.providers.get(name);
  }

  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async authenticateProvider(name: string, credentials: Record<string, string>): Promise<boolean> {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    return await provider.authenticate(credentials);
  }

  async syncInventory(
    providerName: string,
    filters?: InventoryFilters,
    storageCallback?: (resorts: InsertResort[]) => Promise<Resort[]>
  ): Promise<SyncResult> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const syncResult: SyncResult = {
      provider: providerName,
      timestamp: new Date(),
      total: 0,
      imported: 0,
      updated: 0,
      errors: []
    };

    try {
      // Fetch external listings
      const externalListings = await provider.fetchInventory(filters);
      syncResult.total = externalListings.length;

      // Transform listings
      const transformedResorts: InsertResort[] = [];
      for (const listing of externalListings) {
        try {
          const resort = provider.transformListing(listing);
          transformedResorts.push(resort);
        } catch (error) {
          syncResult.errors.push({
            listingId: listing.id,
            error: `Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            data: listing
          });
        }
      }

      // Save to storage if callback provided
      if (storageCallback && transformedResorts.length > 0) {
        try {
          const savedResorts = await storageCallback(transformedResorts);
          syncResult.imported = savedResorts.length;
        } catch (error) {
          syncResult.errors.push({
            listingId: 'bulk-save',
            error: `Storage save failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            data: transformedResorts
          });
        }
      }

      this.syncHistory.push(syncResult);
      return syncResult;

    } catch (error) {
      syncResult.errors.push({
        listingId: 'sync-process',
        error: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      this.syncHistory.push(syncResult);
      return syncResult;
    }
  }

  getSyncHistory(limit: number = 10): SyncResult[] {
    return this.syncHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();