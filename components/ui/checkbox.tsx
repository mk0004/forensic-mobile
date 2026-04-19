import { Pressable, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography } from '@/constants/theme';

interface CheckboxProps {
    checked: boolean;
    onToggle: () => void;
    label: string;
}

export function Checkbox({ checked, onToggle, label }: CheckboxProps) {
    return (
        <Pressable
            onPress={onToggle}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            hitSlop={8}
        >
            <View
                style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    borderCurve: 'continuous',
                    borderWidth: 1.5,
                    borderColor: checked ? AppColors.primary : AppColors.border,
                    backgroundColor: checked ? AppColors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {checked && (
                    <Svg width={10} height={8} viewBox="0 0 10 8" fill="none">
                        <Path
                            d="M1 4L3.5 6.5L9 1"
                            stroke={AppColors.white}
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                )}
            </View>
            <Text style={{ ...Typography.caption, color: AppColors.textPrimary }}>{label}</Text>
        </Pressable>
    );
}
