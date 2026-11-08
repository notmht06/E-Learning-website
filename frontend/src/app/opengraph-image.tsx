import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'پایگاه رسمی نشر آثار و دروس حجت الاسلام دکتر زنجیرزن حسینی — حیات';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0C0D0E',
          color: '#FAF8F5',
          padding: '64px',
          border: '16px solid #141518',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #22242A',
            paddingBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              color: '#C58B43',
              fontSize: 22,
              letterSpacing: '0.1em',
            }}
          >
            <span>پایگاه حکمت و معرفت اسلامی</span>
          </div>
          <div
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              backgroundColor: '#8A532B',
              color: '#FAF8F5',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            zanjirzan.ir
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              color: '#FAF8F5',
              lineHeight: 1.3,
            }}
          >
            پایگاه رسمی حجت الاسلام دکتر زنجیرزن حسینی
          </div>
          <div
            style={{
              fontSize: 30,
              color: '#C58B43',
              fontWeight: 600,
            }}
          >
            آرشیو جامع درس‌گفتارهای علوم عقلی و نقلی، شرح اسفار اربعه، حکمت اشراق و کتب چاپی
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #22242A',
            paddingTop: '28px',
            fontSize: 20,
            color: '#A1A1AA',
          }}
        >
          <div>
            <span>تخصصی‌ترین درگاه پژوهش و آموزش حکمت اسلامی</span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>۲۱ دوره تخصصی</span>
            <span>•</span>
            <span>بیش از ۱۰۰ ساعت تدریس</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
