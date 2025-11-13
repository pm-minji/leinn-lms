import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">LEINN LMS</h1>
          <p className="mt-2 text-sm text-gray-600">
            팀 기반 창업 교육 플랫폼
          </p>
        </div>
        <div className="mt-8">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
