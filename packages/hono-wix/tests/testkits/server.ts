import http from 'http';

export const server = () => {
  const requests: http.IncomingMessage[] = [];

  const server = http.createServer((req, res) => {
    requests.push(req);
    res.writeHead(200);
    res.end('');
  });

  const port = 3000;

  return new Promise<{
    url: string;
    reqs: () => http.IncomingMessage[];
    [Symbol.asyncDispose]: () => Promise<void>;
  }>((res) =>
    server.listen(port, () => {
      res({
        url: `http://localhost:${port}`,
        reqs: () => requests,
        [Symbol.asyncDispose]() {
          return new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          });
        },
      });
    }),
  );
};
