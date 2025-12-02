// src/utils/demandPredictor.ts

interface TimeSeriesData {
  timestamp: Date | any;
  value: number;
  zone: string;
}

interface ZonePrediction {
  zone: string;
  currentDemand: number;
  predictedDemand: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Simple moving average for demand prediction
 */
function calculateMovingAverage(data: number[], window: number = 5): number {
  if (data.length === 0) return 0;
  const validWindow = Math.min(window, data.length);
  const slice = data.slice(-validWindow);
  return Math.round(slice.reduce((sum, val) => sum + val, 0) / slice.length);
}

/**
 * Calculate trend based on recent data
 */
function calculateTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-5);
  const older = data.slice(-10, -5);
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  const threshold = 2;
  
  if (diff > threshold) return 'increasing';
  if (diff < -threshold) return 'decreasing';
  return 'stable';
}

/**
 * Predict demand for multiple zones
 */
export function predictMultiZoneDemand(
  historicalData: TimeSeriesData[],
  zones: string[],
  hoursAhead: number = 1
): ZonePrediction[] {
  const predictions: ZonePrediction[] = [];
  
  for (const zone of zones) {
    // Filter data for this zone
    const zoneData = historicalData.filter(d => d.zone === zone);
    
    // Extract demand values
    const demandValues = zoneData.map(d => d.value);
    
    // Current demand (sum of recent requests)
    const currentDemand = demandValues.slice(-10).reduce((sum, val) => sum + val, 0);
    
    // Predict using moving average with time-of-day adjustment
    let predictedDemand = calculateMovingAverage(demandValues, 10);
    
    // Apply time-based multiplier
    const currentHour = new Date().getHours();
    const timeMultiplier = getTimeMultiplier(currentHour, hoursAhead);
    predictedDemand = Math.round(predictedDemand * timeMultiplier);
    
    // Calculate confidence (based on data availability)
    const confidence = Math.min(95, 60 + Math.min(35, zoneData.length * 2));
    
    // Calculate trend
    const trend = calculateTrend(demandValues);
    
    predictions.push({
      zone,
      currentDemand,
      predictedDemand: Math.max(0, predictedDemand),
      confidence,
      trend
    });
  }
  
  return predictions;
}

/**
 * Get time-based multiplier for predictions
 */
function getTimeMultiplier(currentHour: number, hoursAhead: number): number {
  const targetHour = (currentHour + hoursAhead) % 24;
  
  // Peak hours: 8-10 AM and 5-7 PM
  if ((targetHour >= 8 && targetHour <= 10) || (targetHour >= 17 && targetHour <= 19)) {
    return 1.5;
  }
  
  // Moderate hours: 11 AM - 4 PM
  if (targetHour >= 11 && targetHour <= 16) {
    return 1.2;
  }
  
  // Low demand hours: late night
  if (targetHour >= 22 || targetHour <= 6) {
    return 0.3;
  }
  
  return 1.0;
}

/**
 * Generate synthetic data for demonstration
 */
export function generateSyntheticData(
  zones: string[],
  days: number = 30
): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let day = days; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);
      
      for (const zone of zones) {
        // Base demand varies by zone
        const zoneIndex = zones.indexOf(zone);
        const baseDemand = 5 + zoneIndex * 2;
        
        // Time-based variation
        let demand = baseDemand;
        if (hour >= 8 && hour <= 10) demand *= 2; // Morning peak
        if (hour >= 17 && hour <= 19) demand *= 1.8; // Evening peak
        if (hour >= 22 || hour <= 6) demand *= 0.3; // Night
        
        // Add some randomness
        demand = demand * (0.8 + Math.random() * 0.4);
        
        // Weekend variation
        const dayOfWeek = timestamp.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          demand *= 0.6;
        }
        
        data.push({
          timestamp,
          value: Math.round(demand),
          zone
        });
      }
    }
  }
  
  return data;
}

/**
 * Detect anomalies in demand patterns
 */
export function detectAnomalies(
  historicalData: TimeSeriesData[],
  zone: string
): boolean {
  const zoneData = historicalData.filter(d => d.zone === zone);
  
  if (zoneData.length < 20) return false;
  
  // Get recent data
  const recentValues = zoneData.slice(-10).map(d => d.value);
  const historicalValues = zoneData.slice(0, -10).map(d => d.value);
  
  if (historicalValues.length === 0) return false;
  
  // Calculate statistics
  const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  const historicalAvg = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
  const historicalStdDev = calculateStdDev(historicalValues, historicalAvg);
  
  // Detect if recent demand is significantly different
  const zScore = Math.abs((recentAvg - historicalAvg) / (historicalStdDev || 1));
  
  // Anomaly if z-score > 2 (2 standard deviations away)
  return zScore > 2;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Optimize route based on demand predictions
 */
export function optimizeRoute(
  predictions: ZonePrediction[],
  availableVehicles: number
): { zone: string; recommendedVehicles: number }[] {
  const totalDemand = predictions.reduce((sum, p) => sum + p.predictedDemand, 0);
  
  return predictions.map(pred => ({
    zone: pred.zone,
    recommendedVehicles: Math.max(
      1,
      Math.round((pred.predictedDemand / totalDemand) * availableVehicles)
    )
  }));
}