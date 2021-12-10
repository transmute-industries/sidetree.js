import withService from '../../../middleware/withService';
import { uiConfigs } from '../../../config';

const handler = async (req: any, res: any) => {
  res.json(uiConfigs);
};

export default withService(handler);
