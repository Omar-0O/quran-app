import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'quran-audio.mp3';

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    // جلب الملف الصوتي مع تتبع التوجيهات تلقائياً (follow redirects)
    const upstreamResponse = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: '*/*',
      },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      // في حال تعثر الخادم نحول المتصفح للرابط مباشرة
      return NextResponse.redirect(url, 302);
    }

    const headers = new Headers();
    const contentType = upstreamResponse.headers.get('content-type') || 'audio/mpeg';
    headers.set('Content-Type', contentType);

    // تجهيز اسم الملف باللغة العربية بطريقة قياسية متوافقة مع جميع المتصفحات RFC 5987
    const encodedFilename = encodeURIComponent(filename);
    const asciiSafeFilename = filename.replace(/[^\x20-\x7E]/g, '_');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${asciiSafeFilename}"; filename*=UTF-8''${encodedFilename}`
    );

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    // تمرير دفق البيانات مباشرة لتقليل استهلاك الذاكرة وسرعة التحميل
    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Download route error:', err);
    return NextResponse.redirect(url, 302);
  }
}
