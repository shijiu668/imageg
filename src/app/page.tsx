'use client';

import { useState } from 'react';
import Image from 'next/image';

type ErrorResponse = {
  error: string;
};

type GenerateResponse = {
  taskId: string;
};

type TaskResponse = {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  prompt: string;
  result?: {
    url: string;
  };
  error?: string;
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('请输入图片描述');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json() as ErrorResponse | GenerateResponse;

      if (!response.ok) {
        throw new Error((data as ErrorResponse).error || '生成图片失败');
      }

      setTaskId((data as GenerateResponse).taskId);
      await pollTaskStatus((data as GenerateResponse).taskId);
    } catch (error: unknown) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    while (true) {
      const response = await fetch(`/api/tasks/${taskId}`);
      const data = await response.json() as TaskResponse;

      if (data.status === 'completed' && data.result?.url) {
        setImageUrl(data.result.url);
        break;
      } else if (data.status === 'failed') {
        setError(data.error || '生成图片失败');
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('下载图片失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">AI 图片生成器</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">输入描述，让AI为您创造独特的图片</p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您想要生成的图片..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={generateImage}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? '生成中...' : '生成图片'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {taskId && loading && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-200 rounded-lg">
              正在处理任务 {taskId}...
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
            <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt="Generated image"
                fill
                className="object-cover"
                priority
              />
            </div>
            <button
              onClick={handleDownload}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              下载图片
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
