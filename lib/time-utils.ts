// Convert to GMT+7 (Vietnam timezone)
export function toGMT7(date: Date): Date {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  return new Date(utc + (3600000 * 7))
}

export function formatTimeAgo(dateString: string): string {
  const now = toGMT7(new Date())
  const date = toGMT7(new Date(dateString))
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "Vừa xong"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} năm trước`
}
