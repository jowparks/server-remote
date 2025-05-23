import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      console.log('Not Found: Redirecting to /');
      router.push('/');
    }, 0);
  }, [router]);

  return null;
}
