/**
 * Domain TypeScript models and interfaces aligned with backend FastAPI schemas.
 */

export interface User {
  id: string;
  full_name: string;
  phone: string;
  role: 'student' | 'admin';
  wallet_balance: string;
  enrolled_courses_count: number;
  enrolled_course_ids?: string[];
  access_token?: string;
  avatar_url?: string;
}

export interface CourseEnrollmentResponse {
  success: boolean;
  message: string;
  enrollment_id?: string;
  course_id: string;
  enrolled_at?: string;
  status?: string;
}

export interface Chapter {
  id: number;
  title: string;
  duration: string;
  duration_sec: number;
  is_preview: boolean;
  audio_stream_url: string;
  video_stream_url?: string;
  media_type?: 'audio' | 'video';
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  instructor: string;
  level: string;
  hours: string;
  sessions_count: number;
  rating: number;
  students_count: number;
  original_price: string;
  price: string;
  discount_percent: number;
  badge: string;
  thumbnail: string;
  description: string;
  tags: string[];
  syllabus: Chapter[];
  media_type?: 'audio' | 'video';
  course_type?: 'online' | 'offline' | 'hybrid';
  capacity?: number;
  enrolled_count?: number;
  skyroom_url?: string;
  schedule?: string;
}

export interface BookChapterTOC {
  id: number;
  title: string;
  page_number: number;
}

export interface SamplePageSpread {
  page_number: number;
  title: string;
  excerpt: string;
  is_locked: boolean;
}

export interface BookDetail {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  print_edition: string;
  pages_count: number;
  isbn: string;
  price: string;
  physical_price: string;
  format: string;
  cover_image: string;
  sample_pdf_url: string;
  fidibo_reader_url: string;
  synopsis: string;
  table_of_contents: BookChapterTOC[];
  sample_reading: SamplePageSpread[];
}

export interface DRMTokenData {
  token: string;
  expires_in_seconds: number;
  forensic_watermark: string;
  stream_url: string;
}

export interface CartItem {
  item_id: string;
  item_type: 'course' | 'book_digital' | 'book_physical' | 'book_print';
  title: string;
  price: number;
  quantity: number;
  cover_image?: string;
}

export interface CartState {
  items: CartItem[];
  items_count: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface CouponValidation {
  code: string;
  valid: boolean;
  discount_percent: number;
  discount_amount: number;
  final_total: number;
  message: string;
}

export interface OrderSummary {
  order_id: string;
  tracking_number: string;
  status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  postal_barcode_24digit?: string;
}

export interface StudyNote {
  id: string;
  user_id: string;
  course_id: string;
  chapter_id: number;
  title: string;
  content: string;
  timestamp_sec: number;
  created_at: string;
}

export interface QADiscussion {
  id: string;
  course_id: string;
  chapter_id?: number;
  user_id?: string;
  user_name: string;
  title: string;
  question_text: string;
  answer_text?: string;
  is_resolved?: boolean;
  is_answered?: boolean;
  created_at: string;
  answered_at?: string;
}

export interface AdminKPIAnalytics {
  total_students: number;
  total_revenue_tomans: string;
  total_courses_sold: number;
  total_books_shipped: number;
  active_streams_today: number;
  monthly_sales_growth: string;
}
