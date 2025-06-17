import type { RequestPayload, ResponseData } from "./types";


export async function makeRequest(
  path: string,
  operation: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  auth: boolean,
  body?: Record<string, any>,
  form?: FormData,
  returnData: boolean = false,
  apiToUse = 'main_api'
): Promise<ResponseData<any>> {
  const token = localStorage.getItem('token') || '';
  const baseUrl = import.meta.env.VITE_APP_API_URL as string
  if (!baseUrl) {
    return {
      message: 'API URL is not defined',
      statusCode: 998,
      statusText: 'API URL is not defined',
      data: {}
    };
  }
  const url = `${baseUrl}${path}`;
  const payload: RequestPayload = {
    method: operation,
    headers: {}
  };

  if (auth) {
    const tokenResult = token;
    if (tokenResult) {
      payload.headers['Authorization'] = `Bearer ${tokenResult}`;
    } else {
      console.warn('No auth token set');
    }
  }

  if ((operation === 'POST' || operation === 'PUT' || operation === 'PATCH') && body) {
    payload.body = JSON.stringify(body);
    payload.headers['Accept'] = 'application/json';
    payload.headers['Content-Type'] = 'application/json';
  } else if ((operation === 'POST' || operation === 'PUT' || operation === 'PATCH') && form) {
    payload.body = form;
  }

  let msg = '';
  let fullResponse: Response = new Response(null, {
    status: 599,
    statusText: 'Initial State'
  });
  
  let responseJson: any = {};
  try {
    fullResponse = await fetch(url, payload);

    if (returnData) {
      return {
        message: fullResponse.statusText,
        statusCode: fullResponse.status,
        statusText: fullResponse.statusText,
        data: fullResponse
      };
    }

    responseJson = await fullResponse.json();
    
    msg = responseJson.message || fullResponse.statusText;
  } catch (e) {
    msg = 'Error connecting to the server, check your internet connection';
    console.error(e);
  }

  if (fullResponse.status === 500) {
    msg = 'Server error, contact support';
  } else if (fullResponse.status === 504) {
    msg = 'Timeout, try again';
  }

  return {
    message: msg,
    statusText: fullResponse.statusText,
    statusCode: fullResponse.status,
    data: responseJson || {} 
  };
}