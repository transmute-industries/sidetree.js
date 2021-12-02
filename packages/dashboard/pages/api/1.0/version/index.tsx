import withService from '../../../../middleware/withService';

const handler = async (req: any, res: any) => {
  const sidetree = await req.client.server.service.sidetree;
  const { body } = await sidetree.handleGetVersionRequest();
  res.json(JSON.parse(body));
};

export default withService(handler);
