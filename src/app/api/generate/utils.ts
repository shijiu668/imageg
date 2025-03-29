import { OpenAI } from 'openai';
import { tasks } from '../tasks/route';

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY
});

import { Task } from '../types';

export async function generateImage(taskId: string, prompt: string) {
  try {
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024"
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('生成的图片URL不存在');
    }

    tasks.set(taskId, {
      id: taskId,
      status: 'completed',
      prompt,
      result: {
        url: imageUrl
      }
    } as Task);
  } catch (error) {
    console.error('Image generation error:', error);
    tasks.set(taskId, {
      id: taskId,
      status: 'failed',
      prompt,
      error: '生成图片失败'
    } as Task);
  }
}