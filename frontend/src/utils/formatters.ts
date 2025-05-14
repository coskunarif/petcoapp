/**
 * Formats a number as currency
 * @param amount Number to format as currency
 * @param locale Optional locale string (defaults to user's locale)
 * @param currency Optional currency code (defaults to USD)
 * @returns Formatted currency string or empty string if value is null/undefined
 */
export const formatCurrency = (
  amount: number | null | undefined,
  locale?: string,
  currency: string = 'USD'
): string => {
  if (amount === null || amount === undefined) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback to basic formatting if Intl fails
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Formats a date string into a readable format
 * @param dateString ISO date string
 * @param format Format to return ('full', 'short', 'time', or 'relative')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format: 'full' | 'short' | 'time' | 'relative' = 'full'): string => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'full':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    
    case 'relative':
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInSecs = Math.floor(diffInMs / 1000);
      const diffInMins = Math.floor(diffInSecs / 60);
      const diffInHours = Math.floor(diffInMins / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInSecs < 60) {
        return 'just now';
      } else if (diffInMins < 60) {
        return `${diffInMins}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
  }
};