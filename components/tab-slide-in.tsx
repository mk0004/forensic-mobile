import { useRef, useCallback, type ReactNode } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from 'expo-router';

/**
 * Wraps tab screen content with a subtle slide + fade animation
 * that plays each time the screen gains focus (tab switch).
 * Place INSIDE the root View, around ScrollView / content.
 */
export function TabSlideIn({ children }: { children: ReactNode }) {
    const opacity = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const isFirst = useRef(true);

    useFocusEffect(
        useCallback(() => {
            if (isFirst.current) {
                isFirst.current = false;
                return; // skip initial mount
            }
            opacity.setValue(0.85);
            translateX.setValue(18);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
        }, [opacity, translateX]),
    );

    return (
        <Animated.View style={{ flex: 1, opacity, transform: [{ translateX }] }}>
            {children}
        </Animated.View>
    );
}
