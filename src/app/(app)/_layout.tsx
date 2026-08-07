import { Tabs, usePathname } from 'expo-router';
import { Home, User } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function AppLayout() {
    const pathname = usePathname();
    const isAuthRoute = pathname === '/login' || pathname === '/register';

    return (
        <Tabs
            // initialRouteName="home"
            screenOptions={{
                headerShown: false,
                tabBarStyle: isAuthRoute
                    ? { display: 'none' }
                    : {
                        backgroundColor: '#121212',
                        borderTopColor: '#2a2a2a',
                        borderTopWidth: 1,
                        height: Platform.OS === 'android' ? 65 : 85,
                        paddingBottom: Platform.OS === 'android' ? 10 : 25,
                        paddingTop: 8,
                        elevation: 0,
                    },
                tabBarActiveTintColor: '#f9cf26',
                tabBarInactiveTintColor: '#555555',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused, color }) => <Home size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color }) => <User size={22} color={color} />,
                }}
            />
            {/* Hiding the other routes */}
            <Tabs.Screen name="subject/[id]" options={{ href: null }} />
        </Tabs>
    );
}