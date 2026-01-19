import crypto from 'crypto';

export default function gravatarUrl(email: string) {
  const hash = crypto
    .createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex');

  return `https://0.gravatar.com/avatar/${hash}`;
}