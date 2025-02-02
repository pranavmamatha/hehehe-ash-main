import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function LandingPage() {
  // Check if user is already logged in
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('token');

  if (isLoggedIn) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Welcome to Our Platform</h1>
        <p className="text-xl text-muted-foreground">
          Discover and share amazing products
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
