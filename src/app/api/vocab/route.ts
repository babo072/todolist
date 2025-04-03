import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API 요청 핸들러
export async function GET() {
  try {
    // GPT-4o 모델에 요청
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 영어 학습자를 위한 유용한 영어 단어나 표현과 그 한글 번역을 제공하는 도우미입니다. JSON 형식으로만 응답하세요.'
        },
        {
          role: 'user',
          content: '유용한 영어 단어나 표현 하나를 랜덤하게 선택해서 알려주세요. 실용적이고 일상생활이나 비즈니스에서 자주 쓰이는 것이 좋습니다. 응답은 반드시 {"english": "영어 단어나 표현", "korean": "한글 번역"} 형태의 JSON 형식이어야 합니다.'
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    // API 응답에서 JSON 파싱
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('API 응답에 내용이 없습니다.');
    }

    const parsedResponse = JSON.parse(responseContent);
    
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    return NextResponse.json(
      { error: '단어를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 