import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Get the API base URL from environment variables or use default
 * @returns The API base URL
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223'
}