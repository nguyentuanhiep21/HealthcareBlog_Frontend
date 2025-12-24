"use client"

import { useState } from "react"

interface SafeAvatarProps {
  src?: string | null
  alt: string
  className?: string
  fallback?: string
}

/**
 * Avatar component với error handling
 * Tự động fallback về placeholder khi không load được ảnh
 */
export function SafeAvatar({ 
  src, 
  alt, 
  className = "h-10 w-10 rounded-full object-cover",
  fallback = "/placeholder.svg"
}: SafeAvatarProps) {
  const [error, setError] = useState(false)
  
  const avatarSrc = error || !src ? fallback : src

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
