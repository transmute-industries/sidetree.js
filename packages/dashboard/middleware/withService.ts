import service from './service';

const middleware = (handler: any) => async (req: any, res: any) => {
  if (!req.client.server.service) {
    req.client.server.service = service;
  }
  return handler(req, res);
};

export default middleware;
