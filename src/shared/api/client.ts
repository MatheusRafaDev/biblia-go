import {
  RagChatResponse,
  RagChatResponseSchema,
  SemanticSearchResult,
  SemanticSearchResultSchema,
  SyncPayload,
  SyncPayloadSchema,
} from './types';
import { z } from 'zod';

export interface IApiClient {
  semanticSearch(query: string, limit?: number): Promise<SemanticSearchResult[]>;
  askAiAssistant(question: string, contextPassage?: string): Promise<RagChatResponse>;
  syncCloudProgress(payload: SyncPayload): Promise<{ success: boolean; syncedAt: string }>;
}

export class ApiClient implements IApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333/api') {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async semanticSearch(query: string, limit = 10): Promise<SemanticSearchResult[]> {
    const url = `${this.baseUrl}/search/semantic?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) {
      throw new Error(`Erro na busca semântica: ${res.status}`);
    }
    const data = await res.json();
    return z.array(SemanticSearchResultSchema).parse(data);
  }

  async askAiAssistant(question: string, contextPassage?: string): Promise<RagChatResponse> {
    const url = `${this.baseUrl}/ai/chat`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ question, contextPassage }),
    });
    if (!res.ok) {
      throw new Error(`Erro no assistente IA: ${res.status}`);
    }
    const data = await res.json();
    return RagChatResponseSchema.parse(data);
  }

  async syncCloudProgress(payload: SyncPayload): Promise<{ success: boolean; syncedAt: string }> {
    const validated = SyncPayloadSchema.parse(payload);
    const url = `${this.baseUrl}/sync`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(validated),
    });
    if (!res.ok) {
      throw new Error(`Erro na sincronização: ${res.status}`);
    }
    return res.json();
  }
}

export const api = new ApiClient();
