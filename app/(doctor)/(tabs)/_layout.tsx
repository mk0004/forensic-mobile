import { useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Pressable, Text, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FAB_SIZE = 48;
const CURVE_DEPTH = 23;
const CONTENT_HEIGHT = 56;
const FAB_OVERLAP = 32;

/* ─── Tab Icons (matching Figma exactly) ─── */

// House with door
function DashboardIcon({ color }: { color: string }) {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
                d="M3 10.5L12 3l9 7.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2V10.5z"
                stroke={color}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M9 22V12h6v10"
                stroke={color}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

// Network graph with connected nodes (M shape with circles at joints)
function ExploreIcon({ color }: { color: string }) {
    return (
        <Svg width={26} height={24} viewBox="0 0 26 24" fill="none">
            {/* Lines connecting nodes */}
            <Path
                d="M4 18L9 6l4 12 4-12 5 12"
                stroke={color}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Nodes at joints */}
            <SvgCircle cx={4} cy={18} r={2.5} fill={AppColors.white} stroke={color} strokeWidth={1.6} />
            <SvgCircle cx={9} cy={6} r={2.5} fill={AppColors.white} stroke={color} strokeWidth={1.6} />
            <SvgCircle cx={13} cy={18} r={2.5} fill={AppColors.white} stroke={color} strokeWidth={1.6} />
            <SvgCircle cx={17} cy={6} r={2.5} fill={AppColors.white} stroke={color} strokeWidth={1.6} />
            <SvgCircle cx={22} cy={18} r={2.5} fill={AppColors.white} stroke={color} strokeWidth={1.6} />
        </Svg>
    );
}

// People group - front person larger, two smaller behind
function CommunityIcon({ color }: { color: string }) {
    return (
        <Svg width={28} height={24} viewBox="0 0 28 24" fill="none">
            {/* Front person */}
            <SvgCircle cx={14} cy={8} r={3.5} stroke={color} strokeWidth={1.6} />
            <Path
                d="M8 21c0-3.314 2.686-6 6-6s6 2.686 6 6"
                stroke={color}
                strokeWidth={1.6}
                strokeLinecap="round"
            />
            {/* Left person */}
            <SvgCircle cx={6} cy={9.5} r={2.5} stroke={color} strokeWidth={1.4} />
            <Path
                d="M1.5 20c0-2.5 2-4.5 4.5-4.5"
                stroke={color}
                strokeWidth={1.4}
                strokeLinecap="round"
            />
            {/* Right person */}
            <SvgCircle cx={22} cy={9.5} r={2.5} stroke={color} strokeWidth={1.4} />
            <Path
                d="M26.5 20c0-2.5-2-4.5-4.5-4.5"
                stroke={color}
                strokeWidth={1.4}
                strokeLinecap="round"
            />
        </Svg>
    );
}

// Hexagon with inner circle
function SettingsIcon({ color }: { color: string }) {
    return (
        <Svg width={24} height={26} viewBox="0 0 24 26" fill="none">
            <Path
                d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"
                stroke={color}
                strokeWidth={1.6}
                strokeLinejoin="round"
            />
            <SvgCircle cx={12} cy={12} r={3.5} stroke={color} strokeWidth={1.6} />
        </Svg>
    );
}

/* ─── Notched Tab Bar Background (Figma-accurate bezier curve) ─── */
function TabBarBackground() {
    const s = SCREEN_WIDTH / 375;
    const h = CURVE_DEPTH + CONTENT_HEIGHT;

    // Bezier control points extracted from Figma SVG, scaled to screen width
    const R = 20; // Corner radius for rounded top edges
    const d = [
        `M0 ${h}`,
        `L0 ${R}`,
        `Q0 0 ${R} 0`,
        `L${(147.683 * s).toFixed(1)} 0`,
        `C${(153.669 * s).toFixed(1)} 0 ${(158.664 * s).toFixed(1)} 4.3 ${(161.973 * s).toFixed(1)} 9.3`,
        `C${(167.454 * s).toFixed(1)} 17.6 ${(176.841 * s).toFixed(1)} ${CURVE_DEPTH} ${(187.5 * s).toFixed(1)} ${CURVE_DEPTH}`,
        `C${(198.159 * s).toFixed(1)} ${CURVE_DEPTH} ${(207.546 * s).toFixed(1)} 17.6 ${(213.027 * s).toFixed(1)} 9.3`,
        `C${(216.336 * s).toFixed(1)} 4.3 ${(221.331 * s).toFixed(1)} 0 ${(227.317 * s).toFixed(1)} 0`,
        `L${SCREEN_WIDTH - R} 0`,
        `Q${SCREEN_WIDTH} 0 ${SCREEN_WIDTH} ${R}`,
        `L${SCREEN_WIDTH} ${h}`,
        `Z`,
    ].join(' ');

    return (
        <Svg
            width={SCREEN_WIDTH}
            height={h}
            style={{ position: 'absolute', top: FAB_OVERLAP, left: 0 }}
        >
            <Path d={d} fill={AppColors.white} />
        </Svg>
    );
}

/* ─── Custom Tab Bar ─── */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const paddingBottom = Math.max(insets.bottom, 12);
    const containerH = FAB_OVERLAP + CURVE_DEPTH + CONTENT_HEIGHT + paddingBottom;

    const fabScale = useRef(new Animated.Value(1)).current;

    const icons: Record<string, (color: string) => React.ReactNode> = {
        index: (color) => <DashboardIcon color={color} />,
        explore: (color) => <ExploreIcon color={color} />,
        community: (color) => <CommunityIcon color={color} />,
        settings: (color) => <SettingsIcon color={color} />,
    };

    const labels: Record<string, string> = {
        index: 'Dashboard',
        explore: 'Explore',
        community: 'Community',
        settings: 'Settings',
    };

    const renderTab = (route: typeof state.routes[0]) => {
        const routeIndex = state.routes.indexOf(route);
        const isFocused = state.index === routeIndex;
        const color = isFocused ? '#2A3A70' : '#1A1A1A';

        const onPress = () => {
            if (process.env.EXPO_OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
            }
        };

        return (
            <Pressable
                key={route.key}
                onPress={onPress}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}
            >
                {icons[route.name]?.(color)}
                <Text style={{
                    fontSize: 11,
                    fontFamily: isFocused ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_400Regular',
                    color,
                }}>{labels[route.name]}</Text>
            </Pressable>
        );
    };

    const leftTabs = state.routes.filter(r => r.name === 'index' || r.name === 'explore');
    const rightTabs = state.routes.filter(r => r.name === 'community' || r.name === 'settings');

    const openAiChat = () => {
        if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        Animated.sequence([
            Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true, damping: 12, stiffness: 400 }),
            Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 400 }),
        ]).start();
        router.push('/(doctor)/ai-chat');
    };

    const FAB_BOTTOM_OFFSET = containerH - FAB_SIZE;
    const FAB_LEFT = SCREEN_WIDTH / 2 - FAB_SIZE / 2;

    return (
        <View
            style={{ height: containerH, backgroundColor: 'transparent' }}
            pointerEvents="box-none"
        >
            {/* Tab bar background pinned to bottom */}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: containerH }} pointerEvents="none">
                <TabBarBackground />
            </View>

            {/* Floating AI button */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: FAB_BOTTOM_OFFSET,
                    left: FAB_LEFT,
                    width: FAB_SIZE,
                    height: FAB_SIZE,
                    borderRadius: FAB_SIZE / 2,
                    zIndex: 20,
                    transform: [{ scale: fabScale }],
                    boxShadow: '0 4px 14px rgba(30,42,94,0.45)',
                }}
            >
                <Pressable
                    onPress={openAiChat}
                    style={{ flex: 1, borderRadius: FAB_SIZE / 2, overflow: 'hidden' }}
                >
                    <LinearGradient
                        colors={[AppColors.primaryHover, AppColors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Ionicons name="sparkles" size={22} color={AppColors.white} />
                    </LinearGradient>
                </Pressable>
            </Animated.View>

            {/* Tab items row pinned to bottom */}
            <View style={{
                flexDirection: 'row',
                position: 'absolute',
                bottom: paddingBottom,
                left: 0,
                right: 0,
                height: CONTENT_HEIGHT - 4,
                alignItems: 'center',
            }}>
                {leftTabs.map(renderTab)}
                <View style={{ width: FAB_SIZE + 16 }} />
                {rightTabs.map(renderTab)}
            </View>
        </View>
    );
}

export default function DoctorTabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                lazy: false,
                animation: 'fade',
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="explore" />
            <Tabs.Screen name="community" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}
