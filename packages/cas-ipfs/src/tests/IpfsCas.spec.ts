import fetch from 'node-fetch';

it('should work', async () => {
  const data = await fetch(
    'http://127.0.0.1:5001/api/v0/get?timeout=2000ms&arg=QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen',
    { method: 'POST' }
  ).then((res: any) => res.text());
  console.log(data);
});
