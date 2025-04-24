// Simple analytics utility placeholder
export function logEvent(event: string, params?: Record<string, any>) {
  // Integrate with your analytics provider here (e.g., Firebase, Segment)
  // For now, just log to console
  console.log(`[Analytics] ${event}`, params);
}
