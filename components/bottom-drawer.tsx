import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Animated, Dimensions, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography } from '@/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
    visible: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: ReactNode;
    height?: number;
};

export function BottomDrawer({ visible, onClose, title, subtitle, children, height }: Props) {
    const insets = useSafeAreaInsets();
    const DRAWER_HEIGHT = height ?? SCREEN_HEIGHT * 0.78;

    const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const isScrolledToTop = useRef(true);
    const scrollRef = useRef<ScrollView>(null);

    const open = useCallback(() => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                damping: 22,
                stiffness: 220,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [translateY, backdropOpacity]);

    const close = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: DRAWER_HEIGHT,
                duration: 280,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 280,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    }, [translateY, backdropOpacity, DRAWER_HEIGHT, onClose]);

    useEffect(() => {
        if (visible) {
            translateY.setValue(DRAWER_HEIGHT);
            backdropOpacity.setValue(0);
            open();
        }
    }, [visible]);

    const handlePanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
            onPanResponderMove: (_, gs) => {
                if (gs.dy > 0) translateY.setValue(gs.dy);
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > 80 || gs.vy > 0.5) {
                    close();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        damping: 22,
                        stiffness: 220,
                    }).start();
                }
            },
        })
    ).current;

    const contentPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gs) => {
                return isScrolledToTop.current && gs.dy > 10;
            },
            onPanResponderMove: (_, gs) => {
                if (gs.dy > 0) translateY.setValue(gs.dy);
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > 80 || gs.vy > 0.5) {
                    close();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        damping: 22,
                        stiffness: 220,
                    }).start();
                }
            },
        })
    ).current;

    if (!visible) return null;

    return (
        <Modal visible transparent animationType="none" onRequestClose={close}>
            <View style={{ flex: 1 }}>
                {/* Backdrop */}
                <Animated.View
                    style={{
                        position: 'absolute' as const,
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        opacity: backdropOpacity,
                    }}
                >
                    <Pressable style={{ flex: 1 }} onPress={close} />
                </Animated.View>

                {/* Drawer */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: DRAWER_HEIGHT,
                        backgroundColor: AppColors.surface,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        overflow: 'hidden',
                        transform: [{ translateY }],
                    }}
                >
                    {/* Drag handle */}
                    <View {...handlePanResponder.panHandlers}>
                        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB' }} />
                        </View>

                        {/* Header */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingHorizontal: 20,
                                paddingBottom: 14,
                                paddingTop: 4,
                            }}
                        >
                            <View style={{ gap: 2, flex: 1 }}>
                                <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>
                                    {title}
                                </Text>
                                {subtitle && (
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.border }}>
                                        {subtitle}
                                    </Text>
                                )}
                            </View>
                            <Pressable
                                onPress={close}
                                hitSlop={12}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: '#F3F4F6',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                                    <Path
                                        d="M18 6L6 18M6 6l12 12"
                                        stroke={AppColors.textPrimary}
                                        strokeWidth={2.5}
                                        strokeLinecap="round"
                                    />
                                </Svg>
                            </Pressable>
                        </View>
                    </View>

                    {/* Scrollable content */}
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
                        showsVerticalScrollIndicator={false}
                        onScroll={(e) => {
                            isScrolledToTop.current = e.nativeEvent.contentOffset.y <= 0;
                        }}
                        scrollEventThrottle={16}
                        keyboardShouldPersistTaps="handled"
                        {...contentPanResponder.panHandlers}
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}
