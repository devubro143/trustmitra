import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export function normalizeAssetUrl(url?: string | null) {
  if (!url) return null;
  const value = url.trim();
  if (!value) return null;
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/uploads/') ? value : null;
}

export async function saveUploadedFile(file: File) {
  if (!allowedMime.has(file.type)) {
    throw new Error('Only jpg, png, webp, and pdf files are supported right now.');
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop() : file.type.split('/')[1] || 'bin';
  const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  const absolutePath = path.join(uploadsDir, safeName);
  await writeFile(absolutePath, bytes);

  return {
    fileName: safeName,
    url: `/uploads/${safeName}`,
    mimeType: file.type,
    size: bytes.length
  };
}
