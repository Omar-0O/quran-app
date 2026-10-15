import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'audio.mp3';

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      // إذا فشل الخادم في الجلب، نحول المتصفح مباشرة إلى رابط الملف
      return NextResponse.redirect(url, 302);
    }

    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch {
    // في حال وجود مشكلة شبكة داخل الخادم، يتم توجيه المتصفح مباشرة
    return NextResponse.redirect(url, 302);
  }
}
