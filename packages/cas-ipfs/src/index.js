const fetch = require('node-fetch');

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const data = await fetch(
    'http://localhost:5001/api/v0/get?timeout=2000ms&arg=QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen',
    { method: 'POST' }
  ).then((res) => res.text());
  console.log(data);
})();
