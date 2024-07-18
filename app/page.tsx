// app/page.tsx
import { UserProvider } from '@/components/UserContext';
import UserSelector from '../components/UserSelector';
import { MainComponent } from '@/components/MainComponent';

export default function Home() {
    return (
        <UserProvider>
            <main>
                <UserSelector />
                <MainComponent />
            </main>
        </UserProvider>
    );
}