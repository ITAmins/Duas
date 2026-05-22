export interface Dua {
  id: number;
  category: string;
  title_bn: string;
  title_en: string;
  arabic: string;
  pronunciation_bn: string;
  meaning_bn: string;
  reference: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  query?: string;
  category?: string;
  message?: string;
}

export interface ApiEndpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  exampleResponse: string;
}
