import {
  SignedIn,
  SignedOut
} from '@clerk/nextjs'
import Main from '@/components/pages/main';
import LandingPage from '@/components/pages/landing';

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
