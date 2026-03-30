import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

export const BUCKET = process.env.AWS_S3_BUCKET ?? 'fitdocs-documents';
const PRESIGNED_TTL = 900; // 15 minutes

export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: 'inline',
  });
  return getSignedUrl(s3Client, command, { expiresIn: PRESIGNED_TTL });
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPublicThumbnailUrl(key: string): string {
  return `https://${BUCKET}.s3.${process.env.AWS_REGION ?? 'ap-southeast-1'}.amazonaws.com/${key}`;
}
