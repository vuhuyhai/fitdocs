// Minimal root admin layout — login page lives here without sidebar.
// Panel pages (dashboard, tai-lieu, upload) use src/app/admin/(panel)/layout.tsx
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
