import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extract YouTube video ID dari pelbagai format URL
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Format YouTube thumbnail URL
export function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

// Format YouTube embed URL
export function getYouTubeEmbed(url: string): string {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : ''
}

// Format tarikh
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Split teks kepada chunks untuk RAG
export function splitIntoChunks(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim()) chunks.push(chunk.trim())
    i += chunkSize - overlap
  }
  return chunks
}
