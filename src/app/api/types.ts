export type Task = {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  prompt: string;
  result?: {
    url: string;
  };
  error?: string;
};