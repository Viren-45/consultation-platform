import SignUpHeader from '@/components/layout/sign-up-header';

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <SignUpHeader />
      <main>
        {children}
      </main>
    </div>
  );
}