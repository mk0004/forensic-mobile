import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/theme';

type ToastVariant = 'error' | 'success';

interface ToastState {
  message: string;
  variant: ToastVariant;
}

type ToastListener = (toast: ToastState) => void;

let listener: ToastListener | null = null;

export function showAppError(message: string): void {
  listener?.({ message, variant: 'error' });
}

export function showAppSuccess(message: string): void {
  listener?.({ message, variant: 'success' });
}

interface ErrorToastContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const ErrorToastContext = createContext<ErrorToastContextValue | null>(null);

export function useAppToast(): ErrorToastContextValue {
  const ctx = useContext(ErrorToastContext);
  if (!ctx) {
    throw new Error('useAppToast must be used within ErrorToastProvider');
  }
  return ctx;
}

export function ErrorToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [opacity]);

  const present = useCallback(
    (next: ToastState) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      setToast(next);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(dismiss, next.variant === 'error' ? 5000 : 2500);
    },
    [dismiss, opacity],
  );

  useEffect(() => {
    listener = present;
    return () => {
      listener = null;
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [present]);

  const showError = useCallback((message: string) => present({ message, variant: 'error' }), [present]);
  const showSuccess = useCallback((message: string) => present({ message, variant: 'success' }), [present]);

  return (
    <ErrorToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 16,
            right: 16,
            opacity,
            zIndex: 9999,
          }}
        >
          <Pressable
            onPress={dismiss}
            style={{
              backgroundColor: toast.variant === 'error' ? AppColors.error : AppColors.success,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: AppColors.white, fontFamily: 'IBMPlexSans_700Bold', fontSize: 13 }}>
                {toast.variant === 'error' ? '!' : '✓'}
              </Text>
            </View>
            <Text
              style={{ flex: 1, color: AppColors.white, fontFamily: 'IBMPlexSans_500Medium', fontSize: 13, lineHeight: 18 }}
            >
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </ErrorToastContext.Provider>
  );
}
