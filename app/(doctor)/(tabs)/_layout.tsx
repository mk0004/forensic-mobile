import { useState, useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable, Text, Dimensions, Animated, TextInput as RNTextInput, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { AppColors } from '@/constants/theme';
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

    // Chat pill state
    const [chatExpanded, setChatExpanded] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const inputRef = useRef<RNTextInput>(null);
    const pillWidth = useRef(new Animated.Value(FAB_SIZE)).current;
    const pillLeft = useRef(new Animated.Value(SCREEN_WIDTH / 2 - FAB_SIZE / 2)).current;
    const pillTranslateY = useRef(new Animated.Value(0)).current;
    const shimmerX = useRef(new Animated.Value(-60)).current;
    const containerH = FAB_OVERLAP + CURVE_DEPTH + CONTENT_HEIGHT + paddingBottom;

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                const offset = containerH - e.endCoordinates.height - FAB_SIZE - 20;
                Animated.spring(pillTranslateY, {
                    toValue: offset,
                    useNativeDriver: false,
                    damping: 18,
                    stiffness: 200,
                }).start();
            }
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.spring(pillTranslateY, {
                    toValue: 0,
                    useNativeDriver: false,
                    damping: 18,
                    stiffness: 200,
                }).start();
            }
        );
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);

    const expandFab = () => {
        setChatExpanded(true);
        if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.parallel([
            Animated.spring(pillWidth, { toValue: SCREEN_WIDTH - 40, useNativeDriver: false, damping: 18, stiffness: 200 }),
            Animated.spring(pillLeft, { toValue: 20, useNativeDriver: false, damping: 18, stiffness: 200 }),
        ]).start(() => {
            inputRef.current?.focus();
        });
    };

    const collapseFab = () => {
        Keyboard.dismiss();
        setChatInput('');
        Animated.parallel([
            Animated.spring(pillWidth, { toValue: FAB_SIZE, useNativeDriver: false, damping: 18, stiffness: 200 }),
            Animated.spring(pillLeft, { toValue: SCREEN_WIDTH / 2 - FAB_SIZE / 2, useNativeDriver: false, damping: 18, stiffness: 200 }),
        ]).start(() => setChatExpanded(false));
    };

    const submitChat = () => {
        if (chatInput.trim()) {
            const q = chatInput.trim();
            Keyboard.dismiss();
            setIsThinking(true);

            // Start shimmer loop across text width
            shimmerX.setValue(-60);
            Animated.loop(
                Animated.timing(shimmerX, {
                    toValue: 140,
                    duration: 1000,
                    useNativeDriver: false,
                })
            ).start();

            setTimeout(() => {
                shimmerX.stopAnimation();
                setIsThinking(false);
                setChatInput('');
                setChatExpanded(false);
                pillWidth.setValue(FAB_SIZE);
                pillLeft.setValue(SCREEN_WIDTH / 2 - FAB_SIZE / 2);
                pillTranslateY.setValue(0);
                router.push({ pathname: '/(doctor)/ai-chat', params: { q } } as any);
            }, 2500);
        }
    };

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

    // 2 tabs on each side of the FAB
    const leftTabs = state.routes.filter(r => r.name === 'index' || r.name === 'explore');
    const rightTabs = state.routes.filter(r => r.name === 'community' || r.name === 'settings');

    return (
        <View style={{ height: FAB_OVERLAP + CURVE_DEPTH + CONTENT_HEIGHT + paddingBottom, backgroundColor: 'transparent' }}>
            <TabBarBackground />

            {/* FAB / Expanding Chat Pill */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: pillLeft,
                    width: pillWidth,
                    height: FAB_SIZE,
                    borderRadius: FAB_SIZE / 2,
                    overflow: 'hidden',
                    zIndex: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                    elevation: 8,
                    transform: [{ translateY: pillTranslateY }],
                }}
            >
                {/* Gradient background for both collapsed and expanded states */}
                <LinearGradient
                    colors={['#4CC1E9', '#1E2A5E']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                {!chatExpanded ? (
                    <Pressable
                        onPress={expandFab}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Svg width={FAB_SIZE} height={FAB_SIZE} viewBox="0 0 48 48">
                            <Path
                                d="M14 24h3l3-7 5 14 4-10 3 3h5"
                                stroke="#FFFFFF"
                                strokeWidth={1.8}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </Svg>
                    </Pressable>
                ) : isThinking ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <MaskedView
                            maskElement={
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: 'black', textAlign: 'center' }}>
                                    Thinking...
                                </Text>
                            }
                            style={{ height: 20, width: 120 }}
                        >
                            {/* Base text color */}
                            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.45)' }} />
                            {/* Shimmer highlight */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    width: 60,
                                    transform: [{ translateX: shimmerX }],
                                }}
                            >
                                <LinearGradient
                                    colors={['transparent', 'rgba(255,255,255,1)', 'transparent']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ flex: 1 }}
                                />
                            </Animated.View>
                        </MaskedView>
                    </View>
                ) : (
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 }}>
                        <Pressable onPress={collapseFab} hitSlop={8}>
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path d="M18 6L6 18M6 6l12 12" stroke={AppColors.white} strokeWidth={2.5} strokeLinecap="round" />
                            </Svg>
                        </Pressable>
                        <RNTextInput
                            ref={inputRef}
                            value={chatInput}
                            onChangeText={setChatInput}
                            placeholder="Ask AI assistant..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            style={{
                                flex: 1,
                                fontSize: 14,
                                fontFamily: 'IBMPlexSans_400Regular',
                                color: AppColors.white,
                                height: 44,
                                padding: 0,
                            }}
                            returnKeyType="send"
                            onSubmitEditing={submitChat}
                        />
                        <Pressable onPress={submitChat} hitSlop={8}>
                            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </Pressable>
                    </View>
                )}
            </Animated.View>

            {/* Tab items row - positioned below the curve */}
            <View style={{
                flexDirection: 'row',
                position: 'absolute',
                top: FAB_OVERLAP + CURVE_DEPTH + 2,
                left: 0,
                right: 0,
                height: CONTENT_HEIGHT - 4,
                alignItems: 'center',
            }}>
                {leftTabs.map(renderTab)}
                {/* Spacer for center FAB */}
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
