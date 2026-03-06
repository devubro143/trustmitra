import { NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/uploads';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog } from '@/lib/events';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Login required for uploads.' }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 });
  }

  try {
    const uploaded = await saveUploadedFile(file);
    await createAuditLog({
      actorUserId: user.id,
      action: 'upload.created',
      entityType: 'file',
      entityId: uploaded.fileName,
      metadata: { mimeType: uploaded.mimeType, size: uploaded.size }
    });
    return NextResponse.json(uploaded);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed.' }, { status: 400 });
  }
}
