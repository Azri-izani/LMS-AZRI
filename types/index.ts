export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface CourseSettings {
  id: string
  course_name: string
  course_code: string
  course_description: string
  lecturer_name: string
  updated_at: string
}

export interface Topic {
  id: string
  title: string
  description: string
  order_no: number
  created_at: string
}

export interface Note {
  id: string
  topic_id: string
  title: string
  file_url: string
  file_name: string
  created_at: string
  topic?: Topic
}

export interface Video {
  id: string
  topic_id: string
  title: string
  youtube_url: string
  description: string
  created_at: string
  topic?: Topic
}

export interface PastYear {
  id: string
  year: number
  semester: string
  title: string
  question_pdf_url: string
  answer_pdf_url: string | null
  answer_visible: boolean
  created_at: string
}

export interface Student {
  id: string
  name: string
  matric_no: string
  created_at: string
}

export interface NoteChunk {
  id: string
  note_id: string
  topic_id: string
  content: string
  chunk_index: number
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}
