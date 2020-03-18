import { Installer } from './util';

const installer = new Installer();

installer.bootstrap([
    installer.initialize,
]);
