import { useState } from 'react';
import { View, TextInput as RNTextInput, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography } from '@/constants/theme';

interface TextInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: 'email' | 'lock' | 'user' | 'hash' | 'phone' | 'calendar';
    rightIcon?: 'calendar';
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    error?: string;
    editable?: boolean;
    onPress?: () => void;
}

function EmailIcon() {
    return (
        <Svg width={18} height={16} viewBox="0 0 14 13" fill="none">
            <Path
                d="M1 3.5L6.3 7.65C6.5 7.8 6.75 7.88 7 7.88C7.25 7.88 7.5 7.8 7.7 7.65L13 3.5M2.5 11.5H11.5C12.33 11.5 13 10.83 13 10V3C13 2.17 12.33 1.5 11.5 1.5H2.5C1.67 1.5 1 2.17 1 3V10C1 10.83 1.67 11.5 2.5 11.5Z"
                stroke={AppColors.border}
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function LockIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
                d="M14 8V6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6V8M5 18H15C16.1 18 17 17.1 17 16V10C17 8.9 16.1 8 15 8H5C3.9 8 3 8.9 3 10V16C3 17.1 3.9 18 5 18Z"
                stroke={AppColors.border}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function UserIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 14 14" fill="none">
            <Path
                d="M7 7C8.66 7 10 5.66 10 4C10 2.34 8.66 1 7 1C5.34 1 4 2.34 4 4C4 5.66 5.34 7 7 7ZM7 8.5C4.83 8.5 1 9.58 1 11.75V13H13V11.75C13 9.58 9.17 8.5 7 8.5Z"
                stroke={AppColors.border}
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function EyeIcon({ visible }: { visible: boolean }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            {visible ? (
                <Path
                    d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4ZM10 13C8.34 13 7 11.66 7 10C7 8.34 8.34 7 10 7C11.66 7 13 8.34 13 10C13 11.66 11.66 13 10 13Z"
                    stroke={AppColors.border}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ) : (
                <>
                    <Path
                        d="M1 1L19 19M8.1 8.1C7.4 8.8 7 9.8 7 10C7 11.66 8.34 13 10 13C10.2 13 11.2 12.6 11.9 11.9M14.9 14.1C13.5 15.4 11.8 16 10 16C4 16 1 10 1 10C1 10 2.6 7.2 5.1 5.3M8.3 4.2C8.9 4.07 9.4 4 10 4C16 4 19 10 19 10C19 10 18.3 11.3 17 12.7"
                        stroke={AppColors.border}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </>
            )}
        </Svg>
    );
}

const iconComponents = {
    email: EmailIcon,
    lock: LockIcon,
    user: UserIcon,
    hash: HashIcon,
    phone: PhoneIcon,
    calendar: CalendarIcon,
};

function HashIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
                d="M4 8h16M4 16h16M8 4l-2 16M18 4l-2 16"
                stroke={AppColors.border}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function PhoneIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                stroke={AppColors.border}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

function CalendarIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
                d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
                stroke={AppColors.border}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

export function TextInput({
    placeholder,
    value,
    onChangeText,
    icon,
    rightIcon,
    secureTextEntry = false,
    autoCapitalize = 'none',
    keyboardType = 'default',
    error,
    editable = true,
    onPress,
}: TextInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const IconComponent = icon ? iconComponents[icon] : null;
    const RightIconComponent = rightIcon ? iconComponents[rightIcon] : null;
    const hasError = !!error;

    const inputContent = (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 50,
                borderRadius: 10,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: hasError ? AppColors.error : focused ? AppColors.primary : AppColors.border,
                backgroundColor: AppColors.white,
                paddingHorizontal: 14,
                gap: 6,
            }}
        >
            {IconComponent && <IconComponent />}
            <RNTextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry && !showPassword}
                autoCapitalize={autoCapitalize}
                keyboardType={keyboardType}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                editable={editable && !onPress}
                placeholderTextColor={AppColors.border}
                style={{
                    flex: 1,
                    ...Typography.bodySmall,
                    color: AppColors.textPrimary,
                    padding: 0,
                }}
            />
            {secureTextEntry && (
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    <EyeIcon visible={showPassword} />
                </Pressable>
            )}
            {RightIconComponent && !secureTextEntry && <RightIconComponent />}
        </View>
    );

    return (
        <View style={{ gap: 4 }}>
            {onPress ? (
                <Pressable onPress={onPress}>{inputContent}</Pressable>
            ) : (
                inputContent
            )}
            {hasError && (
                <Text style={{ ...Typography.caption, color: AppColors.error, marginLeft: 4 }}>
                    {error}
                </Text>
            )}
        </View>
    );
}
