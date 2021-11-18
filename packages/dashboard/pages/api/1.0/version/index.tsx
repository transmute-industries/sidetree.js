import { sidetree } from '../../../../middleware/sidetree';

const handler = (req: any, res: any) => {
  res.json(req.sidetree.version);
};

export default sidetree(handler);
