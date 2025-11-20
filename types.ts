export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum BibleVersion {
  ESV = 'ESV',
  KJV = 'KJV',
  NIV = 'NIV',
  NASB = 'NASB'
}
