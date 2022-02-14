import middleware from '../../../../middleware';

const handler = async (req: any, res: any) => {
  const sidetree = await req.client.server.service.sidetree;
  const { body } = await sidetree.handleGetVersionRequest();
  res.json(JSON.parse(body));
};

export default middleware(handler);
