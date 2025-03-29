import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供图片描述' },
        { status: 400 }
      );
    }

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024"
    });

    return NextResponse.json({
      url: response.data[0].url
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: '生成图片时出错' },
      { status: 500 }
    );
  }
}