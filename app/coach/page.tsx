import { redirect } from 'next/navigation';

export default function CoachRedirect() {
  redirect('/coach/dashboard');
}