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
