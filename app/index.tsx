import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

export default function Index() {
    const { status } = useAuth();

    if (status === 'loading') {
        return null;
    }

    if (status === 'authed') {
        return <Redirect href="/(doctor)/(tabs)" />;
    }

    return <Redirect href="/(auth)/splash" />;
}
