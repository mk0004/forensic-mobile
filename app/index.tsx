import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

export default function Index() {
    const { status, user } = useAuth();

    if (status === 'loading') {
        return null;
    }

    if (status === 'authed') {
        const isAdmin = (user?.role ?? '').toLowerCase() === 'admin';
        return <Redirect href={isAdmin ? '/(admin)' : '/(doctor)/(tabs)'} />;
    }

    return <Redirect href="/(auth)/splash" />;
}
