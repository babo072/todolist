import { NextResponse } from 'next/server';

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
    
    // Google Translate TTS URL 생성
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;
    
    // 서버에서 Google TTS 요청
    const response = await fetch(url);
    
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
  } catch (error) {
    console.error('음성 변환 오류:', error);
    return NextResponse.json(
      { error: '음성 변환에 실패했습니다.' },
      { status: 500 }
    );
  }
} 