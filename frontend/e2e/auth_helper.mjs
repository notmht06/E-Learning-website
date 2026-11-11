const API_URL = 'http://127.0.0.1:8000/api/v1';

export async function getAuthenticatedSession(role = 'STUDENT') {
  const phone = role === 'ADMIN' ? '09120000000' : '09123456789';
  const fullName = role === 'ADMIN' ? 'حجت الاسلام دکتر زنجیرزن حسینی' : 'Ali Mousavi';
  const password = role === 'ADMIN' ? (process.env.ADMIN_INITIAL_PASSWORD || 'admin_secret_2026') : 'pass';

  let token = null;
  let user = null;

  // 1. Try password login
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.access_token;
      user = data;
    }
  } catch (e) {
    // ignore
  }

  // 2. Try OTP login if password login didn't succeed
  if (!token) {
    try {
      const otpRes = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const otpData = await otpRes.json();
      const code = otpData.mock_code || '12345';

      const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, full_name: fullName }),
      });
      if (verifyRes.ok) {
        const data = await verifyRes.json();
        token = data.access_token;
        user = data;
      }
    } catch (e) {
      console.error('OTP flow failed:', e);
    }
  }

  const profile = {
    id: user?.id || (role === 'ADMIN' ? 'adm-001' : 'usr-140301'),
    name: fullName,
    full_name: fullName,
    phone,
    role: role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
    enrolledCourseIds: [
      'course-falsafe-asfar-1',
      'course-ishraq',
      'course-mantiq-mabadi',
      'course1',
      'course2',
      'course3',
    ],
    purchasedBookIds: ['book1', 'book2', 'book3'],
    enrolled_courses_count: 6,
    wallet_balance: '۰ تومان',
  };

  return {
    token: token || 'test-bearer-token',
    profile,
  };
}

export async function injectAuth(page, session) {
  await page.addInitScript(({ token, profile }) => {
    localStorage.setItem('zanjirzan_token', token);
    localStorage.setItem('zanjirzan_user', JSON.stringify(profile));
  }, session);
}
