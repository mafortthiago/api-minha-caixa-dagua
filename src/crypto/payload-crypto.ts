import { createDecipheriv } from 'node:crypto';

export function decryptPayload<T = unknown>(b64: string): T {
  const key = Buffer.from(process.env.MQTT_KEY ?? '', 'hex');

  const blob = Buffer.from(b64, 'base64');
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const cipher = blob.subarray(28);

  const d = createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);

  const plain = Buffer.concat([d.update(cipher), d.final()]);
  return JSON.parse(plain.toString('utf8')) as T;
}
