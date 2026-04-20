import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { DiscardChangesModal } from '@/components/ui/discard-changes-modal';

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function UploadIcon() {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 8l-5-5-5 5" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 3v12" stroke={AppColors.primary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function ImageIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M3 16l5-5 4 4 3-3 6 6" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={8.5} cy={8.5} r={1.5} fill="#6B7280" />
        </Svg>
    );
}

function RemoveIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} fill="#00000040" />
            <Path d="M15 9l-6 6M9 9l6 6" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}

function PostIcon({ active }: { active: boolean }) {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function PublicationIcon({ active }: { active: boolean }) {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

type FlowType = 'post' | 'publication';

export default function CreateArticle() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [flow, setFlow] = useState<FlowType>('post');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [hasImage, setHasImage] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);

    const isDirty = title.length > 0 || body.length > 0 || hasImage;
    const isPost = flow === 'post';

    const handleBack = () => {
        if (isDirty) { setShowDiscard(true); } else { router.back(); }
    };

    const handleSwitchFlow = (newFlow: FlowType) => {
        if (newFlow !== flow) {
            setFlow(newFlow);
            setTitle('');
            setBody('');
            setHasImage(false);
        }
    };

    const canPublish = isPost ? body.trim().length > 0 : title.trim().length > 0 && body.trim().length > 0;

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Spacing.md,
                    paddingTop: insets.top + 8,
                    paddingBottom: 14,
                    backgroundColor: AppColors.white,
                    gap: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                }}>
                    <Pressable onPress={handleBack} hitSlop={8}>
                        <BackIcon />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>
                        {isPost ? 'New Post' : 'New Publication'}
                    </Text>
                    <Pressable
                        onPress={() => canPublish && router.back()}
                        disabled={!canPublish}
                        style={({ pressed }) => ({
                            backgroundColor: canPublish
                                ? (pressed ? AppColors.primaryHover : AppColors.primary)
                                : '#E5E7EB',
                            borderRadius: 10,
                            paddingHorizontal: 18,
                            paddingVertical: 8,
                        })}
                    >
                        <Text style={{
                            fontSize: 13,
                            fontFamily: 'IBMPlexSans_600SemiBold',
                            color: canPublish ? AppColors.white : '#9CA3AF',
                        }}>
                            Publish
                        </Text>
                    </Pressable>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 20 }}>
                    {/* Flow selector */}
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: AppColors.white,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        padding: 4,
                    }}>
                        <Pressable
                            onPress={() => handleSwitchFlow('post')}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                paddingVertical: 10,
                                borderRadius: 10,
                                backgroundColor: isPost ? AppColors.primary + '0A' : 'transparent',
                                borderWidth: isPost ? 1 : 0,
                                borderColor: AppColors.primary + '20',
                            }}
                        >
                            <PostIcon active={isPost} />
                            <Text style={{
                                fontSize: 13,
                                fontFamily: isPost ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_400Regular',
                                color: isPost ? AppColors.primary : '#9CA3AF',
                            }}>
                                Post
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => handleSwitchFlow('publication')}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                paddingVertical: 10,
                                borderRadius: 10,
                                backgroundColor: !isPost ? AppColors.primary + '0A' : 'transparent',
                                borderWidth: !isPost ? 1 : 0,
                                borderColor: AppColors.primary + '20',
                            }}
                        >
                            <PublicationIcon active={!isPost} />
                            <Text style={{
                                fontSize: 13,
                                fontFamily: !isPost ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_400Regular',
                                color: !isPost ? AppColors.primary : '#9CA3AF',
                            }}>
                                Publication
                            </Text>
                        </Pressable>
                    </View>

                    {/* Publication: Title field */}
                    {!isPost && (
                        <View style={{ gap: 8 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                Title <Text style={{ color: '#EF4444' }}>*</Text>
                            </Text>
                            <View
                                style={{
                                    backgroundColor: AppColors.white,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    paddingHorizontal: 14,
                                    height: 48,
                                    justifyContent: 'center',
                                }}
                            >
                                <RNTextInput
                                    placeholder="Enter publication title"
                                    value={title}
                                    onChangeText={setTitle}
                                    style={{
                                        fontSize: 14,
                                        fontFamily: 'IBMPlexSans_400Regular',
                                        color: AppColors.textPrimary,
                                    }}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    )}

                    {/* Content field */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            {isPost ? 'What\'s on your mind?' : 'Content'} <Text style={{ color: '#EF4444' }}>*</Text>
                        </Text>
                        <View
                            style={{
                                backgroundColor: AppColors.white,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                minHeight: isPost ? 140 : 200,
                            }}
                        >
                            <RNTextInput
                                placeholder={isPost ? 'Share an update, insight, or finding...' : 'Write your publication content...'}
                                value={body}
                                onChangeText={setBody}
                                multiline
                                textAlignVertical="top"
                                style={{
                                    flex: 1,
                                    fontSize: 14,
                                    fontFamily: 'IBMPlexSans_400Regular',
                                    color: AppColors.textPrimary,
                                    minHeight: isPost ? 116 : 176,
                                }}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                        {/* Character count for posts */}
                        {isPost && (
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB', textAlign: 'right' }}>
                                {body.length} / 500
                            </Text>
                        )}
                    </View>

                    {/* Upload Image (Optional) */}
                    <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                            Image <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>(optional)</Text>
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Pressable
                                onPress={() => setHasImage(true)}
                                style={{
                                    flex: 1,
                                    height: 100,
                                    borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: '#E5E7EB',
                                    borderStyle: 'dashed',
                                    backgroundColor: AppColors.white,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                }}
                            >
                                <UploadIcon />
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                    Tap to upload
                                </Text>
                                <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>
                                    JPG, PNG up to 5MB
                                </Text>
                            </Pressable>

                            {hasImage && (
                                <View style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <ImageIcon />
                                        <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', marginTop: 4 }}>Preview</Text>
                                    </View>
                                    <Pressable
                                        onPress={() => setHasImage(false)}
                                        style={{ position: 'absolute', top: 6, right: 6 }}
                                    >
                                        <RemoveIcon />
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Bottom action row */}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                        <Pressable
                            onPress={handleBack}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                borderRadius: 12,
                                height: 48,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            })}
                        >
                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => canPublish && router.back()}
                            disabled={!canPublish}
                            style={({ pressed }) => ({
                                flex: 1,
                                backgroundColor: canPublish
                                    ? (pressed ? AppColors.primaryHover : AppColors.primary)
                                    : '#E5E7EB',
                                borderRadius: 12,
                                height: 48,
                                alignItems: 'center',
                                justifyContent: 'center',
                            })}
                        >
                            <Text style={{
                                fontSize: 14,
                                fontFamily: 'IBMPlexSans_600SemiBold',
                                color: canPublish ? AppColors.white : '#9CA3AF',
                            }}>
                                {isPost ? 'Post' : 'Publish'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
            <DiscardChangesModal visible={showDiscard} onCancel={() => setShowDiscard(false)} onDiscard={() => { setShowDiscard(false); router.back(); }} />
        </View>
    );
}
