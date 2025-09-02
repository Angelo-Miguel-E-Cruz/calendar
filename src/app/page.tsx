import {
  SignedIn,
  SignedOut
} from '@clerk/nextjs'
import Default from '../components/pages/default';
import LandingPage from '../components/pages/landing';

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
