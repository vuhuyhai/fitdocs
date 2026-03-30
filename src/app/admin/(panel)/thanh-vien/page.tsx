import type { Metadata } from 'next';
import MembersList from '@/components/admin/MembersList';

export const metadata: Metadata = { title: 'Thanh vien' };

export default function MembersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Thanh vien</h1>
        <p className="text-sm text-zinc-500">Nguoi dung da share tai lieu len Facebook</p>
      </div>
      <MembersList />
    </div>
  );
}
