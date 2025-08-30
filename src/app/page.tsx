import {
  SignedIn,
  SignedOut
} from '@clerk/nextjs'
import Main from '@/components/pages/main';
import Default from '@/components/pages/deafult';
import LandingPage from '@/components/pages/landing';

export default function Home() {
  return (
    <main>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Default />
      </SignedIn>
    </main>
  );
}
