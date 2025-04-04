import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API 요청 핸들러
export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const primaryLanguage = searchParams.get('primary') || 'english'; // 기본값은 영어
    
    // 랜덤 시드 생성 (캐싱 방지 및 다양성 보장)
    const randomSeed = Math.floor(Math.random() * 10000);
    
    // 언어에 따른 프롬프트 설정
    const languagePrompt = primaryLanguage === 'english' 
      ? '당신은 한국인 영어 학습자를 위한 유용한 영어 단어나 표현과 그 한글 번역을 제공하는 도우미입니다. JSON 형식으로만 응답하세요.'
      : '당신은 한국인 태국어 학습자를 위한 유용한 태국어 단어나 표현과 그 한글 번역을 제공하는 도우미입니다. JSON 형식으로만 응답하세요.';
    
    const userPrompt = primaryLanguage === 'english'
      ? `유용한 영어 단어나 표현 하나를 랜덤하게 선택해서 알려주세요. 실용적이고 일상생활이나 비즈니스에서 자주 쓰이는 것이 좋습니다. 이전과 다른 새로운 표현을 제공해주세요. 랜덤 시드: ${randomSeed}. 응답은 반드시 {"primary": "영어 단어나 표현", "translation": "한글 번역"} 형태의 JSON 형식이어야 합니다.`
      : `유용한 태국어 단어나 표현 하나를 랜덤하게 선택해서 알려주세요. 실용적이고 일상생활이나 비즈니스에서 자주 쓰이는 것이 좋습니다. 이전과 다른 새로운 표현을 제공해주세요. 랜덤 시드: ${randomSeed}. 응답은 반드시 {"primary": "태국어 단어나 표현", "translation": "한글 번역"} 형태의 JSON 형식이어야 합니다.`;
    
    // GPT-4o 모델에 요청
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: languagePrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 1.0, // 온도 증가로 다양성 향상
    });

    // API 응답에서 JSON 파싱
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('API 응답에 내용이 없습니다.');
    }

    const parsedResponse = JSON.parse(responseContent);
    
    // 응답에 언어 정보 추가
    const responseWithLanguage = {
      ...parsedResponse,
      languageCode: primaryLanguage === 'english' ? 'en' : 'th'
    };
    
    // 캐싱 방지를 위한 헤더 설정
    return NextResponse.json(responseWithLanguage, {
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    return NextResponse.json(
      { error: '단어를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 