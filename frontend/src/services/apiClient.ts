/**
 * Enterprise typed HTTP client connecting Next.js with FastAPI backend.
 * Adheres strictly to clean error handling and token forwarding.
 */

import {
  User,
  Course,
  CourseEnrollmentResponse,
  BookDetail,
  DRMTokenData,
  CartItem,
  CartState,
  CouponValidation,
  OrderSummary,
  StudyNote,
  QADiscussion,
  AdminKPIAnalytics,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('zanjirzan_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getAuthHeaders(), ...(options.headers || {}) };
    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch((jsonErr) => {
          console.debug('Failed to parse error response as JSON:', jsonErr);
          return {};
        });
        let errorMessage = errorData.detail || errorData.message;
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.map((err: any) => err.msg || (typeof err === 'object' ? JSON.stringify(err) : String(err))).join(' | ');
        } else if (typeof errorMessage === 'object' && errorMessage !== null) {
          errorMessage = errorMessage.msg || errorMessage.message || JSON.stringify(errorMessage);
        }
        throw new Error(errorMessage || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error.message);
      throw error;
    }
  }

  // --- Auth Module ---
  auth = {
    login: (phone: string, password: string) =>
      this.request<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      }),

    register: (full_name: string, phone: string, password: string) =>
      this.request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ full_name, phone, password }),
      }),

    sendOtp: (phone: string) =>
      this.request<{ success: boolean; phone: string; expires_in_seconds: number; mock_code?: string }>('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),

    verifyOtp: (phone: string, code: string, fullName?: string, password?: string) =>
      this.request<User>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          code,
          ...(fullName ? { full_name: fullName } : {}),
          ...(password ? { password } : {}),
        }),
      }),

    getMe: () => this.request<User>('/auth/me'),

    getSessions: () =>
      this.request<{
        max_concurrent_devices: number;
        active_count: number;
        sessions: Array<{
          id: string;
          device_name: string;
          ip_address?: string;
          created_at: string;
          last_active_at: string;
          is_active: boolean;
          is_current?: boolean;
        }>;
      }>('/auth/sessions'),

    revokeSession: (sessionId: string) =>
      this.request<{ success: boolean; session_id: string }>(`/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      }),

    subscribe: (contact: string) =>
      this.request<{ success: boolean; contact: string; message: string }>('/auth/subscribe', {
        method: 'POST',
        body: JSON.stringify({ contact }),
      }),
  };

  // --- Courses Module ---
  courses = {
    getAll: () => this.request<Course[]>('/courses/'),
    getById: (courseId: string) => this.request<Course>(`/courses/${courseId}`),
    enroll: (courseId: string) =>
      this.request<CourseEnrollmentResponse>(`/courses/${courseId}/enroll`, {
        method: 'POST',
      }),
    getEnrolled: () => this.request<Course[]>('/courses/enrolled'),
    getLiveAccess: (courseId: string) =>
      this.request<{
        success: boolean;
        course_id: string;
        course_title: string;
        schedule: string;
        is_live_now: boolean;
        skyroom_url: string;
        student_display_name: string;
        student_phone?: string;
        ticket_ttl_seconds: number;
        access_role: string;
        notice: string;
      }>(`/courses/${courseId}/live-access`),
    getProgress: (courseId: string) =>
      this.request<{
        course_id: string;
        items: Array<{
          chapter_id: number;
          progress_percent: number;
          last_pos_sec: number;
          updated_at: string;
        }>;
        completed_chapter_ids: number[];
      }>(`/courses/${courseId}/progress`),
    syncProgress: (courseId: string, chapterId: number, progressPercent: number, lastPosSec: number) =>
      this.request('/courses/' + courseId + '/progress', {
        method: 'POST',
        body: JSON.stringify({ chapter_id: chapterId, progress_percent: progressPercent, last_position_sec: lastPosSec }),
      }),
  };

  // --- Books Module ---
  books = {
    getAll: () => this.request<BookDetail[]>('/books/'),
    getById: (bookId: string) => this.request<BookDetail>(`/books/${bookId}`),
    getSample: (bookId: string) => this.request<any>(`/books/${bookId}/sample`),
  };

  // --- Audio DRM Shield ---
  stream = {
    getToken: (userId: string, courseId: string, chapterId: number) =>
      this.request<DRMTokenData>('/stream/token', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, course_id: courseId, chapter_id: chapterId }),
      }),

    heartbeat: (token: string, userId: string, courseId: string, chapterId: number, playbackPositionSec: number) =>
      this.request<{ valid: boolean; next_heartbeat_in_seconds: number; watermark: string }>('/stream/heartbeat', {
        method: 'POST',
        body: JSON.stringify({
          token,
          user_id: userId,
          course_id: courseId,
          chapter_id: chapterId,
          playback_position_sec: playbackPositionSec,
        }),
      }),
  };

  // --- Cart & Checkout ---
  cart = {
    get: () => this.request<CartState>('/cart/'),
    add: (item: CartItem) =>
      this.request<CartState>('/cart/add', {
        method: 'POST',
        body: JSON.stringify(item),
      }),
    remove: (itemId: string) =>
      this.request<CartState>(`/cart/remove/${itemId}`, {
        method: 'DELETE',
      }),
    clear: () =>
      this.request<CartState>('/cart/clear', {
        method: 'DELETE',
      }),
  };

  // --- Coupons Engine ---
  coupons = {
    validate: (code: string, cartTotal: number) =>
      this.request<CouponValidation>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, cart_total: cartTotal }),
      }),
    getAll: () => this.request<any[]>('/coupons/list'),
  };

  // --- Orders & Postal Logistics ---
  orders = {
    create: (data: {
      items: CartItem[];
      shipping_address?: string;
      postal_code?: string;
      recipient_name?: string;
      recipient_phone?: string;
      coupon_code?: string;
    }) =>
      this.request<OrderSummary>('/orders/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getById: (orderId: string) => this.request<OrderSummary>(`/orders/${orderId}`),
    track: (trackingCode: string) => this.request<any>(`/orders/track/${trackingCode}`),
  };

  // --- Banking & Payments ---
  payment = {
    init: (orderId: string, gateway = 'zarinpal', returnUrl = 'http://localhost:3000/checkout/callback') =>
      this.request<{ payment_token: string; gateway_redirect_url: string; order_id: string; amount: number }>('/payment/init', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId, gateway, return_url: returnUrl }),
      }),
    verify: (authority: string, status: string, trackingCode?: string) =>
      this.request<{ success: boolean; reference_id: string; amount: number; order_id: string; card_mask: string; paid_at: string }>('/payment/verify', {
        method: 'POST',
        body: JSON.stringify({ authority, status, tracking_code: trackingCode }),
      }),
  };

  // --- Notes Module ---
  notes = {
    getAll: (courseId?: string) => this.request<StudyNote[]>(`/notes/${courseId ? `?course_id=${courseId}` : ''}`),
    create: (courseId: string, chapterId: number, title: string, content: string, timestampSec: number) =>
      this.request<StudyNote>('/notes/create', {
        method: 'POST',
        body: JSON.stringify({
          course_id: courseId,
          chapter_id: chapterId,
          title,
          content,
          timestamp_sec: timestampSec,
        }),
      }),
    update: (noteId: string, data: { title?: string; content?: string; timestamp_sec?: number }) =>
      this.request<StudyNote>(`/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (noteId: string) =>
      this.request<{ success: boolean }>(`/notes/${noteId}`, {
        method: 'DELETE',
      }),
  };

  // --- Q&A Discussions ---
  qa = {
    getAll: (courseId?: string) => this.request<QADiscussion[]>(`/qa/${courseId ? `?course_id=${courseId}` : ''}`),
    ask: (courseId: string, chapterId: number, title: string, questionText: string) =>
      this.request<QADiscussion>('/qa/ask', {
        method: 'POST',
        body: JSON.stringify({
          course_id: courseId,
          chapter_id: chapterId,
          title,
          question_text: questionText,
        }),
      }),
    answer: (questionId: string, answerText: string) =>
      this.request<QADiscussion>(`/qa/${questionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer_text: answerText }),
      }),
  };

  // --- Admin Cockpit ---
  admin = {
    getAnalytics: () => this.request<AdminKPIAnalytics>('/admin/analytics'),
    createCourse: (data: { title: string; instructor: string; level: string; hours: string; price: string; description: string }) =>
      this.request<any>('/admin/courses/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateCourse: (courseId: string, data: any) =>
      this.request<any>(`/admin/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteCourse: (courseId: string) =>
      this.request<any>(`/admin/courses/${courseId}`, {
        method: 'DELETE',
      }),
    addChapter: (courseId: string, data: any) =>
      this.request<any>(`/admin/courses/${courseId}/chapters`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateChapter: (courseId: string, chapterId: number, data: any) =>
      this.request<any>(`/admin/courses/${courseId}/chapters/${chapterId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteChapter: (courseId: string, chapterId: number) =>
      this.request<any>(`/admin/courses/${courseId}/chapters/${chapterId}`, {
        method: 'DELETE',
      }),
    updateBook: (bookId: string, data: any) =>
      this.request<any>(`/admin/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateOrderStatus: (orderId: string, newStatus: string, postalBarcode?: string) =>
      this.request<any>('/admin/orders/update-status', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId, new_status: newStatus, postal_barcode: postalBarcode }),
      }),
    getConfig: () => this.request<any>('/admin/public-config'),
    updateConfig: (config: any) =>
      this.request<{ success: boolean; config: any }>('/admin/site-config', {
        method: 'PUT',
        body: JSON.stringify(config),
      }),
    getArticles: () => this.request<any[]>('/admin/public-articles'),
    createArticle: (data: any) =>
      this.request<{ success: boolean; article: any }>('/admin/articles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateArticle: (id: string, data: any) =>
      this.request<{ success: boolean; article: any }>(`/admin/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteArticle: (id: string) =>
      this.request<{ success: boolean; id: string }>(`/admin/articles/${id}`, {
        method: 'DELETE',
      }),
    getCategories: () => this.request<any[]>('/admin/public-categories'),
    createCategory: (data: any) =>
      this.request<{ success: boolean; category: any }>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateCategory: (id: string, data: any) =>
      this.request<{ success: boolean; category: any }>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteCategory: (id: string) =>
      this.request<{ success: boolean; id: string }>(`/admin/categories/${id}`, {
        method: 'DELETE',
      }),
    createBook: (data: any) =>
      this.request<{ success: boolean; book: any }>('/admin/books', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteBook: (bookId: string) =>
      this.request<{ success: boolean; book_id: string }>(`/admin/books/${bookId}`, {
        method: 'DELETE',
      }),
    getCoupons: () => this.request<any[]>('/admin/coupons'),
    createCoupon: (data: any) =>
      this.request<{ success: boolean; coupon: any }>('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    toggleCoupon: (code: string) =>
      this.request<{ success: boolean; code: string; active: boolean }>(`/admin/coupons/${code}/toggle`, {
        method: 'PUT',
      }),
    deleteCoupon: (code: string) =>
      this.request<{ success: boolean; code: string }>(`/admin/coupons/${code}`, {
        method: 'DELETE',
      }),
    getMetrics: () => this.request<any>('/observability/metrics'),
    uploadMedia: async (file: File): Promise<{ success: boolean; file_url: string; filename: string; original_filename: string }> => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zanjirzan_token') : null;
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || 'خطا در بارگذاری فایل');
      }
      return await res.json();
    },
  };

  // --- AI Scholarly Assistant ---
  ai = {
    chat: (data: {
      message: string;
      history?: Array<{ role: string; content: string }>;
      subject_filter?: string;
      course_id?: string;
      file_context?: string;
      file_name?: string;
      lang?: string;
    }) =>
      this.request<{
        reply: string;
        citations: Array<{
          source: string;
          page_or_session: string;
          snippet: string;
          media_type?: string;
          timestamp_label?: string;
          start_sec?: number;
          end_sec?: number;
        }>;
        suggested_followups: string[];
        scholar_identity: string;
      }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    streamChat: async (
      data: {
        message: string;
        history?: Array<{ role: string; content: string }>;
        subject_filter?: string;
        course_id?: string;
        file_context?: string;
        file_name?: string;
        lang?: string;
        strict_corpus_only?: boolean;
      },
      onChunk?: (chunkOrAccumulated: string) => void,
      onDone?: (terminalData: {
        reply: string;
        citations: Array<{
          source: string;
          page_or_session: string;
          snippet: string;
          media_type?: string;
          timestamp_label?: string;
          start_sec?: number;
          end_sec?: number;
        }>;
        suggested_followups: string[];
        scholar_identity: string;
      }) => void,
      onError?: (err: any) => void,
      signal?: AbortSignal
    ): Promise<{
      reply: string;
      citations: Array<{
        source: string;
        page_or_session: string;
        snippet: string;
        media_type?: string;
        timestamp_label?: string;
        start_sec?: number;
        end_sec?: number;
      }>;
      suggested_followups: string[];
      scholar_identity: string;
    }> => {
      const url = `${API_BASE_URL}/ai/chat/stream`;
      const headers = { ...this.getAuthHeaders() };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          signal,
        });

        if (!response.ok || !response.body) {
          if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
          const fallback = await this.ai.chat(data);
          if (onDone) onDone(fallback as any);
          return fallback as any;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let finalPayload: any = null;
        let accumulated = '';

        try {
          while (true) {
            if (signal?.aborted) {
              await reader.cancel();
              throw new DOMException('Aborted', 'AbortError');
            }
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const dataStr = trimmed.slice(5).trim();
              if (!dataStr) continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  accumulated += parsed.chunk;
                  if (onChunk) onChunk(accumulated);
                }
                if (parsed.done) {
                  finalPayload = parsed;
                }
              } catch (chunkErr) {
                console.debug('Ignoring non-JSON or partial SSE chunk:', chunkErr);
              }
            }
          }
        } catch (readErr: any) {
          if (signal?.aborted || readErr?.name === 'AbortError') {
            try {
              await reader.cancel();
            } catch (cancelErr) {
              console.debug('Reader cancel ignored:', cancelErr);
            }
          }
          throw readErr;
        } finally {
          try {
            reader.releaseLock();
          } catch (lockErr) {
            console.debug('Reader release lock ignored:', lockErr);
          }
        }

        const finalResult = {
          reply: finalPayload?.reply || accumulated,
          citations: finalPayload?.citations || [],
          suggested_followups: finalPayload?.suggested_followups || [],
          scholar_identity: finalPayload?.scholar_identity || 'حجت الاسلام دکتر زنجیر زن حسینی',
        };

        if (onDone) {
          onDone(finalResult);
        }
        return finalResult;
      } catch (err: any) {
        if (signal?.aborted || err?.name === 'AbortError') {
          if (onError) {
            onError(err);
          }
          throw err;
        }
        if (onError) {
          onError(err);
        }
        return (await this.ai.chat(data)) as any;
      }
    },

    ingestMediaTranscript: (data: {
      course_id?: string;
      media_id?: string;
      chapter_id?: number;
      course_title?: string;
      title?: string;
      subject?: string;
      source?: string;
      media_type?: string;
      transcript?: string;
      transcript_text?: string;
      session_name?: string;
      chunk_duration_sec?: number;
    }) =>
      this.request<{
        success: boolean;
        message: string;
        added_segments_count?: number;
        chunks_created?: number;
        total_indexed_chunks?: number;
        chunks?: any[];
      }>('/ai/ingest-media-transcript', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getIndexStats: () =>
      this.request<{
        total_chunks: number;
        indexed_chunks_count?: number;
        audio_chunks: number;
        video_chunks: number;
        audio_video_segments_count?: number;
        text_chunks: number;
        total_courses: number;
        scholar_name: string;
        scholar_identity?: string;
        strict_corpus_only?: boolean;
        status?: string;
        persistence_file?: string;
        persisted_media_files?: number;
      }>('/ai/index-stats'),

    reindex: () =>
      this.request<{
        success: boolean;
        message: string;
        total_chunks: number;
      }>('/ai/reindex', {
        method: 'POST',
      }),

    transcribe: (audioBase64: string, format = 'webm') =>
      this.request<{ text: string; confidence: number }>('/ai/transcribe', {
        method: 'POST',
        body: JSON.stringify({ audio_base64: audioBase64, format }),
      }),

    analyzeDocument: (documentText: string, title?: string) =>
      this.request<{
        summary: string;
        dialectic_theses: string[];
        philosophical_framework: string;
        critique: string;
      }>('/ai/analyze-document', {
        method: 'POST',
        body: JSON.stringify({ document_text: documentText, title }),
      }),
  };

  // --- Academic Certificates Module ---
  certificates = {
    verify: (code: string) =>
      this.request<{
        valid: boolean;
        status?: string;
        certificate_code?: string;
        student_name?: string;
        course_title?: string;
        course_id?: string;
        score?: string;
        issued_at?: string;
        institute?: string;
        message?: string;
      }>(`/certificates/verify/${encodeURIComponent(code)}`),
    issue: (courseId: string, score: string = 'عالی (۱۰۰ از ۱۰۰)') =>
      this.request<{
        id: string;
        user_id: string;
        course_id: string;
        certificate_code: string;
        score: string;
        issued_at: string;
      }>('/certificates/issue', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId, score }),
      }),
    myCertificates: () =>
      this.request<
        Array<{
          id: string;
          user_id: string;
          course_id: string;
          certificate_code: string;
          score: string;
          issued_at: string;
        }>
      >('/certificates/my'),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
