import { Buffer } from 'buffer';

export function convertImage(image) {
  if (image) {
    return Buffer.from(image.data, 'base64').toString('binary');
  }
  return null;
}
