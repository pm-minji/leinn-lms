import { redirect } from 'next/navigation';

export default function ReflectionsRedirectPage() {
  // Redirect to learner reflections
  redirect('/learner/reflections');
}