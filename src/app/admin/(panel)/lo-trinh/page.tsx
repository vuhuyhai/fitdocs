import type { Metadata } from 'next';
import AdminPathList from '@/components/admin/AdminPathList';

export const metadata: Metadata = { title: 'Lo trinh hoc' };

export default function AdminLearningPathsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-50">Lo trinh hoc</h1>
          <p className="text-sm text-zinc-500">Quan ly lo trinh hoc cho nguoi dung</p>
        </div>
      </div>
      <AdminPathList />
    </div>
  );
}
