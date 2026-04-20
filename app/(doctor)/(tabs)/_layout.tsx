import { useState, useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable, Text, Dimensions, Animated, TextInput as RNTextInput, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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

    // Panel target dimensions
    const PANEL_WIDTH = SCREEN_WIDTH - 32;
    const PANEL_HEIGHT = 260;
    const PANEL_LEFT = 16;
    const PANEL_BOTTOM = CURVE_DEPTH + CONTENT_HEIGHT + paddingBottom + 4;
    // FAB center position relative to container
    const FAB_LEFT = SCREEN_WIDTH / 2 - FAB_SIZE / 2;
    const FAB_BOTTOM_OFFSET = containerH - FAB_SIZE; // distance from container bottom to FAB top

    // Chat state
    const [chatExpanded, setChatExpanded] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const inputRef = useRef<RNTextInput>(null);

    // Morph animation (0 = FAB, 1 = expanded panel)
    const morphProgress = useRef(new Animated.Value(0)).current;
    // Thinking dots
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;
    // Keyboard offset (native driver — won't steal focus)
    const keyboardTranslateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            if (!chatExpanded) return;
            Animated.spring(keyboardTranslateY, {
                toValue: -(e.endCoordinates.height - containerH + 20),
                useNativeDriver: true,
                damping: 18,
                stiffness: 200,
            }).start();
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            Animated.spring(keyboardTranslateY, {
                toValue: 0,
                useNativeDriver: true,
                damping: 18,
                stiffness: 200,
            }).start();
        });
        return () => { showSub.remove(); hideSub.remove(); };
    }, [chatExpanded]);

    const startThinkingDots = () => {
        const make = (d: Animated.Value, delay: number) =>
            Animated.loop(Animated.sequence([
                Animated.delay(delay),
                Animated.timing(d, { toValue: 1, duration: 350, useNativeDriver: false }),
                Animated.timing(d, { toValue: 0.3, duration: 350, useNativeDriver: false }),
            ]));
        Animated.parallel([make(dot1, 0), make(dot2, 150), make(dot3, 300)]).start();
    };

    const stopThinkingDots = () => {
        dot1.stopAnimation(); dot2.stopAnimation(); dot3.stopAnimation();
        dot1.setValue(0.3); dot2.setValue(0.3); dot3.setValue(0.3);
    };

    const expandFab = () => {
        setChatExpanded(true);
        if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(morphProgress, {
            toValue: 1,
            useNativeDriver: false,
            damping: 18,
            stiffness: 180,
        }).start(() => {
            inputRef.current?.focus();
        });
    };

    const collapseFab = () => {
        Keyboard.dismiss();
        keyboardTranslateY.setValue(0);
        setChatInput('');
        Animated.spring(morphProgress, {
            toValue: 0,
            useNativeDriver: false,
            damping: 18,
            stiffness: 180,
        }).start(() => setChatExpanded(false));
    };

    const submitChat = (override?: string) => {
        const q = (override || chatInput).trim();
        if (q) {
            Keyboard.dismiss();
            setIsThinking(true);
            startThinkingDots();

            setTimeout(() => {
                stopThinkingDots();
                setIsThinking(false);
                setChatInput('');
                Animated.spring(morphProgress, {
                    toValue: 0,
                    useNativeDriver: false,
                    damping: 18,
                    stiffness: 180,
                }).start(() => {
                    setChatExpanded(false);
                    router.push({ pathname: '/(doctor)/ai-chat', params: { q } } as any);
                });
            }, 2500);
        }
    };

    // Interpolated morph values
    const animWidth = morphProgress.interpolate({ inputRange: [0, 1], outputRange: [FAB_SIZE, PANEL_WIDTH] });
    const animHeight = morphProgress.interpolate({ inputRange: [0, 1], outputRange: [FAB_SIZE, PANEL_HEIGHT] });
    const animLeft = morphProgress.interpolate({ inputRange: [0, 1], outputRange: [FAB_LEFT, PANEL_LEFT] });
    const animBottom = morphProgress.interpolate({ inputRange: [0, 1], outputRange: [FAB_BOTTOM_OFFSET, PANEL_BOTTOM] });
    const animBorderRadius = morphProgress.interpolate({ inputRange: [0, 1], outputRange: [FAB_SIZE / 2, 16] });
    const contentOpacity = morphProgress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });
    const fabIconOpacity = morphProgress.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' });

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

    const screenH = Dimensions.get('window').height;

    return (
        <View
            style={{
                height: chatExpanded ? screenH : containerH,
                marginTop: chatExpanded ? -(screenH - containerH) : 0,
                backgroundColor: 'transparent',
            }}
            pointerEvents="box-none"
        >
            {/* Tab bar background pinned to bottom */}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: containerH }} pointerEvents="none">
                <TabBarBackground />
            </View>

            {/* Blur overlay when panel is expanded */}
            {chatExpanded && (
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10,
                        opacity: morphProgress,
                    }}
                >
                    <BlurView
                        intensity={2}
                        tint="dark"
                        experimentalBlurMethod="dimezisBlurView"
                        style={{ flex: 1 }}
                    />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                </Animated.View>
            )}

            {/* Keyboard offset wrapper */}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    zIndex: 20,
                    transform: [{ translateY: keyboardTranslateY }],
                }}
                pointerEvents="box-none"
            >
                {/* Morphing FAB → Panel */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: animBottom,
                        left: animLeft,
                        width: animWidth,
                        height: animHeight,
                        borderRadius: animBorderRadius,
                        overflow: 'hidden',
                        zIndex: 20,
                        shadowColor: '#6366F1',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        elevation: 10,
                    }}
                >
                    <LinearGradient
                        colors={['#6366F1', '#1E2A5E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                    {/* White overlay that fades in when expanded */}
                    <Animated.View style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: '#FFFFFF',
                        opacity: morphProgress,
                    }} />

                    {/* Collapsed FAB icon */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: fabIconOpacity,
                        }}
                        pointerEvents={chatExpanded ? 'none' : 'auto'}
                    >
                        <Pressable
                            onPress={expandFab}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}
                        >
                            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
                        </Pressable>
                    </Animated.View>

                    {/* Expanded panel content */}
                    <Animated.View
                        style={{
                            flex: 1,
                            opacity: contentOpacity,
                            padding: 14,
                        }}
                        pointerEvents={chatExpanded ? 'auto' : 'none'}
                    >
                        {isThinking ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <View style={{ flexDirection: 'row', gap: 5 }}>
                                    {[dot1, dot2, dot3].map((d, i) => (
                                        <Animated.View
                                            key={i}
                                            style={{
                                                width: 7, height: 7, borderRadius: 3.5,
                                                backgroundColor: '#6366F1',
                                                opacity: d,
                                                transform: [{ scale: d }],
                                            }}
                                        />
                                    ))}
                                </View>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: '#9CA3AF' }}>Analysing your request</Text>
                            </View>
                        ) : (
                            <>
                                {/* Input row */}
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: AppColors.surface,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#6366F160',
                                    paddingHorizontal: 12,
                                    height: 42,
                                    gap: 8,
                                    shadowColor: '#6366F1',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 10,
                                    elevation: 4,
                                }}>
                                    <Ionicons name="sparkles" size={14} color={'#6366F1'} />
                                    <RNTextInput
                                        ref={inputRef}
                                        value={chatInput}
                                        onChangeText={setChatInput}
                                        placeholder="Ask AI assistant..."
                                        placeholderTextColor="#9CA3AF"
                                        style={{
                                            flex: 1,
                                            fontSize: 13,
                                            fontFamily: 'IBMPlexSans_400Regular',
                                            color: AppColors.textPrimary,
                                            height: 40,
                                            padding: 0,
                                        }}
                                        returnKeyType="send"
                                        onSubmitEditing={() => submitChat()}
                                    />
                                    {chatInput.trim() ? (
                                        <Pressable onPress={() => submitChat()} hitSlop={6}>
                                            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }}>
                                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                                    <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                </Svg>
                                            </View>
                                        </Pressable>
                                    ) : (
                                        <Pressable onPress={collapseFab} hitSlop={6}>
                                            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="close" size={14} color="#9CA3AF" />
                                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#9CA3AF' }}>Close</Text>
                                            </View>
                                        </Pressable>
                                    )}
                                </View>

                                {/* Divider */}
                                <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 10, marginHorizontal: -2 }} />

                                {/* Suggestions */}
                                <View style={{ gap: 2 }}>
                                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', marginBottom: 4 }}>Suggestions</Text>
                                    {[
                                        'Summarize active cases',
                                        'Analyze Case #2024-0892',
                                        'What evidence is missing?',
                                    ].map((s) => (
                                        <Pressable
                                            key={s}
                                            onPress={() => {
                                                setChatInput(s);
                                                inputRef.current?.focus();
                                            }}
                                            style={({ pressed }) => ({
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 8,
                                                paddingVertical: 8,
                                                paddingHorizontal: 10,
                                                borderRadius: 8,
                                                backgroundColor: pressed ? '#F3F4F6' : 'transparent',
                                            })}
                                        >
                                            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                                <Path d="M5 12h14M12 5l7 7-7 7" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', flex: 1 }}>{s}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </>
                        )}
                    </Animated.View>
                </Animated.View>
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
