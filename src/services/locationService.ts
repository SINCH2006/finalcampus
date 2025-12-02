// src/services/locationService.ts
/**
 * Location tracking service for drivers
 * This should be integrated into the driver's mobile app or web interface
 */

import { updateDriverLocationInDriversCollection } from '@/firebase';

export class LocationService {
  private watchId: number | null = null;
  private driverId: string;
  private updateInterval: number = 10000; // Update every 10 seconds
  private intervalId: NodeJS.Timeout | null = null;

  constructor(driverId: string) {
    this.driverId = driverId;
  }

  // Start tracking location
  startTracking(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Request permission and start watching
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.handleLocationUpdate(position);
          resolve();
        },
        (error) => {
          console.error('Location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      // Also update at regular intervals
      this.intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => this.handleLocationUpdate(position),
          (error) => console.error('Interval location error:', error),
          { enableHighAccuracy: true }
        );
      }, this.updateInterval);
    });
  }

  // Stop tracking location
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Handle location update
  private async handleLocationUpdate(position: GeolocationPosition): Promise<void> {
    try {
      await updateDriverLocationInDriversCollection(this.driverId, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date(position.timestamp),
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }

  // Get current position once
  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { enableHighAccuracy: true }
      );
    });
  }

  // Check if location tracking is active
  isTracking(): boolean {
    return this.watchId !== null;
  }

  // Set update interval
  setUpdateInterval(milliseconds: number): void {
    this.updateInterval = milliseconds;
    
    // Restart interval if currently tracking
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => this.handleLocationUpdate(position),
          (error) => console.error('Interval location error:', error),
          { enableHighAccuracy: true }
        );
      }, this.updateInterval);
    }
  }
}

// Singleton instance for driver
let locationServiceInstance: LocationService | null = null;

export function initializeLocationService(driverId: string): LocationService {
  if (locationServiceInstance) {
    locationServiceInstance.stopTracking();
  }
  locationServiceInstance = new LocationService(driverId);
  return locationServiceInstance;
}

export function getLocationService(): LocationService | null {
  return locationServiceInstance;
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Calculate ETA based on distance and average speed
export function calculateETA(
  currentLat: number,
  currentLon: number,
  destLat: number,
  destLon: number,
  averageSpeed: number = 30 // km/h
): number {
  const distance = calculateDistance(currentLat, currentLon, destLat, destLon);
  const hours = distance / averageSpeed;
  const minutes = Math.round(hours * 60);
  return minutes;
}
