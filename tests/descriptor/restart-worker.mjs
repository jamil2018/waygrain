/* global process */
import { Store } from '../../dist/store/database.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
const store = await Store.open(process.argv[2]);
const service = await startDescriptorService(store);
process.send({ readURL: service.readURL, authorURL: service.authorURL });
process.on('message', async (message) => {
  if (message === 'stop') {
    await service.close();
    store.close();
    process.disconnect();
  }
});
