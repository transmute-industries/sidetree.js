export const resolve = async (did: string): Promise<any> => {
  const response = await fetch('/api/1.0/identifiers/' + did, {
    method: 'GET',
    headers: getHeaders(),
  });
  return await handleApiResponse(response);
};

export const createDID = async (
  createOperation: any,
  wallet: any
): Promise<any> => {
  if (wallet) {
    // compute suffix
    // query operations
    // return resolve result instead of creating did over and over again...
    const didUniqueSuffix = wallet.computeDidUniqueSuffix(
      createOperation.suffixData
    );
    const response = await fetch(
      '/api/1.0/operations?did-unique-suffix=' + didUniqueSuffix,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );
    const data = await handleApiResponse(response);
    if (data.operations.length) {
      return resolve(data.did);
    }
  }
  const response = await fetch('/api/1.0/operations', {
    method: 'POST',
    body: JSON.stringify(createOperation),
    headers: getHeaders(),
  });
  return handleApiResponse(response);
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
  return handleApiResponse(response);
};

export const getTransactions = async (): Promise<any> => {
  const maybeAccessToken = localStorage.getItem('sidetree.access_token');
  const jwt = maybeAccessToken ? JSON.parse(maybeAccessToken).accessToken : '';
  const response = await fetch('/api/1.0/transactions', {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleApiResponse(response);
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
  const responseJson = await response.json();
  // if (!response.ok) {
  //   if (response.status === 401) {
  //     localStorage.removeItem('sidetree.access_token');
  //     window.location.href = '/wallet';
  //   } else {
  //     throw new Error('HTTP error ' + response.status);
  //   }
  // }
  // console.log(responseJson);
  return responseJson;
};
