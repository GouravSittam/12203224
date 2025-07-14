/**
 * Geolocation utilities for URL Shortener Microservice
 */

import geoip from "geoip-lite";

/**
 * Gets geographical location from IP address
 * @param ipAddress - The IP address to lookup
 * @returns Location information or null if not found
 */
export function getLocationFromIP(ipAddress: string): string | null {
  try {
    // Handle IPv6 loopback and localhost
    if (
      ipAddress === "::1" ||
      ipAddress === "localhost" ||
      ipAddress === "unknown"
    ) {
      return "Local";
    }

    // Remove port number if present
    const cleanIP = ipAddress.split(":")[0];

    // Lookup location
    const geo = geoip.lookup(cleanIP);

    if (!geo) {
      return "Unknown";
    }

    // Format location string
    const parts: string[] = [];

    if (geo.city) {
      parts.push(geo.city);
    }

    if (geo.region) {
      parts.push(geo.region);
    }

    if (geo.country) {
      parts.push(geo.country);
    }

    return parts.length > 0 ? parts.join(", ") : "Unknown";
  } catch (error) {
    return "Unknown";
  }
}

/**
 * Gets detailed location information from IP address
 * @param ipAddress - The IP address to lookup
 * @returns Detailed location object
 */
export function getDetailedLocation(ipAddress: string): {
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  location: string;
} {
  try {
    // Handle IPv6 loopback and localhost
    if (
      ipAddress === "::1" ||
      ipAddress === "localhost" ||
      ipAddress === "unknown"
    ) {
      return {
        location: "Local",
      };
    }

    // Remove port number if present
    const cleanIP = ipAddress.split(":")[0];

    // Lookup location
    const geo = geoip.lookup(cleanIP);

    if (!geo) {
      return {
        location: "Unknown",
      };
    }

    // Format location string
    const parts: string[] = [];

    if (geo.city) {
      parts.push(geo.city);
    }

    if (geo.region) {
      parts.push(geo.region);
    }

    if (geo.country) {
      parts.push(geo.country);
    }

    return {
      city: geo.city,
      region: geo.region,
      country: geo.country,
      timezone: geo.timezone,
      location: parts.length > 0 ? parts.join(", ") : "Unknown",
    };
  } catch (error) {
    return {
      location: "Unknown",
    };
  }
}
