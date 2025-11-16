import { Navigation } from '@/components/layout/Navigation';

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
