import { server } from '@sidetree/api';

import { registerRoutes } from './routes';
import { registerServices } from './services';
// consider making these take additional arguments
// so we can register multiple sidetree instance handlers
// eg ion and element side by side.
// and also to move the registration specifics back into the api
// and out of element
registerRoutes(server);
registerServices(server, {});

export { server };
