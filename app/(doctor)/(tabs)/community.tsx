import { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Dimensions, NativeSyntheticEvent, NativeScrollEvent, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useSwipeTabs } from '@/hooks/use-swipe-tabs';
import { TabSlideIn } from '@/components/tab-slide-in';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Icons ---
function SearchIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function HeartIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function CommentIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function EyeIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={12} r={3} stroke="#6B7280" strokeWidth={1.5} />
        </Svg>
    );
}

function ClockIcon() {
    return (
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} stroke="#9CA3AF" strokeWidth={1.5} />
            <Path d="M12 6v6l4 2" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
    );
}

function ShareIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx={18} cy={5} r={3} stroke="#6B7280" strokeWidth={1.5} />
            <Circle cx={6} cy={12} r={3} stroke="#6B7280" strokeWidth={1.5} />
            <Circle cx={18} cy={19} r={3} stroke="#6B7280" strokeWidth={1.5} />
            <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#6B7280" strokeWidth={1.5} />
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
            <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function TrendIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M23 6l-9.5 9.5-5-5L1 18" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 6h6v6" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

// Tab icons
function PublicFeedIcon({ active }: { active: boolean }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={active ? AppColors.primary : '#6B7280'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={9} cy={7} r={4} stroke={active ? AppColors.primary : '#6B7280'} strokeWidth={1.5} />
            <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={active ? AppColors.primary : '#6B7280'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function PublicationsIcon({ active }: { active: boolean }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Rect x={2} y={3} width={20} height={14} rx={2} stroke={active ? AppColors.primary : '#6B7280'} strokeWidth={1.5} />
            <Path d="M8 21h8M12 17v4" stroke={active ? AppColors.primary : '#6B7280'} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
    );
}

function MyPubIcon({ active }: { active: boolean }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={active ? AppColors.primary : '#6B7280'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={active ? AppColors.primary : '#6B7280'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function PenIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

// --- Data ---
const tabs = ['PUBLIC FEED', 'PUBLICATIONS', 'MY PUBLICATIONS'];

interface Post {
    id: string;
    author: string;
    specialty: string;
    avatarColor: string;
    content: string;
    likes: number;
    comments: number;
    views: number;
    timeAgo: string;
}

const publicPosts: Post[] = [
    { id: '1', author: 'Dr. Sarah Chen', specialty: 'Forensic Pathologist', avatarColor: '#D4A574', content: 'New research on post-mortem interval estimation using entomology. Our team has successfully reduced the margin of error by 15% using advanced microscopy techniques.', likes: 234, comments: 45, views: 1240, timeAgo: '2 hours ago' },
    { id: '2', author: 'Prof. Lili Ross', specialty: 'DNA Analysis Expert', avatarColor: '#8B6F5C', content: 'Important update on DNA contamination prevention protocols. Every forensic lab should review their current procedures.', likes: 189, comments: 32, views: 980, timeAgo: '5 hours ago' },
    { id: '3', author: 'Dr. Emily Watson', specialty: 'Toxicology Specialist', avatarColor: '#A0522D', content: 'Sharing a comprehensive guide on detecting novel synthetic opioids in biological samples. Link to full paper in comments.', likes: 156, comments: 28, views: 756, timeAgo: '1 day ago' },
    { id: '4', author: 'Dr. James Miller', specialty: 'Crime Scene Investigator', avatarColor: '#6B8E8E', content: 'Case study: How we solved a 10-year-old cold case using advanced digital forensics and DNA phenotyping.', likes: 298, comments: 67, views: 1580, timeAgo: '2 days ago' },
];

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
    views: number;
    timeAgo: string;
}

const publications: Article[] = [
    { id: '1', author: 'Dr. James Miller', specialty: 'Crime Scene Investigator', avatarColor: '#6B8E8E', title: 'Next-Gen Sequencing (NGS): Advancements in Fragmented DNA Recovery.', content: 'New research on post-mortem interval estimation using entomology. Our team has successfully reduced the margin of error by 15% using advanced microscopy techniques.', hasImage: true, likes: 234, comments: 45, views: 1240, timeAgo: '2 hours ago' },
    { id: '2', author: 'Dr. James Miller', specialty: 'Crime Scene Investigator', avatarColor: '#6B8E8E', title: 'Microbial Forensics: Utilizing Skin Microbiome for Individual Identification', content: 'New research on post-mortem interval estimation using entomology. Our team has successfully reduced the margin of error by 15% using advanced microscopy techniques.', hasImage: false, likes: 189, comments: 32, views: 980, timeAgo: '5 hours ago' },
    { id: '3', author: 'Dr. James Miller', specialty: 'Crime Scene Investigator', avatarColor: '#6B8E8E', title: 'Epigenetic Clock: Estimating Chronological Age from Biological Samples.', content: 'Sharing a comprehensive guide on detecting novel synthetic opioids in biological samples. Link to full paper in comments.', hasImage: false, likes: 156, comments: 28, views: 756, timeAgo: '1 day ago' },
    { id: '4', author: 'Dr. James Miller', specialty: 'Crime Scene Investigator', avatarColor: '#6B8E8E', title: 'Advanced Serology: Differentiating Menstrual vs. Peripheral Blood in Crime Scenes.', content: 'Case study: How we solved a 10-year-old cold case using advanced digital forensics and DNA phenotyping.', hasImage: true, likes: 298, comments: 67, views: 1580, timeAgo: '2 days ago' },
];

const myPublications: Article[] = [
    { id: '1', author: 'Dr. Mohammed sakr', specialty: 'Forensic Scientist', avatarColor: '#4682B4', title: 'Toxicological Anomalies: Identifying Rare Synthetic Opioids in Post-Mortem Samples.', content: 'New research on post-mortem interval estimation using entomology. Our team has successfully reduced the margin of error by 15% using advanced microscopy techniques.', hasImage: true, likes: 234, comments: 45, views: 1240, timeAgo: '2 hours ago' },
    { id: '2', author: 'Dr. Mohammed sakr', specialty: 'Forensic Scientist', avatarColor: '#4682B4', title: 'Microbial Forensics: Utilizing Skin Microbiome for Individual Identification', content: 'Important update on DNA contamination prevention protocols. Every forensic lab should review their current procedures.', hasImage: false, likes: 234, comments: 45, views: 1240, timeAgo: '2 hours ago' },
];

const trendingTopics = ['#DNA Analysis', '#Toxicology Updates', '#Crime Scene Protocol', '#Digital Forensics'];

// --- Components ---
function EngagementRow({ likes, comments, views, timeAgo, showShare = true, showEdit = false }: { likes: number; comments: number; views: number; timeAgo: string; showShare?: boolean; showEdit?: boolean }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <HeartIcon />
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>{likes}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <CommentIcon />
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>{comments}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <EyeIcon />
                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280' }}>{views.toLocaleString()}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {showEdit && (
                    <>
                        <Pressable hitSlop={8}><EditIcon /></Pressable>
                        <Pressable hitSlop={8}><TrashIcon /></Pressable>
                    </>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ClockIcon />
                    <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{timeAgo}</Text>
                </View>
                {showShare && (
                    <Pressable hitSlop={8}><ShareIcon /></Pressable>
                )}
            </View>
        </View>
    );
}

function AvatarCircle({ color, size = 40 }: { color: string; size?: number }) {
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    );
}

function ImagePlaceholder() {
    return (
        <View style={{ width: 100, height: 80, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={3} width={18} height={18} rx={2} stroke="#9CA3AF" strokeWidth={1.5} />
                <Path d="M3 16l5-5 4 4 3-3 6 6" stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        </View>
    );
}

// --- Main ---
export default function CommunityScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const swipeHandlers = useSwipeTabs(2);
    const [activeTab, setActiveTab] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const pagerRef = useRef<ScrollView>(null);
    const fabTranslateY = useRef(new Animated.Value(0)).current;
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onVerticalScroll = useCallback(() => {
        // Hide FAB
        Animated.spring(fabTranslateY, { toValue: 100, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
        // Reset show timer
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
        if (idx !== activeTab && idx >= 0 && idx < tabs.length) {
            setActiveTab(idx);
        }
    };

    const tabWidth = (SCREEN_WIDTH - 32) / 3;
    const indicatorLeft = scrollX.interpolate({
        inputRange: tabs.map((_, i) => i * SCREEN_WIDTH),
        outputRange: tabs.map((_, i) => i * tabWidth),
        extrapolate: 'clamp',
    });

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }} {...swipeHandlers}>
            <TabSlideIn>
                {/* Tab bar */}
                <View style={{ backgroundColor: AppColors.white, paddingTop: insets.top + 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <View style={{ flexDirection: 'row' }}>
                        {tabs.map((tab, i) => {
                            const isActive = activeTab === i;
                            return (
                                <Pressable
                                    key={tab}
                                    onPress={() => onTabPress(i)}
                                    style={{ width: tabWidth, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}
                                >
                                    {i === 0 && <PublicFeedIcon active={isActive} />}
                                    {i === 1 && <PublicationsIcon active={isActive} />}
                                    {i === 2 && <MyPubIcon active={isActive} />}
                                    <Text
                                        style={{
                                            fontSize: 9,
                                            fontFamily: isActive ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_400Regular',
                                            color: isActive ? AppColors.primary : '#6B7280',
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
                    {/* --- TAB 1: PUBLIC FEED --- */}
                    <ScrollView
                        style={{ width: SCREEN_WIDTH }}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
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
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    height: 44,
                                    paddingHorizontal: 14,
                                    gap: 8,
                                }}
                            >
                                <SearchIcon />
                                <RNTextInput
                                    placeholder="Search posts, topics, or keywords..."
                                    placeholderTextColor="#9CA3AF"
                                    style={{ flex: 1, fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}
                                />
                            </View>
                        </View>

                        {/* Trending topics */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 10 }}>
                                <TrendIcon />
                                <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Trending</Text>
                            </View>
                            {trendingTopics.map((topic) => (
                                <Pressable
                                    key={topic}
                                    style={{
                                        backgroundColor: AppColors.primary + '10',
                                        borderRadius: 20,
                                        paddingHorizontal: 14,
                                        paddingVertical: 6,
                                        marginRight: 6,
                                    }}
                                >
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>{topic}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        {/* Posts */}
                        <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
                            {publicPosts.map((post) => (
                                <View
                                    key={post.id}
                                    style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 14,
                                        borderCurve: 'continuous',
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        padding: 16,
                                    }}
                                >
                                    {/* Author */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <AvatarCircle color={post.avatarColor} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{post.author}</Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{post.specialty}</Text>
                                        </View>
                                    </View>
                                    {/* Content */}
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 20, marginTop: 12 }}>
                                        {post.content}
                                    </Text>
                                    {/* Engagement */}
                                    <EngagementRow likes={post.likes} comments={post.comments} views={post.views} timeAgo={post.timeAgo} />
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* --- TAB 2: PUBLICATIONS --- */}
                    <ScrollView
                        style={{ width: SCREEN_WIDTH }}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        onScroll={onVerticalScroll}
                        scrollEventThrottle={16}
                    >
                        <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
                            {publications.map((article) => (
                                <View
                                    key={article.id}
                                    style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 14,
                                        borderCurve: 'continuous',
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        padding: 16,
                                    }}
                                >
                                    {/* Author */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <AvatarCircle color={article.avatarColor} size={36} />
                                        <View>
                                            <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>{article.author}</Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{article.specialty}</Text>
                                        </View>
                                    </View>
                                    {/* Article title + image */}
                                    {article.hasImage ? (
                                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                            <ImagePlaceholder />
                                            <Text style={{ flex: 1, fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 22 }}>
                                                {article.title}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 22, marginTop: 12 }}>
                                            {article.title}
                                        </Text>
                                    )}
                                    {/* Content */}
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 20, marginTop: 8 }} numberOfLines={3}>
                                        {article.content}
                                    </Text>
                                    {/* Engagement */}
                                    <EngagementRow likes={article.likes} comments={article.comments} views={article.views} timeAgo={article.timeAgo} />
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* --- TAB 3: MY PUBLICATIONS --- */}
                    <ScrollView
                        style={{ width: SCREEN_WIDTH }}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        onScroll={onVerticalScroll}
                        scrollEventThrottle={16}
                    >
                        <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
                            {myPublications.map((article) => (
                                <View
                                    key={article.id}
                                    style={{
                                        backgroundColor: AppColors.white,
                                        borderRadius: 14,
                                        borderCurve: 'continuous',
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                        padding: 16,
                                    }}
                                >
                                    {/* Article title + image */}
                                    {article.hasImage ? (
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <ImagePlaceholder />
                                            <Text style={{ flex: 1, fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 22 }}>
                                                {article.title}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, lineHeight: 22 }}>
                                            {article.title}
                                        </Text>
                                    )}
                                    {/* Content */}
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#374151', lineHeight: 20, marginTop: 8 }} numberOfLines={3}>
                                        {article.content}
                                    </Text>
                                    {/* Engagement with edit/delete */}
                                    <EngagementRow likes={article.likes} comments={article.comments} views={article.views} timeAgo={article.timeAgo} showShare={false} showEdit />
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </Animated.ScrollView>

                {/* Write FAB */}
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
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: pressed ? AppColors.primaryHover : AppColors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                            elevation: 6,
                            boxShadow: '0 4px 12px rgba(30, 42, 94, 0.3)',
                        })}
                    >
                        <PenIcon />
                    </Pressable>
                </Animated.View>
            </TabSlideIn>
        </View>
    );
}
