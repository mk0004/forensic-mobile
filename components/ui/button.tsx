import { Pressable, Text, ActivityIndicator } from 'react-native';
import { AppColors, Typography } from '@/constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'disabled';
    loading?: boolean;
    fullWidth?: boolean;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    fullWidth = true,
}: ButtonProps) {
    const styles = {
        primary: {
            bg: AppColors.primary,
            text: AppColors.white,
            border: 'transparent',
        },
        secondary: {
            bg: AppColors.secondary,
            text: AppColors.white,
            border: 'transparent',
        },
        outline: {
            bg: 'transparent',
            text: AppColors.primary,
            border: AppColors.primary,
        },
        disabled: {
            bg: AppColors.border,
            text: AppColors.white,
            border: 'transparent',
        },
    }[variant];

    return (
        <Pressable
            onPress={variant === 'disabled' ? undefined : onPress}
            style={({ pressed }) => ({
                backgroundColor: pressed && variant === 'primary' ? AppColors.primaryHover : styles.bg,
                borderRadius: 12,
                borderCurve: 'continuous' as const,
                borderWidth: variant === 'outline' ? 1.5 : 0,
                borderColor: styles.border,
                height: 52,
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                width: fullWidth ? '100%' : undefined,
                paddingHorizontal: fullWidth ? 0 : 24,
                opacity: pressed && variant !== 'disabled' ? 0.9 : 1,
            })}
            disabled={variant === 'disabled' || loading}
        >
            {loading ? (
                <ActivityIndicator color={styles.text} />
            ) : (
                <Text style={{ ...Typography.button, color: styles.text }}>{title}</Text>
            )}
        </Pressable>
    );
}
