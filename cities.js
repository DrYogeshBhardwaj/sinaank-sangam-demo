// Local Database of Major Global Cities for Instant Search and Offline Support
export const defaultCities = [
  { name: "New Delhi", country: "India", lat: 28.6139, lon: 77.2090, timezone: "Asia/Kolkata", offset: 5.5 },
  { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777, timezone: "Asia/Kolkata", offset: 5.5 },
  { name: "Bengaluru", country: "India", lat: 12.9716, lon: 77.5946, timezone: "Asia/Kolkata", offset: 5.5 },
  { name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639, timezone: "Asia/Kolkata", offset: 5.5 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, timezone: "Europe/London", offset: 0 },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.0060, timezone: "America/New_York", offset: -5 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437, timezone: "America/Los_Angeles", offset: -8 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, timezone: "Asia/Tokyo", offset: 9 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, timezone: "Australia/Sydney", offset: 10 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, timezone: "Europe/Paris", offset: 1 },
  { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, timezone: "Europe/Berlin", offset: 1 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, timezone: "Europe/Moscow", offset: 3 },
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708, timezone: "Asia/Dubai", offset: 4 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, timezone: "Asia/Singapore", offset: 8 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473, timezone: "Africa/Johannesburg", offset: 2 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, timezone: "Africa/Cairo", offset: 2 },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729, timezone: "America/Sao_Paulo", offset: -3 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832, timezone: "America/Toronto", offset: -5 }
];

export function searchCities(query) {
  if (!query) return [];
  const normalizedQuery = query.toLowerCase();
  return defaultCities.filter(
    city =>
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.country.toLowerCase().includes(normalizedQuery)
  );
}
