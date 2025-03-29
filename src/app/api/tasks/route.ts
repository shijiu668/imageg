import { NextResponse } from 'next/server';

type Task = {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  prompt: string;
  result?: {
    url: string;
  };
  error?: string;
};

const tasks = new Map<string, Task>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json(
      { error: '请提供任务ID' },
      { status: 400 }
    );
  }

  const task = tasks.get(taskId);
  if (!task) {
    return NextResponse.json(
      { error: '任务不存在' },
      { status: 404 }
    );
  }

  return NextResponse.json(task);
}

export { tasks };