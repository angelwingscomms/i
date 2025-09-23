import { json } from '@sveltejs/kit';
import { hashPassword, verifyPassword } from 'worker-password-auth';

export const POST = async ({ request }) => {
  const { action, password, hash } = await request.json();

  if (action === 'hash') {
    const hashed = await hashPassword(password);
    return json({ hashed });
  }

  if (action === 'verify') {
    const isValid = await verifyPassword(password, hash);
    return json({ isValid });
  }

  return json('Invalid request', { status: 400 });
};