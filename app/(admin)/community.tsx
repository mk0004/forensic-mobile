import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import {
    useAdminCommunityArticlesInfinite,
    useAdminCommunityFeedsInfinite,
    useAdminCommunityCommentsInfinite,
    useAdminDeletePostMutation,
    useAdminDeleteCommentMutation,
} from '@/lib/hooks/use-admin-api';

type Tab = 'articles' | 'feeds' | 'comments';
const TABS: { key: Tab; label: string }[] = [
    { key: 'articles', label: 'Articles' },
    { key: 'feeds', label: 'Feeds' },
    { key: 'comments', label: 'Comments' },
];

interface Row { id: string; rawId: number; kind: Tab; title: string; author?: string; icon: 'document-text-outline' | 'megaphone-outline' | 'chatbubble-outline' }

export default function CommunityModeration() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [tab, setTab] = useState<Tab>('articles');
    const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

    const articlesInf = useAdminCommunityArticlesInfinite();
    const feedsInf = useAdminCommunityFeedsInfinite();
    const commentsInf = useAdminCommunityCommentsInfinite();
    const deletePost = useAdminDeletePostMutation();
    const deleteComment = useAdminDeleteCommentMutation();

    const active = tab === 'articles' ? articlesInf : tab === 'feeds' ? feedsInf : commentsInf;
    const query = active.query;

    const rows: Row[] = tab === 'articles'
        ? articlesInf.items.map((a) => ({ id: `a-${a.id}`, rawId: a.id, kind: 'articles' as const, title: a.title ?? 'Untitled article', author: a.user?.name, icon: 'document-text-outline' as const }))
        : tab === 'feeds'
            ? feedsInf.items.map((f) => ({ id: `f-${f.id}`, rawId: f.id, kind: 'feeds' as const, title: f.content ?? 'No content', author: f.user?.name, icon: 'megaphone-outline' as const }))
            : commentsInf.items.map((c) => ({ id: `c-${c.id}`, rawId: c.id, kind: 'comments' as const, title: c.comment ?? 'No content', author: c.user?.name, icon: 'chatbubble-outline' as const }));

    const confirmDelete = () => {
        if (!deleteTarget) return;
        if (deleteTarget.kind === 'comments') {
            deleteComment.mutate(deleteTarget.rawId);
        } else {
            deletePost.mutate(deleteTarget.rawId);
        }
        setDeleteTarget(null);
    };

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            <View style={{ paddingTop: insets.top }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, backgroundColor: AppColors.white, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Pressable onPress={() => router.back()} hitSlop={8}>
                        <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
                    </Pressable>
                    <Text style={{ ...Typography.h5, color: AppColors.textPrimary, flex: 1 }}>Community</Text>
                </View>

                <View style={{ flexDirection: 'row', backgroundColor: AppColors.white, paddingHorizontal: Spacing.md, paddingBottom: 8, gap: 8 }}>
                    {TABS.map((t) => {
                        const isActive = tab === t.key;
                        return (
                            <Pressable key={t.key} onPress={() => setTab(t.key)} style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: isActive ? AppColors.primary : '#F3F4F6', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontFamily: isActive ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_400Regular', color: isActive ? AppColors.white : '#6B7280' }}>{t.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingTop: 14, paddingBottom: insets.bottom + 24, gap: 10 }}>
                {query.isLoading ? (
                    <View style={{ paddingTop: 50, alignItems: 'center' }}><ActivityIndicator color={AppColors.primary} /></View>
                ) : query.isError ? (
                    <Text selectable style={{ ...Typography.bodySmall, color: AppColors.error, textAlign: 'center', paddingTop: 40 }}>
                        {query.error instanceof Error ? query.error.message : 'Failed to load community'}
                    </Text>
                ) : rows.length === 0 ? (
                    <Text style={{ ...Typography.bodySmall, color: '#9CA3AF', textAlign: 'center', paddingTop: 40 }}>No {tab}</Text>
                ) : (
                    <>
                        {rows.map((r) => (
                            <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: AppColors.white, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 }}>
                                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: AppColors.primary + '12', alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name={r.icon} size={18} color={AppColors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }} numberOfLines={2}>{r.title}</Text>
                                    {!!r.author && <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>by {r.author}</Text>}
                                </View>
                                <Pressable onPress={() => setDeleteTarget(r)} hitSlop={8} style={{ padding: 4 }}>
                                    <Ionicons name="trash-outline" size={18} color={AppColors.error} />
                                </Pressable>
                            </View>
                        ))}
                        {query.hasNextPage && (
                            <Pressable onPress={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} style={({ pressed }) => ({ marginTop: 4, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#F3F4F6' : AppColors.white })}>
                                {query.isFetchingNextPage ? <ActivityIndicator size="small" color={AppColors.primary} /> : <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>Load more</Text>}
                            </Pressable>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 }} onPress={() => setDeleteTarget(null)}>
                    <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: AppColors.white, borderRadius: 16, padding: 20, gap: 8, alignItems: 'center' }}>
                        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: AppColors.error + '14', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                            <Ionicons name="trash-outline" size={24} color={AppColors.error} />
                        </View>
                        <Text style={{ fontSize: 17, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, textAlign: 'center' }}>Delete this item?</Text>
                        <Text numberOfLines={2} style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', textAlign: 'center', lineHeight: 19 }}>
                            This content will be permanently removed from the community.
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
