import type { Metadata } from 'next';
import AdminPathEditor from '@/components/admin/AdminPathEditor';

export const metadata: Metadata = { title: 'Sua lo trinh' };

export default async function AdminPathDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminPathEditor pathId={Number(id)} />;
}
