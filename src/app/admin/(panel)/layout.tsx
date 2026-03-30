import AdminSidebar from '@/components/admin/AdminSidebar';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {children}
      </div>
    </div>
  );
}
