import { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Dimensions, NativeSyntheticEvent, NativeScrollEvent, TextInput as RNTextInput, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useSwipeTabs } from '@/hooks/use-swipe-tabs';
import { TabSlideIn } from '@/components/tab-slide-in';
import { BottomDrawer } from '@/components/bottom-drawer';
import {
    useFeedQuery,
    useToggleLikeFeedMutation,
    useToggleLikeArticleMutation,
    useAddCommentFeedMutation,
    useAddCommentArticleMutation,
    isArticleItem,
    feedAuthorName,
    feedAuthorSpecialty,
    feedCommentText,
    feedCommentAuthor,
    timeAgo,
    type FeedItem,
    type FeedComment,
} from '@/lib/hooks/use-community-api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ─── Icons ─── */
function SearchIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function HeartIcon({ filled }: { filled?: boolean }) {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill={filled ? '#EF4444' : 'none'}>
            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={filled ? '#EF4444' : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function CommentIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function ClockIcon() {
    return (
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke="#D1D5DB" strokeWidth={1.5} />
            <Path d="M12 6v6l4 2" stroke="#D1D5DB" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
    );
}

function BookmarkIcon({ filled }: { filled?: boolean }) {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill={filled ? AppColors.primary : 'none'}>
            <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke={filled ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function MoreIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={5} r={1} fill="#9CA3AF" />
            <Circle cx={12} cy={12} r={1} fill="#9CA3AF" />
            <Circle cx={12} cy={19} r={1} fill="#9CA3AF" />
        </Svg>
    );
}

function EditIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function TrashIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#EF4444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function TrendUpIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M23 6l-9.5 9.5-5-5L1 18" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 6h6v6" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function PenIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

/* ─── Tab icons ─── */
function FeedTabIcon({ active }: { active: boolean }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={9} cy={7} r={4} stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} />
            <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function PubTabIcon({ active }: { active: boolean }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function MyPubTabIcon({ active }: { active: boolean }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={active ? AppColors.primary : '#9CA3AF'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

/* ─── Data ─── */
const TAB_LABELS = ['Feed', 'Publications', 'My Posts'];

interface Post {
    id: string;
    author: string;
    specialty: string;
    avatarColor: string;
    content: string;
    likes: number;
    comments: number;
    timeAgo: string;
    kind?: 'feed' | 'article';
    serverComments?: FeedComment[];
}

interface Article {
    id: string;
    author: string;
    specialty: string;
    avatarColor: string;
    title: string;
    content: string;
    hasImage: boolean;
    likes: number;
    comments: number;
    timeAgo: string;
    readTime?: string;
    kind?: 'feed' | 'article';
    serverComments?: FeedComment[];
}

// Deterministic avatar color derived from the author name (server gives no color).
const AVATAR_PALETTE = ['#D4A574', '#8B6F5C', '#A0522D', '#6B8E8E', '#4682B4', '#5B8C5A', '#8B5E83', '#C4A35A'];
function avatarColorFor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function feedItemToPost(item: FeedItem): Post {
    const author = feedAuthorName(item);
    return {
        id: String(item.id),
        author,
        specialty: feedAuthorSpecialty(item),
        avatarColor: avatarColorFor(author),
        content: item.content ?? item.title ?? '',
        likes: item.likes_count ?? 0,
        comments: item.comments_count ?? (item.comments?.length ?? 0),
        timeAgo: timeAgo(item.created_at),
        kind: isArticleItem(item) ? 'article' : 'feed',
        serverComments: item.comments,
    };
}

function feedItemToArticle(item: FeedItem): Article {
    const author = feedAuthorName(item);
    return {
        id: String(item.id),
        author,
        specialty: feedAuthorSpecialty(item),
        avatarColor: avatarColorFor(author),
        title: item.title ?? (item.content ?? '').slice(0, 80),
        content: item.content ?? '',
        hasImage: typeof item.image === 'string' && item.image.length > 0,
        likes: item.likes_count ?? 0,
        comments: item.comments_count ?? (item.comments?.length ?? 0),
        timeAgo: timeAgo(item.created_at),
        kind: isArticleItem(item) ? 'article' : 'feed',
        serverComments: item.comments,
    };
}

/* ─── Components ─── */
function AvatarCircle({ color, size = 40, initials }: { color: string; size?: number; initials?: string }) {
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
            {initials && (
                <Text style={{ fontSize: size * 0.35, fontFamily: 'IBMPlexSans_600SemiBold', color: 'rgba(255,255,255,0.9)' }}>{initials}</Text>
            )}
        </View>
    );
}

function getInitials(name: string) {
    return name.split(' ').filter(w => w[0] && w[0] === w[0].toUpperCase()).map(w => w[0]).slice(0, 2).join('');
}

const PUBLICATION_IMAGES = [
    require('../../../assets/images/onboarding-1.png'),
    require('../../../assets/images/onboarding-2.png'),
    require('../../../assets/images/onboarding-3.png'),
    require('../../../assets/images/get-started-bg.png'),
];

function ArticleImage({ index }: { index: number }) {
    return (
        <Image
            source={PUBLICATION_IMAGES[index % PUBLICATION_IMAGES.length]}
            style={{ width: 80, height: 80, borderRadius: 10 }}
            resizeMode="cover"
        />
    );
}

function EngagementRow({ likes, comments, timeAgo, showEdit = false, liked = false, bookmarked = false, onLike, onBookmark, onComment }: { likes: number; comments: number; timeAgo: string; showEdit?: boolean; liked?: boolean; bookmarked?: boolean; onLike?: () => void; onBookmark?: () => void; onComment?: () => void }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Pressable
                    onPress={onLike}
                    style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: liked ? '#FEF2F2' : (pressed ? '#F9FAFB' : 'transparent'),
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                    })}
                >
                    <HeartIcon filled={liked} />
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: liked ? '#EF4444' : '#6B7280' }}>{likes + (liked ? 1 : 0)}</Text>
                </Pressable>
                <Pressable
                    onPress={onComment}
                    style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: pressed ? '#F9FAFB' : 'transparent',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                    })}
                >
                    <CommentIcon />
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: '#6B7280' }}>{comments}</Text>
                </Pressable>
                <Pressable
                    onPress={onBookmark}
                    style={({ pressed }) => ({
                        backgroundColor: bookmarked ? AppColors.primary + '0A' : (pressed ? '#F9FAFB' : 'transparent'),
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 5,
                    })}
                >
                    <BookmarkIcon filled={bookmarked} />
                </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {showEdit && (
                    <>
                        <Pressable hitSlop={8} style={{ padding: 4 }}><EditIcon /></Pressable>
                        <Pressable hitSlop={8} style={{ padding: 4 }}><TrashIcon /></Pressable>
                    </>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ClockIcon />
                    <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>{timeAgo}</Text>
                </View>
            </View>
        </View>
    );
}

function SendIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M22 2L11 13" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M22 2l-7 20-4-9-9-4 20-7z" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

export default function CommunityScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const swipeHandlers = useSwipeTabs(2);
    const [activeTab, setActiveTab] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const pagerRef = useRef<ScrollView>(null);
    const fabTranslateY = useRef(new Animated.Value(0)).current;
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const feedQuery = useFeedQuery();
    const toggleLikeFeed = useToggleLikeFeedMutation();
    const toggleLikeArticle = useToggleLikeArticleMutation();
    const addCommentFeed = useAddCommentFeedMutation();
    const addCommentArticle = useAddCommentArticleMutation();

    const buckets = feedQuery.data ?? { posts: [], publications: [], myPosts: [] };
    const itemById = useMemo(() => {
        const map = new Map<string, FeedItem>();
        for (const item of [...buckets.posts, ...buckets.publications, ...buckets.myPosts]) {
            map.set(String(item.id), item);
        }
        return map;
    }, [buckets.posts, buckets.publications, buckets.myPosts]);

    // Each tab is driven by its own server bucket: Feed = public_feed,
    // Publications = publication, My Posts = my_publications.
    const feedPosts = useMemo<Post[]>(() => buckets.posts.map(feedItemToPost), [buckets.posts]);
    const feedPublications = useMemo<Article[]>(() => buckets.publications.map(feedItemToArticle), [buckets.publications]);
    const feedMyPosts = useMemo<Article[]>(() => buckets.myPosts.map(feedItemToArticle), [buckets.myPosts]);

    // Interactive state
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
    const [commentsDrawer, setCommentsDrawer] = useState<{ visible: boolean; postId: string; title: string; kind: 'feed' | 'article' }>({ visible: false, postId: '', title: '', kind: 'feed' });
    const [newComment, setNewComment] = useState('');
    const [viewPost, setViewPost] = useState<Post | null>(null);
    const [viewArticle, setViewArticle] = useState<Article | null>(null);
    const [showInlineComments, setShowInlineComments] = useState(false);

    const likeItem = useCallback((id: string, kind: 'feed' | 'article' | undefined) => {
        const resolved = kind ?? (itemById.get(id) && isArticleItem(itemById.get(id) as FeedItem) ? 'article' : 'feed');
        if (itemById.has(id)) {
            if (resolved === 'article') toggleLikeArticle.mutate(id); else toggleLikeFeed.mutate(id);
        }
    }, [itemById, toggleLikeArticle, toggleLikeFeed]);

    const toggleLike = useCallback((id: string) => {
        setLikedPosts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const submitComment = useCallback((id: string, kind: 'feed' | 'article') => {
        const text = newComment.trim();
        if (!text || !itemById.has(id)) return;
        const onSuccess = () => setNewComment('');
        if (kind === 'article') {
            addCommentArticle.mutate({ id, comment: text }, { onSuccess });
        } else {
            addCommentFeed.mutate({ id, comment: text }, { onSuccess });
        }
    }, [newComment, itemById, addCommentArticle, addCommentFeed]);

    const toggleBookmark = useCallback((id: string) => {
        setBookmarkedPosts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const onVerticalScroll = useCallback(() => {
        Animated.spring(fabTranslateY, { toValue: 100, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
        if (scrollTimer.current) clearTimeout(scrollTimer.current);
        scrollTimer.current = setTimeout(() => {
            Animated.spring(fabTranslateY, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 180 }).start();
        }, 300);
    }, []);

    const onTabPress = (index: number) => {
        setActiveTab(index);
        pagerRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: true });
    };

    const onPageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const idx = Math.round(x / SCREEN_WIDTH);
        if (idx !== activeTab && idx >= 0 && idx < TAB_LABELS.length) {
            setActiveTab(idx);
        }
    };

    const tabWidth = (SCREEN_WIDTH - 32) / 3;
    const indicatorLeft = scrollX.interpolate({
        inputRange: TAB_LABELS.map((_, i) => i * SCREEN_WIDTH),
        outputRange: TAB_LABELS.map((_, i) => i * tabWidth),
        extrapolate: 'clamp',
    });

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }} {...swipeHandlers}>
            <TabSlideIn>
                {/* Tab bar */}
                <View style={{ backgroundColor: AppColors.white, paddingTop: insets.top + 4, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <View style={{ flexDirection: 'row' }}>
                        {TAB_LABELS.map((tab, i) => {
                            const isActive = activeTab === i;
                            return (
                                <Pressable
                                    key={tab}
                                    onPress={() => onTabPress(i)}
                                    style={{ width: tabWidth, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                                >
                                    {i === 0 && <FeedTabIcon active={isActive} />}
                                    {i === 1 && <PubTabIcon active={isActive} />}
                                    {i === 2 && <MyPubTabIcon active={isActive} />}
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: isActive ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_400Regular',
                                            color: isActive ? AppColors.primary : '#9CA3AF',
                                        }}
                                        numberOfLines={1}
                                    >
                                        {tab}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    {/* Animated indicator */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 16,
                            width: tabWidth,
                            height: 2.5,
                            backgroundColor: AppColors.primary,
                            borderTopLeftRadius: 2,
                            borderTopRightRadius: 2,
                            transform: [{ translateX: indicatorLeft }],
                        }}
                    />
                </View>

                {/* Swipeable pages */}
                <Animated.ScrollView
                    ref={pagerRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false, listener: onPageScroll }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* ── TAB 1: FEED ── */}
                    <ScrollView
                        style={{ width: SCREEN_WIDTH }}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        onScroll={onVerticalScroll}
                        scrollEventThrottle={16}
                    >
                        {/* Search */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: AppColors.white,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    height: 42,
                                    paddingHorizontal: 14,
                                    gap: 10,
                                }}
                            >
                                <SearchIcon />
                                <RNTextInput
                                    placeholder="Search posts, topics..."
                                    placeholderTextColor="#9CA3AF"
                                    style={{ flex: 1, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}
                                />
                            </View>
                        </View>



                        {/* Posts */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
                            {feedQuery.isLoading && (
                                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                    <ActivityIndicator color={AppColors.primary} />
                                </View>
                            )}
                            {feedQuery.isError && !feedQuery.isLoading && (
                                <View style={{ paddingVertical: 24, alignItems: 'center', gap: 10 }}>
                                    <Text selectable style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#EF4444', textAlign: 'center' }}>
                                        Couldn&apos;t load the feed. {feedQuery.error instanceof Error ? feedQuery.error.message : ''}
                                    </Text>
                                    <Pressable onPress={() => feedQuery.refetch()} style={{ backgroundColor: AppColors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8 }}>
                                        <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Retry</Text>
                                    </Pressable>
                                </View>
                            )}
                            {!feedQuery.isLoading && !feedQuery.isError && feedPosts.length === 0 && (
                                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>No posts yet.</Text>
                                </View>
                            )}
                            {feedPosts.map((post) => (
                                <Pressable
                                    key={post.id}
                                    onPress={() => setViewPost(post)}
                                    style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 14,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        padding: 16,
                                    }}
                                >
                                    {/* Author row */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <AvatarCircle color={post.avatarColor} size={38} initials={getInitials(post.author)} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{post.author}</Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{post.specialty}</Text>
                                        </View>
                                        <Pressable hitSlop={8}>
                                            <MoreIcon />
                                        </Pressable>
                                    </View>
                                    {/* Content */}
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 20, marginTop: 12 }}>
                                        {post.content}
                                    </Text>
                                    {/* Engagement */}
                                    <EngagementRow
                                        likes={post.likes}
                                        comments={post.comments}
                                        timeAgo={post.timeAgo}
                                        liked={likedPosts.has('feed-' + post.id)}
                                        bookmarked={bookmarkedPosts.has('feed-' + post.id)}
                                        onLike={() => { toggleLike('feed-' + post.id); likeItem(post.id, post.kind); }}
                                        onBookmark={() => toggleBookmark('feed-' + post.id)}
                                        onComment={() => setCommentsDrawer({ visible: true, postId: post.id, title: post.author, kind: post.kind ?? 'feed' })}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>

                    {/* ── TAB 2: PUBLICATIONS ── */}
                    <ScrollView
                        style={{ width: SCREEN_WIDTH }}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        onScroll={onVerticalScroll}
                        scrollEventThrottle={16}
                    >
                        <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 10 }}>
                            {!feedQuery.isLoading && !feedQuery.isError && feedPublications.length === 0 && (
                                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>No publications yet.</Text>
                                </View>
                            )}
                            {feedPublications.map((article) => (
                                <Pressable
                                    key={article.id}
                                    onPress={() => setViewArticle(article)}
                                    style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 14,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        padding: 16,
                                    }}
                                >
                                    {/* Author */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <AvatarCircle color={article.avatarColor} size={34} initials={getInitials(article.author)} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{article.author}</Text>
                                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{article.specialty}</Text>
                                        </View>
                                        {article.readTime && (
                                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_500Medium', color: '#D1D5DB' }}>{article.readTime}</Text>
                                        )}
                                    </View>
                                    {/* Article title + optional image */}
                                    <View style={{ marginTop: 12 }}>
                                        {article.hasImage ? (
                                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 22 }}>
                                                        {article.title}
                                                    </Text>
                                                </View>
                                                <ArticleImage index={parseInt(article.id) - 1} />
                                            </View>
                                        ) : (
                                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 22 }}>
                                                {article.title}
                                            </Text>
                                        )}
                                    </View>
                                    {/* Snippet */}
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', lineHeight: 20, marginTop: 8 }} numberOfLines={2}>
                                        {article.content}
                                    </Text>
                                    {/* Engagement */}
                                    <EngagementRow
                                        likes={article.likes}
                                        comments={article.comments}
                                        timeAgo={article.timeAgo}
                                        liked={likedPosts.has('pub-' + article.id)}
                                        bookmarked={bookmarkedPosts.has('pub-' + article.id)}
                                        onLike={() => { toggleLike('pub-' + article.id); likeItem(article.id, article.kind); }}
                                        onBookmark={() => toggleBookmark('pub-' + article.id)}
                                        onComment={() => setCommentsDrawer({ visible: true, postId: article.id, title: article.title, kind: article.kind ?? 'article' })}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>

                    {/* ── TAB 3: MY POSTS ── */}
                    <ScrollView
                        style={{ width: SCREEN_WIDTH }}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        onScroll={onVerticalScroll}
                        scrollEventThrottle={16}
                    >
                        <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 10 }}>
                            {!feedQuery.isLoading && !feedQuery.isError && feedMyPosts.length === 0 && (
                                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>No posts yet.</Text>
                                </View>
                            )}
                            {feedMyPosts.map((article) => (
                                <Pressable
                                    key={article.id}
                                    onPress={() => setViewArticle(article)}
                                    style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 14,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        padding: 16,
                                    }}
                                >
                                    {/* Article title + image */}
                                    <View>
                                        {article.hasImage ? (
                                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 22 }}>
                                                        {article.title}
                                                    </Text>
                                                </View>
                                                <ArticleImage index={parseInt(article.id) - 1} />
                                            </View>
                                        ) : (
                                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 22 }}>
                                                {article.title}
                                            </Text>
                                        )}
                                    </View>
                                    {/* Content */}
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', lineHeight: 20, marginTop: 8 }} numberOfLines={2}>
                                        {article.content}
                                    </Text>
                                    {/* Read time tag */}
                                    {article.readTime && (
                                        <View style={{ marginTop: 8 }}>
                                            <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_500Medium', color: '#D1D5DB' }}>{article.readTime}</Text>
                                        </View>
                                    )}
                                    {/* Engagement with edit/delete */}
                                    <EngagementRow
                                        likes={article.likes}
                                        comments={article.comments}
                                        timeAgo={article.timeAgo}
                                        showEdit
                                        liked={likedPosts.has('my-' + article.id)}
                                        bookmarked={bookmarkedPosts.has('my-' + article.id)}
                                        onLike={() => { toggleLike('my-' + article.id); likeItem(article.id, article.kind); }}
                                        onBookmark={() => toggleBookmark('my-' + article.id)}
                                        onComment={() => setCommentsDrawer({ visible: true, postId: article.id, title: article.title, kind: article.kind ?? 'article' })}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>
                </Animated.ScrollView>

                {/* Write FAB — extended pill */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: insets.bottom + 16,
                        right: 20,
                        transform: [{ translateY: fabTranslateY }],
                    }}
                >
                    <Pressable
                        onPress={() => router.push('/(doctor)/create-article')}
                        style={({ pressed }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                            borderRadius: 16,
                            paddingLeft: 14,
                            paddingRight: 18,
                            height: 52,
                            gap: 8,
                            shadowColor: AppColors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 12,
                            elevation: 8,
                        })}
                    >
                        <PenIcon />
                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Write</Text>
                    </Pressable>
                </Animated.View>
            </TabSlideIn>

            {/* Comments Drawer */}
            <BottomDrawer
                visible={commentsDrawer.visible}
                onClose={() => { setCommentsDrawer({ visible: false, postId: '', title: '', kind: 'feed' }); setNewComment(''); }}
                title="Comments"
                subtitle={commentsDrawer.title}
                height={480}
            >
                <View style={{ flex: 1 }}>
                    {/* Comment list */}
                    {(() => {
                        const server = itemById.get(commentsDrawer.postId)?.comments ?? [];
                        if (server.length > 0) {
                            return server.map((c, i) => {
                                const author = feedCommentAuthor(c);
                                return (
                                    <View key={String(c.id ?? i)} style={{ flexDirection: 'row', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                        <AvatarCircle color={avatarColorFor(author)} size={32} initials={author.split(' ').map(w => w[0]).slice(0, 2).join('')} />
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{author}</Text>
                                                <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>{timeAgo(c.created_at)}</Text>
                                            </View>
                                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 19, marginTop: 3 }}>{feedCommentText(c)}</Text>
                                        </View>
                                    </View>
                                );
                            });
                        }
                        return (
                            <View style={{ alignItems: 'center', paddingVertical: 28, gap: 4 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF' }}>No comments yet</Text>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>Be the first to comment</Text>
                            </View>
                        );
                    })()}

                    {/* Comment input */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                        <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#F9FAFB',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            paddingHorizontal: 12,
                            height: 42,
                        }}>
                            <RNTextInput
                                placeholder="Write a comment..."
                                placeholderTextColor="#9CA3AF"
                                value={newComment}
                                onChangeText={setNewComment}
                                editable={!addCommentFeed.isPending && !addCommentArticle.isPending}
                                style={{ flex: 1, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}
                            />
                        </View>
                        <Pressable
                            onPress={() => submitComment(commentsDrawer.postId, commentsDrawer.kind)}
                            disabled={!newComment.trim() || addCommentFeed.isPending || addCommentArticle.isPending}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                backgroundColor: newComment.trim() ? AppColors.primary : '#E5E7EB',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {(addCommentFeed.isPending || addCommentArticle.isPending)
                                ? <ActivityIndicator size="small" color={AppColors.white} />
                                : <SendIcon />}
                        </Pressable>
                    </View>
                </View>
            </BottomDrawer>

            {/* Post Viewer Drawer */}
            <BottomDrawer
                visible={!!viewPost}
                onClose={() => { setViewPost(null); setShowInlineComments(false); setNewComment(''); }}
                title={viewPost?.author ?? ''}
                subtitle={viewPost?.specialty}
                height={showInlineComments ? 640 : 480}
            >
                {viewPost && (
                    <View style={{ flex: 1 }}>
                        {/* Author card */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <AvatarCircle color={viewPost.avatarColor} size={44} initials={getInitials(viewPost.author)} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>{viewPost.author}</Text>
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{viewPost.specialty}</Text>
                            </View>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>{viewPost.timeAgo}</Text>
                        </View>
                        {/* Full content */}
                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 24 }}>
                            {viewPost.content}
                        </Text>
                        {/* Stats */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                            <Pressable
                                onPress={() => { toggleLike('feed-' + viewPost.id); likeItem(viewPost.id, viewPost.kind); }}
                                style={({ pressed }) => ({
                                    flexDirection: 'row', alignItems: 'center', gap: 5,
                                    backgroundColor: likedPosts.has('feed-' + viewPost.id) ? '#FEF2F2' : (pressed ? '#F9FAFB' : 'transparent'),
                                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
                                })}
                            >
                                <HeartIcon filled={likedPosts.has('feed-' + viewPost.id)} />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: likedPosts.has('feed-' + viewPost.id) ? '#EF4444' : '#6B7280' }}>
                                    {viewPost.likes + (likedPosts.has('feed-' + viewPost.id) ? 1 : 0)}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setShowInlineComments(!showInlineComments)}
                                style={({ pressed }) => ({
                                    flexDirection: 'row', alignItems: 'center', gap: 5,
                                    backgroundColor: showInlineComments ? AppColors.primary + '0A' : (pressed ? '#F9FAFB' : 'transparent'),
                                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
                                })}
                            >
                                <CommentIcon />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: showInlineComments ? AppColors.primary : '#6B7280' }}>{viewPost.comments}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => toggleBookmark('feed-' + viewPost.id)}
                                style={({ pressed }) => ({
                                    backgroundColor: bookmarkedPosts.has('feed-' + viewPost.id) ? AppColors.primary + '0A' : (pressed ? '#F9FAFB' : 'transparent'),
                                    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 6,
                                })}
                            >
                                <BookmarkIcon filled={bookmarkedPosts.has('feed-' + viewPost.id)} />
                            </Pressable>
                        </View>
                        {/* Inline comments */}
                        {showInlineComments && (
                            <View style={{ marginTop: 14 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, marginBottom: 10 }}>Comments</Text>
                                {(viewPost.serverComments && viewPost.serverComments.length > 0
                                    ? viewPost.serverComments.map((c, i) => {
                                        const author = feedCommentAuthor(c);
                                        return (
                                            <View key={String(c.id ?? i)} style={{ flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                                <AvatarCircle color={avatarColorFor(author)} size={28} initials={author.split(' ').map(w => w[0]).slice(0, 2).join('')} />
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{author}</Text>
                                                        <Text style={{ fontSize: 9, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>{timeAgo(c.created_at)}</Text>
                                                    </View>
                                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 18, marginTop: 2 }}>{feedCommentText(c)}</Text>
                                                </View>
                                            </View>
                                        );
                                    })
                                    : (
                                        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 4 }}>
                                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF' }}>No comments yet</Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>Be the first to comment</Text>
                                        </View>
                                    )
                                )}
                                {/* Comment input */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                                    <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 38, justifyContent: 'center' }}>
                                        <RNTextInput
                                            placeholder="Write a comment..."
                                            placeholderTextColor="#9CA3AF"
                                            value={newComment}
                                            onChangeText={setNewComment}
                                            editable={!addCommentFeed.isPending && !addCommentArticle.isPending}
                                            style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}
                                        />
                                    </View>
                                    <Pressable
                                        onPress={() => submitComment(viewPost.id, viewPost.kind ?? 'feed')}
                                        disabled={!newComment.trim() || addCommentFeed.isPending || addCommentArticle.isPending}
                                        style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: newComment.trim() ? AppColors.primary : '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {(addCommentFeed.isPending || addCommentArticle.isPending) ? <ActivityIndicator size="small" color={AppColors.white} /> : <SendIcon />}
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </BottomDrawer>

            {/* Article/Publication Viewer Drawer */}
            <BottomDrawer
                visible={!!viewArticle}
                onClose={() => { setViewArticle(null); setShowInlineComments(false); setNewComment(''); }}
                title={viewArticle?.title ?? ''}
                subtitle={viewArticle?.author}
                height={showInlineComments ? 700 : 560}
            >
                {viewArticle && (
                    <View style={{ flex: 1 }}>
                        {/* Author + read time */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <AvatarCircle color={viewArticle.avatarColor} size={38} initials={getInitials(viewArticle.author)} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{viewArticle.author}</Text>
                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{viewArticle.specialty}</Text>
                            </View>
                            {viewArticle.readTime && (
                                <View style={{ backgroundColor: AppColors.primary + '0A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>{viewArticle.readTime}</Text>
                                </View>
                            )}
                        </View>
                        {/* Article image */}
                        {viewArticle.hasImage && (
                            <Image
                                source={PUBLICATION_IMAGES[(parseInt(viewArticle.id) - 1) % PUBLICATION_IMAGES.length]}
                                style={{ height: 180, borderRadius: 12, marginBottom: 16, width: '100%' }}
                                resizeMode="cover"
                            />
                        )}
                        {/* Title */}
                        <Text style={{ fontSize: 18, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 26, marginBottom: 12 }}>
                            {viewArticle.title}
                        </Text>
                        {/* Full content */}
                        <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 22 }}>
                            {viewArticle.content}
                        </Text>
                        {/* Stats */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                            <Pressable
                                onPress={() => { toggleLike('pub-' + viewArticle.id); likeItem(viewArticle.id, viewArticle.kind); }}
                                style={({ pressed }) => ({
                                    flexDirection: 'row', alignItems: 'center', gap: 5,
                                    backgroundColor: likedPosts.has('pub-' + viewArticle.id) ? '#FEF2F2' : (pressed ? '#F9FAFB' : 'transparent'),
                                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
                                })}
                            >
                                <HeartIcon filled={likedPosts.has('pub-' + viewArticle.id)} />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: likedPosts.has('pub-' + viewArticle.id) ? '#EF4444' : '#6B7280' }}>
                                    {viewArticle.likes + (likedPosts.has('pub-' + viewArticle.id) ? 1 : 0)}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setShowInlineComments(!showInlineComments)}
                                style={({ pressed }) => ({
                                    flexDirection: 'row', alignItems: 'center', gap: 5,
                                    backgroundColor: showInlineComments ? AppColors.primary + '0A' : (pressed ? '#F9FAFB' : 'transparent'),
                                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
                                })}
                            >
                                <CommentIcon />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: showInlineComments ? AppColors.primary : '#6B7280' }}>{viewArticle.comments}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => toggleBookmark('pub-' + viewArticle.id)}
                                style={({ pressed }) => ({
                                    backgroundColor: bookmarkedPosts.has('pub-' + viewArticle.id) ? AppColors.primary + '0A' : (pressed ? '#F9FAFB' : 'transparent'),
                                    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 6,
                                })}
                            >
                                <BookmarkIcon filled={bookmarkedPosts.has('pub-' + viewArticle.id)} />
                            </Pressable>
                        </View>
                        {/* Inline comments */}
                        {showInlineComments && (
                            <View style={{ marginTop: 14 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, marginBottom: 10 }}>Comments</Text>
                                {(viewArticle.serverComments && viewArticle.serverComments.length > 0
                                    ? viewArticle.serverComments.map((c, i) => {
                                        const author = feedCommentAuthor(c);
                                        return (
                                            <View key={String(c.id ?? i)} style={{ flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                                                <AvatarCircle color={avatarColorFor(author)} size={28} initials={author.split(' ').map(w => w[0]).slice(0, 2).join('')} />
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{author}</Text>
                                                        <Text style={{ fontSize: 9, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>{timeAgo(c.created_at)}</Text>
                                                    </View>
                                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 18, marginTop: 2 }}>{feedCommentText(c)}</Text>
                                                </View>
                                            </View>
                                        );
                                    })
                                    : (
                                        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 4 }}>
                                            <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF' }}>No comments yet</Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#D1D5DB' }}>Be the first to comment</Text>
                                        </View>
                                    )
                                )}
                                {/* Comment input */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                                    <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 38, justifyContent: 'center' }}>
                                        <RNTextInput
                                            placeholder="Write a comment..."
                                            placeholderTextColor="#9CA3AF"
                                            value={newComment}
                                            onChangeText={setNewComment}
                                            editable={!addCommentFeed.isPending && !addCommentArticle.isPending}
                                            style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}
                                        />
                                    </View>
                                    <Pressable
                                        onPress={() => submitComment(viewArticle.id, viewArticle.kind ?? 'article')}
                                        disabled={!newComment.trim() || addCommentFeed.isPending || addCommentArticle.isPending}
                                        style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: newComment.trim() ? AppColors.primary : '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {(addCommentFeed.isPending || addCommentArticle.isPending) ? <ActivityIndicator size="small" color={AppColors.white} /> : <SendIcon />}
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </BottomDrawer>
        </View>
    );
}
