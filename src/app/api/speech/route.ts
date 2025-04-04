import { NextResponse } from 'next/server';

// 더미 오디오 데이터 URL (API 접근이 불가능할 때 사용)
const getDummyAudioURL = (lang: string) => {
  if (lang === 'th') {
    // 태국어 발음 기본 오디오 (정적 파일로 대체 가능)
    return 'https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/th/สวัสดี.mp3';
  } else {
    // 영어 발음 기본 오디오 (정적 파일로 대체 가능)
    return 'https://ssl.gstatic.com/dictionary/static/pronunciation/2022-03-02/audio/en/hello.mp3';
  }
};

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'th';
    
    if (!text) {
      return NextResponse.json({ error: '텍스트 파라미터가 필요합니다.' }, { status: 400 });
    }
    
    // 텍스트 URL 인코딩
    const encodedText = encodeURIComponent(text);
    
    try {
      // Google Translate TTS URL 생성
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;
      
      // 서버에서 Google TTS 요청
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        },
      });
      
      if (!response.ok) {
        throw new Error(`TTS 요청 실패: ${response.status} ${response.statusText}`);
      }
      
      // 응답 데이터 (오디오 파일)
      const audioData = await response.arrayBuffer();
      
      // 클라이언트로 오디오 데이터 전송
      return new NextResponse(audioData, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (fetchError) {
      console.error('Google TTS 요청 실패:', fetchError);
      
      // 대체 오디오 URL을 리다이렉트로 제공
      const fallbackURL = getDummyAudioURL(lang);
      
      return NextResponse.redirect(fallbackURL);
    }
  } catch (error) {
    console.error('음성 변환 오류:', error);
    return NextResponse.json(
      { error: '음성 변환에 실패했습니다.' },
      { status: 500 }
    );
  }
} 