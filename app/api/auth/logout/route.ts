import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // 로그아웃 후 홈페이지로 리다이렉션
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}

export async function GET() {
  // GET 요청도 처리 (직접 URL 접근 시)
  const supabase = await createClient();
  await supabase.auth.signOut();

  // 로그아웃 후 홈페이지로 리다이렉션
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
