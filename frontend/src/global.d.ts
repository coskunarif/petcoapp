// Global module declarations to satisfy TypeScript

declare module '@tanstack/react-query';
declare module '@tanstack/react-query/*';

declare module '../../lib/supabase' {
  export const supabase: any;
}
