import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useAdminChatInfinite, useAdminDeleteConversationMutation } from '@/lib/hooks/use-admin-api';
import type { AdminChatConversation } from '@/types/api';

export default function ChatManagement() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { query: chatQuery, items: conversations } = useAdminChatInfinite();
    const deleteConv = useAdminDeleteConversationMutation();
    const [deleteTarget, setDeleteTarget] = useState<AdminChatConversation | null>(null);

    const confirmDelete = () => {
        if (deleteTarget) deleteConv.mutate(deleteTarget.id);
        setDeleteTarget(null);
    };

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: AppColors.white, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>Chat Management</Text>
                    <View style={{ backgroundColor: AppColors.primary + '12', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>{conversations.length}</Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: Spacing.md, paddingTop: 14, gap: 10 }}>
                    {chatQuery.isLoading ? (
                        <View style={{ paddingTop: 50, alignItems: 'center' }}><ActivityIndicator color={AppColors.primary} /></View>
                    ) : chatQuery.isError ? (
                        <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center', paddingTop: 40 }}>
                            {chatQuery.error instanceof Error ? chatQuery.error.message : 'Failed to load conversations'}
                        </Text>
                    ) : conversations.length === 0 ? (
                        <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', textAlign: 'center', paddingTop: 40 }}>No conversations</Text>
                    ) : (
                        <>
                            {conversations.map((c) => (
                                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 }}>
                                    <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: AppColors.primary + '12', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="sparkles-outline" size={18} color={AppColors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }} numberOfLines={1}>{c.title ?? `Conversation ${c.id}`}</Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{c.messages_count} messages</Text>
                                    </View>
                                    <Pressable onPress={() => setDeleteTarget(c)} hitSlop={8} style={{ padding: 4 }}>
                                        <Ionicons name="trash-outline" size={18} color={AppColors.error} />
                                    </Pressable>
                                </View>
                            ))}
                            {chatQuery.hasNextPage && (
                                <Pressable onPress={() => chatQuery.fetchNextPage()} disabled={chatQuery.isFetchingNextPage} style={({ pressed }) => ({ marginTop: 4, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#F3F4F6' : AppColors.white })}>
                                    {chatQuery.isFetchingNextPage ? <ActivityIndicator size="small" color={AppColors.primary} /> : <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>Load more</Text>}
                                </Pressable>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 }} onPress={() => setDeleteTarget(null)}>
                    <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: AppColors.white, borderRadius: 16, padding: 20, gap: 8, alignItems: 'center' }}>
                        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: AppColors.error + '14', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                            <Ionicons name="trash-outline" size={24} color={AppColors.error} />
                        </View>
                        <Text style={{ fontSize: 17, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, textAlign: 'center' }}>Delete conversation?</Text>
                        <Text numberOfLines={2} style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', textAlign: 'center', lineHeight: 19 }}>
                            “{deleteTarget?.title ?? 'Conversation'}” and all its messages will be permanently removed.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, width: '100%' }}>
                            <Pressable onPress={() => setDeleteTarget(null)} style={({ pressed }) => ({ flex: 1, height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#F3F4F6' : AppColors.white })}>
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={confirmDelete} style={({ pressed }) => ({ flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#B91C1C' : AppColors.error })}>
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Delete</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
