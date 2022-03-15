export const resolve = async (did: string): Promise<any> => {
  const response = await fetch('/api/1.0/identifiers/' + did, {
    method: 'GET',
    headers: getHeaders(),
  });
  return await handleApiResponse(response);
};

export const createDID = async (createOperation: any): Promise<any> => {
  const response = await fetch('/api/1.0/operations', {
    method: 'POST',
    body: JSON.stringify(createOperation),
    headers: getHeaders(),
  });
  return await handleApiResponse(response);
};

export const getOperations = async (did: string): Promise<any> => {
  const didUniqueSuffix = did.split(':').pop();
  const response = await fetch(
    '/api/1.0/operations?did-unique-suffix=' + didUniqueSuffix,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );
  return await handleApiResponse(response);
};

export const getTransactions = async (): Promise<any> => {
  const maybeAccessToken = localStorage.getItem('sidetree.access_token');
  const jwt = maybeAccessToken ? JSON.parse(maybeAccessToken).accessToken : '';
  const response = await fetch('/api/1.0/transactions', {
    method: 'GET',
    headers: getHeaders(),
  });
  return await handleApiResponse(response);
};

const getHeaders = (): HeadersInit => {
  const maybeAccessToken = localStorage.getItem('sidetree.access_token');
  const jwt = maybeAccessToken
    ? JSON.parse(maybeAccessToken).accessToken
    : undefined;
  const headers: HeadersInit = jwt ? { Authorization: `Bearer ${jwt}` } : {};
  return headers;
};

const handleApiResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('sidetree.access_token');
      window.location.href = '/wallet';
    } else {
      throw new Error('HTTP error ' + response.status);
    }
  }
  return await response.json();
};
