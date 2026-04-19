import { Redirect } from 'expo-router';

export default function Index() {
    // TODO: check auth state and redirect accordingly
    // For now, always start at the auth splash
    return <Redirect href="/(auth)/splash" />;
}
