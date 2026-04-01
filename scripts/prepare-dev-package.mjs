import { prepareDevPackage } from './dev-package.mjs';

const result = await prepareDevPackage();

console.log(`Prepared ${result.devPackageDir}`);
console.log(`Linked ${result.linkedPackageDir}`);
console.log(`Using N8N_USER_FOLDER=${result.userFolder}`);
