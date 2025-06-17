export interface RequestPayload {
    method: string;
    headers: Record<string, string>;
    body?: string | FormData;
  }
  
export interface APIConfig {
    url: string | undefined;
    token?: Promise<string | undefined>;
  }
  
export interface ResponseData<T> {
    message: string;
    statusCode: number;
    statusText: string;
    data: T;
    additionalData?: any;
  }