import type { RequestPayload, ResponseData } from "./types";


export async function makeRequest(
  path: string,
  operation: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  auth: boolean,
  body?: Record<string, any>,
  form?: FormData,
  query?: Record<string, any>,
  returnData: boolean = false,
): Promise<ResponseData<any>> {
  const token = localStorage.getItem('authToken') || '';
  const baseUrl = import.meta.env.VITE_APP_API_URL as string;

  if (!baseUrl) {
    return {
      message: 'API URL is not defined',
      statusCode: 998,
      statusText: 'API URL is not defined',
      responseData: {}
    };
  }

  let queryString = '';
  if (query && Object.keys(query).length > 0) {
    queryString = '?' + new URLSearchParams(
      Object.entries(query).reduce((acc, [key, val]) => {
        acc[key] = String(val);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
  }

  const url = `${baseUrl}${path}${queryString}`;

  const payload: RequestPayload = {
    method: operation,
    headers: {}
  };

  if (auth && token) {
    payload.headers['Authorization'] = `Bearer ${token}`;
  }

  if ((operation === 'POST' || operation === 'PUT' || operation === 'PATCH' || operation === 'DELETE') && body) {
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
    console.log(payload);
    fullResponse = await fetch(url, payload);

    if (returnData) {
      return {
        message: fullResponse.statusText,
        statusCode: fullResponse.status,
        statusText: fullResponse.statusText,
        responseData: fullResponse
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
    responseData: responseJson || {}
  };
}
