import { useRef } from 'react';
import { PanResponder } from 'react-native';
import { useNavigation } from 'expo-router';

const TAB_ORDER = ['index', 'explore', 'community', 'settings'];
const SWIPE_THRESHOLD = 50;
const VERTICAL_LIMIT = 30;

/**
 * Returns PanResponder handlers for swiping between bottom tabs.
 * Spread on the outermost View of each tab screen.
 */
export function useSwipeTabs(currentTabIndex: number) {
    const navigation = useNavigation();
    const indexRef = useRef(currentTabIndex);
    indexRef.current = currentTabIndex;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, { dx, dy }) =>
                Math.abs(dx) > 15 && Math.abs(dy) < VERTICAL_LIMIT,
            onPanResponderRelease: (_, { dx, vx }) => {
                const idx = indexRef.current;
                if ((dx < -SWIPE_THRESHOLD || vx < -0.5) && idx < TAB_ORDER.length - 1) {
                    (navigation as any).navigate(TAB_ORDER[idx + 1]);
                } else if ((dx > SWIPE_THRESHOLD || vx > 0.5) && idx > 0) {
                    (navigation as any).navigate(TAB_ORDER[idx - 1]);
                }
            },
        })
    ).current;

    return panResponder.panHandlers;
}
