import { NextResponse } from 'next/server';
import { generateImage } from './utils';

type GenerateError = {
  message: string;
  status?: number;
};

import { tasks } from '../tasks/route';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供图片描述' },
        { status: 400 }
      );
    }

    const taskId = uuidv4();
    const task = {
      id: taskId,
      status: 'pending' as const,
      prompt
    };
    tasks.set(taskId, task);

    // 异步处理图片生成
    generateImage(taskId, prompt).catch(console.error);

    return NextResponse.json({ taskId });

  } catch (error: unknown) {
    const err = error as GenerateError;
    console.error('Image generation error:', err);
    return NextResponse.json(
      { error: '生成图片时出错' },
      { status: 500 }
    );
  }
}