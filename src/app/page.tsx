import {
  SignedIn,
  SignedOut
} from '@clerk/nextjs'
import Main from '@/components/Pages/main';
import LandingPage from '@/components/Pages/landing';

export default function Home() {
  return (
    <main>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Main />
      </SignedIn>
    </main>
  );
}
