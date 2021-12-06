export const resolve = (did: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    fetch('/api/1.0/identifiers/' + did)
      .then((response) => {
        console.log('RES BUSTING', response);
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status);
        }
        return response.json();
      })
      .then((json) => {
        resolve(json);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

export const getOperations = (did: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const didUniqueSuffix = did.split(':').pop();
    fetch('/api/1.0/operations?did-unique-suffix=' + didUniqueSuffix)
      .then((response) => {
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status);
        }
        return response.json();
      })
      .then((json) => {
        resolve(json);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

export const getTransactions = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    fetch('/api/1.0/transactions')
      .then((response) => {
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status);
        }
        return response.json();
      })
      .then((json) => {
        resolve(json);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};
