"""
Locust Performance & Stress Load Test: 1,000 Concurrent Students.
Simulates realistic student behaviors across the platform:
  1. Browsing public course catalog & categories.
  2. Requesting DRM audio stream token for lecture playback.
  3. Streaming audio via HTTP Range headers (0-32767).
  4. Reading philosophical books & table of contents.
  5. Reading scholarly research articles.
  6. Querying AI Philosophical Assistant (Q&A).
"""
import random
from locust import HttpUser, task, between, events


class PlatformStudentUser(HttpUser):
    # Wait between 1 and 3 seconds between actions to simulate human reading/listening
    wait_time = between(1.0, 3.0)

    def on_start(self):
        """User session initialization: authenticates or acquires guest session."""
        self.auth_token = None
        # Attempt to login or acquire guest credentials
        try:
            res = self.client.post(
                "/api/v1/auth/login",
                data={"username": "09123456789", "password": "pass"},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if res.status_code == 200:
                data = res.json()
                self.auth_token = data.get("access_token")
        except Exception:
            pass

    @task(5)
    def browse_courses_catalog(self):
        """Browse full course catalog (cached via Redis)."""
        self.client.get("/api/v1/courses/", name="[Catalog] List Courses")

    @task(3)
    def browse_categories_and_config(self):
        """Fetch scientific categories and site configuration."""
        self.client.get("/api/v1/admin/public-categories", name="[Catalog] Categories")
        self.client.get("/api/v1/admin/public-config", name="[Config] Site Config")

    @task(4)
    def view_course_detail(self):
        """View individual course details and lecture syllabus."""
        course_ids = ["course-mabadi-mantiq", "course-bidayat", "course-nihayat", "course-asfar"]
        cid = random.choice(course_ids)
        self.client.get(f"/api/v1/courses/{cid}", name="[Course] Detail & Syllabus")

    @task(4)
    def request_audio_drm_token(self):
        """Acquire short-lived DRM signed token for audio playback."""
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        self.client.post(
            "/api/v1/stream/token",
            json={"course_id": "course-mabadi-mantiq", "chapter_id": 1},
            headers=headers,
            name="[DRM] Request Stream Token",
        )

    @task(3)
    def stream_audio_range_request(self):
        """Simulate media player seeking with HTTP Range headers."""
        headers = {"Range": "bytes=0-32767"}
        self.client.get(
            "/audio/sample_lecture.wav",
            headers=headers,
            name="[Audio] Stream Chunk (Range)",
        )

    @task(3)
    def browse_books_catalog(self):
        """Fetch scholarly books."""
        self.client.get("/api/v1/books/", name="[Books] List Books")

    @task(2)
    def read_scholarly_articles(self):
        """Fetch published research papers."""
        self.client.get("/api/v1/admin/public-articles", name="[Articles] List Articles")

    @task(1)
    def query_ai_tutor(self):
        """Ask question from AI philosophical corpus."""
        questions = [
            "تعریف تصور و تصدیق در منطق چیست؟",
            "اصالت وجود به چه معناست؟",
            "فرق ماهیت و وجود در حکمت متعالیه چیست؟",
        ]
        q = random.choice(questions)
        self.client.post(
            "/api/v1/ai/ask",
            json={"question": q, "course_id": "course-mabadi-mantiq"},
            name="[AI] Ask Question",
        )
