import { encrypt } from './encrypt';

export const s = () => encrypt(Date.now() + 30 * 1000 + '');
