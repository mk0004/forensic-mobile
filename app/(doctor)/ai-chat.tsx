import { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, Pressable, TextInput as RNTextInput,
    Keyboard, KeyboardAvoidingView, Platform, Animated, Dimensions, Modal, PanResponder,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';
import { Linking } from 'react-native';
import {
    useConversationsQuery,
    useMessagesQuery,
    useSendMessageMutation,
    useDeleteConversationMutation,
    useRenameConversationMutation,
} from '@/lib/hooks/use-chat-api';
import {
    useActiveCasesQuery,
    useCaseDetailQuery,
    buildCaseContext,
    caseDisplayId,
} from '@/lib/hooks/use-cases-api';
import type { ChatConversation, ChatMessage, PubMedSource, TavilySource } from '@/types/api';
import { useAuth } from '@/lib/auth-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

/* ─── Icons ─── */
function SendIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

/* ─── Typing Dots ─── */
function TypingDots() {
    const d1 = useRef(new Animated.Value(0.3)).current;
    const d2 = useRef(new Animated.Value(0.3)).current;
    const d3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const make = (dot: Animated.Value, delay: number) =>
            Animated.loop(Animated.sequence([
                Animated.delay(delay),
                Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
            ]));
        Animated.parallel([make(d1, 0), make(d2, 150), make(d3, 300)]).start();
        return () => { d1.stopAnimation(); d2.stopAnimation(); d3.stopAnimation(); };
    }, []);

    return (
        <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 10, paddingHorizontal: 14 }}>
            {[d1, d2, d3].map((d, i) => (
                <Animated.View
                    key={i}
                    style={{
                        width: 7, height: 7, borderRadius: 3.5,
                        backgroundColor: AppColors.primary,
                        opacity: d,
                        transform: [{ scale: d }],
                    }}
                />
            ))}
        </View>
    );
}

/* ─── Data ─── */
interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    pubmedSources?: PubMedSource[];
    tavilySources?: TavilySource[];
    warnings?: string[];
    caseContextLabel?: string;
}

function timeOfDayGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

const SUGGESTIONS = [
    { label: 'Cause of death', query: 'What postmortem findings distinguish antemortem from postmortem injuries?' },
    { label: 'Time of death', query: 'How is time since death estimated from livor, rigor, and body temperature?' },
    { label: 'Asphyxia signs', query: 'What are the forensic signs of strangulation versus hanging?' },
    { label: 'Toxicology', query: 'How are postmortem drug redistribution effects interpreted in toxicology?' },
];

interface ChatThread { id: string; title: string; time: string; messages: Message[] }

function formatThreadTime(timestamp?: string): string {
    if (!timestamp) return '';
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return '';
    const now = new Date();
    const sameDay = parsed.toDateString() === now.toDateString();
    if (sameDay) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (parsed.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function conversationToThread(conv: ChatConversation): ChatThread {
    const title = conv.title?.trim() || conv.last_message?.trim() || `Conversation ${conv.id}`;
    return {
        id: String(conv.id),
        title,
        time: formatThreadTime(conv.updated_at ?? conv.created_at),
        messages: [],
    };
}

const DROPPED_SECTION_TITLES = ['pubmed sources', 'tavily', 'current-context sources', 'verification status'];

function cleanAnswer(raw: string): string {
    const lines = raw.replace(/\r/g, '').split('\n');
    const kept: string[] = [];
    let skipping = false;
    for (const line of lines) {
        const heading = line.match(/^#{1,3}\s+(.*)$/);
        if (heading) {
            const title = heading[1].trim().toLowerCase();
            skipping = DROPPED_SECTION_TITLES.some((t) => title.includes(t));
            if (skipping) {
                continue;
            }
        }
        if (!skipping) {
            kept.push(line);
        }
    }
    return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function chatMessageToMessage(msg: ChatMessage): Message {
    const senderValue = (msg.sender ?? msg.role ?? '').toLowerCase();
    const isUser = senderValue === 'user';
    const content = msg.content ?? '';
    const pubmedSources = msg.metadata?.pubmed_sources ?? [];
    const tavilySources = msg.metadata?.tavily_sources ?? [];
    let text = content;
    if (!isUser) {
        text = cleanAnswer(content);
        if (!text && (pubmedSources.length > 0 || tavilySources.length > 0)) {
            text = 'Here is the supporting evidence I found:';
        }
    }
    return {
        id: String(msg.id),
        role: isUser ? 'user' : 'ai',
        text,
        pubmedSources,
        tavilySources,
        warnings: msg.metadata?.warnings ?? [],
        caseContextLabel: msg.metadata?.case_context_label,
    };
}

function renderInlineBold(text: string, baseStyle: object, keyPrefix: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p.length > 0);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <Text key={`${keyPrefix}-b-${i}`} style={[baseStyle, { fontFamily: 'IBMPlexSans_600SemiBold' }]}>
                    {part.slice(2, -2)}
                </Text>
            );
        }
        return <Text key={`${keyPrefix}-t-${i}`} style={baseStyle}>{part}</Text>;
    });
}

function MarkdownText({ text }: { text: string }) {
    const base = { fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary, lineHeight: 20 };
    const lines = text.replace(/\r/g, '').split('\n');
    return (
        <View>
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed === '') {
                    return <View key={idx} style={{ height: 6 }} />;
                }
                if (trimmed.startsWith('### ')) {
                    return <Text key={idx} style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary, marginTop: 4 }}>{trimmed.slice(4)}</Text>;
                }
                if (trimmed.startsWith('## ')) {
                    return <Text key={idx} style={{ fontSize: 14, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, marginTop: 6, marginBottom: 2 }}>{trimmed.slice(3)}</Text>;
                }
                if (trimmed.startsWith('# ')) {
                    return <Text key={idx} style={{ fontSize: 16, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, marginTop: 6, marginBottom: 2 }}>{trimmed.slice(2)}</Text>;
                }
                if (/^[-*]\s+/.test(trimmed)) {
                    return (
                        <View key={idx} style={{ flexDirection: 'row', gap: 6, paddingVertical: 1 }}>
                            <Text style={[base, { color: AppColors.primary }]}>•</Text>
                            <Text style={[base, { flex: 1 }]}>{renderInlineBold(trimmed.replace(/^[-*]\s+/, ''), base, `li-${idx}`)}</Text>
                        </View>
                    );
                }
                return <Text key={idx} style={base}>{renderInlineBold(trimmed, base, `p-${idx}`)}</Text>;
            })}
        </View>
    );
}

function SourceLine({ accent, label, title, meta, url }: {
    accent: string; label: string; title: string; meta?: string; url?: string;
}) {
    const openUrl = () => { if (url) Linking.openURL(url); };
    return (
        <Pressable onPress={openUrl} disabled={!url} style={{ flexDirection: 'row', gap: 6, paddingVertical: 3 }}>
            <Text style={{ fontSize: 12, color: accent, fontFamily: 'IBMPlexSans_600SemiBold' }}>›</Text>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, lineHeight: 17 }}>
                    <Text style={{ fontFamily: 'IBMPlexSans_600SemiBold', color: accent }}>{label} </Text>
                    <Text style={{ fontFamily: 'IBMPlexSans_400Regular', color: url ? '#374151' : AppColors.textPrimary, textDecorationLine: url ? 'underline' : 'none' }}>{title}</Text>
                </Text>
                {!!meta && <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{meta}</Text>}
            </View>
        </Pressable>
    );
}

function pubmedMeta(source: PubMedSource): string | undefined {
    const authors = source.authors?.length
        ? `${source.authors.slice(0, 2).join(', ')}${source.authors.length > 2 ? ' et al.' : ''}`
        : undefined;
    return [authors, source.journal, source.publication_date].filter(Boolean).join(' · ') || undefined;
}

function tavilyHost(source: TavilySource): string | undefined {
    try { return source.url ? new URL(source.url).hostname.replace(/^www\./, '') : undefined; } catch { return undefined; }
}

/* ─── Component ─── */
export default function AiChat() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { q, caseId: caseIdParam } = useLocalSearchParams<{ q?: string; caseId?: string }>();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [contextCaseId, setContextCaseId] = useState<string | null>(caseIdParam ?? null);
    const [casePickerOpen, setCasePickerOpen] = useState(false);

    const { user, refreshUser } = useAuth();

    useEffect(() => {
        refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const conversationsQuery = useConversationsQuery();
    const messagesQuery = useMessagesQuery(activeChatId);
    const sendMessage_mutation = useSendMessageMutation();
    const deleteConversation = useDeleteConversationMutation();
    const renameConversation = useRenameConversationMutation();
    const isTyping = sendMessage_mutation.isPending;
    const [switchingChat, setSwitchingChat] = useState(false);
    const [menuChat, setMenuChat] = useState<ChatThread | null>(null);
    const [renameTarget, setRenameTarget] = useState<ChatThread | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<ChatThread | null>(null);
    const isLoadingThread = switchingChat && messages.length === 0;

    const contextCaseQuery = useCaseDetailQuery(contextCaseId ?? undefined);
    const activeCasesQuery = useActiveCasesQuery();
    const contextCase = contextCaseQuery.data;
    const caseContext = contextCase ? buildCaseContext(contextCase) : undefined;

    const chatHistory: ChatThread[] = (conversationsQuery.data ?? []).map(conversationToThread);
    const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<ScrollView>(null);
    const inputRef = useRef<RNTextInput>(null);

    const sentInitialRef = useRef(false);
    const loadingExistingRef = useRef(false);
    const caseContextReadyForAutoSend = !contextCaseId || !contextCaseQuery.isLoading;
    useEffect(() => {
        if (q && !sentInitialRef.current && caseContextReadyForAutoSend) {
            sentInitialRef.current = true;
            sendMessage(q);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [caseContextReadyForAutoSend]);

    useEffect(() => {
        if (!activeChatId || !loadingExistingRef.current) return;
        if (messagesQuery.isError) {
            loadingExistingRef.current = false;
            setSwitchingChat(false);
            return;
        }
        const data = messagesQuery.data;
        if (!data) return;
        loadingExistingRef.current = false;
        setMessages(data.map(chatMessageToMessage));
        setSwitchingChat(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messagesQuery.data, messagesQuery.isError, activeChatId]);

    const openDrawer = () => {
        setDrawerOpen(true);
        Animated.parallel([
            Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
            Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
    };

    const closeDrawer = () => {
        Animated.parallel([
            Animated.timing(drawerAnim, { toValue: -DRAWER_WIDTH, duration: 180, useNativeDriver: true }),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            setDrawerOpen(false);
            setSearchQuery('');
        });
    };

    const edgeSwipe = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_evt, g) => g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
            onPanResponderGrant: () => {
                setDrawerOpen(true);
                overlayOpacity.setValue(0);
            },
            onPanResponderMove: (_evt, g) => {
                const x = Math.min(0, -DRAWER_WIDTH + Math.max(0, g.dx));
                drawerAnim.setValue(x);
                overlayOpacity.setValue(Math.min(1, Math.max(0, g.dx) / DRAWER_WIDTH));
            },
            onPanResponderRelease: (_evt, g) => {
                const shouldOpen = g.dx > DRAWER_WIDTH * 0.35 || g.vx > 0.4;
                if (shouldOpen) {
                    Animated.parallel([
                        Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
                        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                    ]).start();
                } else {
                    Animated.parallel([
                        Animated.timing(drawerAnim, { toValue: -DRAWER_WIDTH, duration: 160, useNativeDriver: true }),
                        Animated.timing(overlayOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
                    ]).start(() => setDrawerOpen(false));
                }
            },
        }),
    ).current;

    const newChat = () => {
        closeDrawer();
        sendMessage_mutation.reset();
        sentInitialRef.current = false;
        setSwitchingChat(false);
        setMessages([]);
        setInput('');
        setActiveChatId(null);
    };

    const loadChat = (chat: ChatThread) => {
        if (chat.id === activeChatId) {
            closeDrawer();
            return;
        }
        closeDrawer();
        sendMessage_mutation.reset();
        loadingExistingRef.current = true;
        setSwitchingChat(true);
        setActiveChatId(chat.id);
        setMessages([]);
        setInput('');
    };

    const filteredChats = chatHistory.filter(c =>
        !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteChat = () => {
        const chat = deleteTarget;
        if (!chat) {
            return;
        }
        setDeleteTarget(null);
        deleteConversation.mutate(chat.id, {
            onSuccess: () => {
                if (activeChatId === chat.id) {
                    setActiveChatId(null);
                    setMessages([]);
                    setSwitchingChat(false);
                }
            },
        });
    };

    const submitRename = () => {
        const target = renameTarget;
        const title = renameValue.trim();
        if (!target || !title) {
            return;
        }
        renameConversation.mutate({ id: target.id, title });
        setRenameTarget(null);
        setRenameValue('');
    };

    const caseContextLabel = contextCase ? `${caseDisplayId(contextCase.id)} · ${contextCase.name}` : undefined;

    const dispatchSend = (trimmed: string) => {
        sendMessage_mutation.mutate(
            { query: trimmed, conversationId: activeChatId, caseContext, caseContextLabel },
            {
                onSuccess: (result) => {
                    const cleaned = cleanAnswer(result.reply);
                    const hasSources = result.pubmedSources.length > 0 || result.tavilySources.length > 0;
                    const reply = cleaned
                        || (hasSources
                            ? 'Here is the supporting evidence I found:'
                            : "I couldn't generate a response. Please try again.");
                    setMessages(prev => [...prev, {
                        id: `${Date.now() + 1}`,
                        role: 'ai',
                        text: reply,
                        pubmedSources: result.pubmedSources,
                        tavilySources: result.tavilySources,
                        warnings: result.warnings,
                    }]);
                    if (result.conversationId !== undefined && !activeChatId) {
                        setActiveChatId(String(result.conversationId));
                    }
                },
                onError: (err) => {
                    const text = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
                    setMessages(prev => [...prev, { id: `${Date.now() + 1}`, role: 'ai', text: `⚠️ ${text}` }]);
                },
            },
        );
    };

    const sendMessage = (text?: string) => {
        const trimmed = (text ?? input).trim();
        if (!trimmed || sendMessage_mutation.isPending) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmed, caseContextLabel };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        dispatchSend(trimmed);
    };

    const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = async (text: string, msgId: string) => {
        await Clipboard.setStringAsync(text);
        setCopiedId(msgId);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const retryLastMessage = () => {
        if (sendMessage_mutation.isPending) return;
        const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
        if (lastUserIdx === -1) return;
        const lastUser = messages[messages.length - 1 - lastUserIdx];
        setMessages(prev => prev.filter((_, i) => i < prev.length - 1));
        dispatchSend(lastUser.text);
    };

    /* ─── AI Bubble ─── */
    const AiBubble = ({ msg, showActions }: { msg: Message; showActions?: boolean }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, maxWidth: '92%' }}>
            <View style={{
                width: 28, height: 28, borderRadius: 10,
                backgroundColor: AppColors.primary + '12',
                alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
            }}>
                <Ionicons name="sparkles" size={13} color="#1E2A5E" />
            </View>
            <View style={{ flex: 1 }}>
                <View style={{
                    backgroundColor: AppColors.white,
                    borderRadius: 14,
                    borderTopLeftRadius: 4,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                }}>
                    <MarkdownText text={msg.text} />

                    {!!msg.pubmedSources?.length && (
                        <View style={{ paddingTop: 8, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary, letterSpacing: 0.5, marginBottom: 2 }}>
                                PubMed Sources
                            </Text>
                            {msg.pubmedSources.map((s, i) => (
                                <SourceLine
                                    key={s.pmid ?? i}
                                    accent="#1E2A5E"
                                    label={s.pmid ? `PMID ${s.pmid}` : 'PubMed'}
                                    title={s.title ?? 'Untitled study'}
                                    meta={pubmedMeta(s)}
                                    url={s.url}
                                />
                            ))}
                        </View>
                    )}

                    {!!msg.tavilySources?.length && (
                        <View style={{ paddingTop: 8, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: '#0EA5E9', letterSpacing: 0.5, marginBottom: 2 }}>
                                Web Sources
                            </Text>
                            {msg.tavilySources.map((s, i) => (
                                <SourceLine
                                    key={s.url ?? i}
                                    accent="#0EA5E9"
                                    label="Web"
                                    title={s.title ?? 'Web result'}
                                    meta={tavilyHost(s)}
                                    url={s.url}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {!!msg.warnings?.length && (
                    <View style={{ paddingTop: 8, gap: 4 }}>
                        {msg.warnings.map((w, i) => (
                            <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start', backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8 }}>
                                <Ionicons name="warning-outline" size={13} color="#92400E" style={{ marginTop: 1 }} />
                                <Text style={{ flex: 1, fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#92400E', lineHeight: 16 }}>{w}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {showActions && (
                    <View style={{ flexDirection: 'row', gap: 12, paddingTop: 6, paddingLeft: 4 }}>
                        <Pressable
                            onPress={() => copyToClipboard(msg.text, msg.id)}
                            hitSlop={6}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                            <Ionicons name={copiedId === msg.id ? 'checkmark' : 'copy-outline'} size={14} color="#9CA3AF" />
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                {copiedId === msg.id ? 'Copied' : 'Copy'}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={retryLastMessage}
                            hitSlop={6}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                            <Ionicons name="refresh" size={14} color="#9CA3AF" />
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>Retry</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );

    /* ─── User Bubble ─── */
    const UserBubble = ({ text, contextLabel }: { text: string; contextLabel?: string }) => (
        <View style={{ alignSelf: 'flex-end', maxWidth: '82%', gap: 4, alignItems: 'flex-end' }}>
            {!!contextLabel && (
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: AppColors.secondary + '22',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                }}>
                    <Ionicons name="folder-outline" size={11} color={AppColors.primary} />
                    <Text style={{ fontSize: 10, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }} numberOfLines={1}>
                        {contextLabel}
                    </Text>
                </View>
            )}
            <View style={{
                backgroundColor: AppColors.primary,
                borderRadius: 14,
                borderTopRightRadius: 4,
                padding: 12,
            }}>
                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.white, lineHeight: 20 }}>
                    {text}
                </Text>
            </View>
        </View>
    );

    /* ─── Typing Bubble ─── */
    const TypingBubble = () => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{
                width: 28, height: 28, borderRadius: 10,
                backgroundColor: AppColors.primary + '12',
                alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
            }}>
                <Ionicons name="sparkles" size={13} color="#1E2A5E" />
            </View>
            <View style={{
                backgroundColor: AppColors.white,
                borderRadius: 14,
                borderTopLeftRadius: 4,
                borderWidth: 1,
                borderColor: '#E5E7EB',
            }}>
                <TypingDots />
            </View>
        </View>
    );

    const ChatSkeleton = () => {
        const shimmer = useRef(new Animated.Value(0.4)).current;
        useEffect(() => {
            const loop = Animated.loop(Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0.4, duration: 700, useNativeDriver: true }),
            ]));
            loop.start();
            return () => loop.stop();
        }, [shimmer]);

        const Bar = ({ width, height = 12 }: { width: number | string; height?: number }) => (
            <Animated.View style={{ width: width as any, height, borderRadius: 6, backgroundColor: '#E5E7EB', opacity: shimmer }} />
        );

        const AiSkeleton = () => (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, maxWidth: '92%' }}>
                <Animated.View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: '#E5E7EB', opacity: shimmer }} />
                <View style={{ flex: 1, backgroundColor: AppColors.white, borderRadius: 14, borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, gap: 8 }}>
                    <Bar width="90%" />
                    <Bar width="75%" />
                    <Bar width="60%" />
                </View>
            </View>
        );

        const UserSkeleton = () => (
            <View style={{ alignSelf: 'flex-end', maxWidth: '70%' }}>
                <View style={{ backgroundColor: AppColors.primary + '22', borderRadius: 14, borderTopRightRadius: 4, padding: 12, gap: 8, minWidth: 140 }}>
                    <Bar width="80%" />
                    <Bar width="55%" />
                </View>
            </View>
        );

        return (
            <View style={{ padding: 16, gap: 14 }}>
                <UserSkeleton />
                <AiSkeleton />
                <UserSkeleton />
                <AiSkeleton />
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
            {/* Left-edge swipe zone to open the drawer */}
            <View
                {...edgeSwipe.panHandlers}
                pointerEvents={drawerOpen ? 'none' : 'auto'}
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 24, zIndex: 40 }}
            />

            {/* ─── Header ─── */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                paddingTop: insets.top + 8,
                backgroundColor: AppColors.white,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
            }}>
                <Pressable onPress={openDrawer} hitSlop={8} style={{ marginRight: 14 }}>
                    <Ionicons name="menu" size={22} color={AppColors.textPrimary} />
                </Pressable>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="sparkles" size={14} color="#1E2A5E" />
                        <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                            Forensic AI
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <Pressable onPress={newChat} hitSlop={8}>
                        <Ionicons name="create-outline" size={20} color={AppColors.textPrimary} />
                    </Pressable>
                    <Pressable hitSlop={8}>
                        <Ionicons name="ellipsis-horizontal" size={20} color={AppColors.textPrimary} />
                    </Pressable>
                </View>
            </View>

            {/* ─── Messages ─── */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {isLoadingThread ? (
                    <ScrollView
                        contentContainerStyle={{ paddingVertical: 8 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <ChatSkeleton />
                    </ScrollView>
                ) : messages.length === 0 && !isTyping && !activeChatId ? (
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 36 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <LinearGradient
                            colors={[AppColors.primary, AppColors.primaryHover]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                borderRadius: 26,
                                padding: 24,
                                marginBottom: 26,
                                overflow: 'hidden',
                                shadowColor: AppColors.primary,
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.25,
                                shadowRadius: 20,
                                elevation: 8,
                            }}
                        >
                            <View style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: AppColors.secondary + '24' }} />
                            <View style={{ position: 'absolute', bottom: -50, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: AppColors.secondary + '14' }} />

                            <View style={{
                                width: 54,
                                height: 54,
                                borderRadius: 16,
                                backgroundColor: AppColors.secondary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                                shadowColor: AppColors.secondary,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.4,
                                shadowRadius: 12,
                                elevation: 6,
                            }}>
                                <Ionicons name="sparkles" size={26} color={AppColors.primary} />
                            </View>

                            <Text style={{ fontSize: 25, lineHeight: 31, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.white, letterSpacing: -0.5 }}>
                                {timeOfDayGreeting()}{user?.name?.trim() ? `,\n${user.name.replace(/\s+/g, ' ').trim()}` : ''}
                            </Text>
                            <Text style={{ fontSize: 13.5, lineHeight: 21, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.white + 'CC', marginTop: 10, maxWidth: 320 }}>
                                I&apos;m your forensic medicine assistant. Ask a clinical or medico-legal question — I answer with evidence from PubMed and live web sources.
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 }}>
                                <Ionicons name="shield-checkmark" size={14} color={AppColors.secondary} />
                                <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.white + 'B3', letterSpacing: 0.2 }}>
                                    Evidence-based · PubMed + Web
                                </Text>
                            </View>
                        </LinearGradient>

                        <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.primary + '99', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 }}>
                            TRY ASKING
                        </Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {SUGGESTIONS.map((s, i) => {
                                const meta: Record<string, keyof typeof Ionicons.glyphMap> = {
                                    'Cause of death': 'body-outline',
                                    'Time of death': 'time-outline',
                                    'Asphyxia signs': 'pulse-outline',
                                    'Toxicology': 'flask-outline',
                                };
                                const icon = meta[s.label] ?? 'medical-outline';
                                const accent = i % 2 === 0 ? AppColors.primary : AppColors.secondary;
                                return (
                                    <Pressable
                                        key={s.label}
                                        onPress={() => sendMessage(s.query)}
                                        style={({ pressed }) => ({
                                            width: '47.8%',
                                            flexGrow: 1,
                                            borderRadius: 18,
                                            paddingVertical: 16,
                                            paddingHorizontal: 14,
                                            backgroundColor: pressed ? AppColors.surface : AppColors.white,
                                            borderWidth: 1,
                                            borderColor: pressed ? accent : AppColors.primary + '14',
                                            transform: [{ scale: pressed ? 0.97 : 1 }],
                                            shadowColor: AppColors.primary,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.07,
                                            shadowRadius: 10,
                                            elevation: 2,
                                        })}
                                    >
                                        <View style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 13,
                                            backgroundColor: accent + '14',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 12,
                                        }}>
                                            <Ionicons name={icon} size={21} color={accent} />
                                        </View>
                                        <Text style={{ fontSize: 14, lineHeight: 18, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>
                                            {s.label}
                                        </Text>
                                        <Text style={{ fontSize: 11, lineHeight: 15, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.primary + '80', marginTop: 4 }} numberOfLines={2}>
                                            {s.query}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>
                ) : (
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 14 }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={scrollToEnd}
                    >
                        {messages.map((msg, idx) => {
                            const isLastAi = msg.role === 'ai' && !messages.slice(idx + 1).some(m => m.role === 'ai');
                            return msg.role === 'ai'
                                ? <AiBubble key={msg.id} msg={msg} showActions={isLastAi && !isTyping} />
                                : <UserBubble key={msg.id} text={msg.text} contextLabel={msg.caseContextLabel} />;
                        })}

                        {isTyping && <TypingBubble />}
                    </ScrollView>
                )}

                {/* ─── Case Context Bar ─── */}
                <View style={{ paddingHorizontal: 14, paddingTop: 6 }}>
                    {contextCaseId ? (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            alignSelf: 'flex-start',
                            backgroundColor: AppColors.primary + '12',
                            borderRadius: 8,
                            paddingLeft: 10,
                            paddingRight: 6,
                            paddingVertical: 5,
                        }}>
                            <Ionicons name="folder-outline" size={13} color="#1E2A5E" />
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.primary }}>
                                {contextCase ? `${caseDisplayId(contextCase.id)} · ${contextCase.name}` : `Loading ${caseDisplayId(contextCaseId)}…`}
                            </Text>
                            <Pressable onPress={() => setContextCaseId(null)} hitSlop={6} style={{ padding: 2 }}>
                                <Ionicons name="close" size={13} color="#1E2A5E" />
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => setCasePickerOpen(true)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 4 }}
                        >
                            <Ionicons name="add-circle-outline" size={15} color="#9CA3AF" />
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_500Medium', color: '#9CA3AF' }}>Attach case context</Text>
                        </Pressable>
                    )}
                </View>

                {/* ─── Input Bar ─── */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    paddingBottom: insets.bottom + 8,
                    backgroundColor: AppColors.white,
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    gap: 8,
                }}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: AppColors.surface,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 14,
                        height: 44,
                    }}>
                        <RNTextInput
                            ref={inputRef}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Ask about cases, evidence..."
                            placeholderTextColor="#9CA3AF"
                            style={{
                                flex: 1,
                                fontSize: 13,
                                fontFamily: 'IBMPlexSans_400Regular',
                                color: AppColors.textPrimary,
                                height: 42,
                                padding: 0,
                            }}
                            returnKeyType="send"
                            onSubmitEditing={() => sendMessage()}
                        />
                    </View>

                    <Pressable
                        onPress={() => sendMessage()}
                        style={({ pressed }) => ({
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: pressed ? '#3C4F92' : AppColors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        })}
                    >
                        <SendIcon />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>

            {/* ─── Sidebar Drawer ─── */}
            {drawerOpen && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
                    <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', opacity: overlayOpacity }}>
                        <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
                    </Animated.View>

                    <Animated.View style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: DRAWER_WIDTH,
                        backgroundColor: AppColors.white,
                        transform: [{ translateX: drawerAnim }],
                        paddingTop: insets.top + 12,
                    }}>
                        {/* Drawer header */}
                        <View style={{ paddingHorizontal: 16, paddingBottom: 14, gap: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="sparkles" size={16} color="#1E2A5E" />
                                    <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Chats</Text>
                                </View>
                                <Pressable onPress={closeDrawer} hitSlop={8}>
                                    <Ionicons name="close" size={20} color="#9CA3AF" />
                                </Pressable>
                            </View>

                            {/* New chat button */}
                            <Pressable
                                onPress={newChat}
                                style={({ pressed }) => ({
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: pressed ? '#3C4F92' : AppColors.primary,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
                                })}
                            >
                                <Ionicons name="add" size={18} color="#FFF" />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#FFF' }}>New Chat</Text>
                            </Pressable>

                            {/* Search */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: AppColors.surface,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                paddingHorizontal: 10,
                                height: 38,
                                gap: 8,
                            }}>
                                <Ionicons name="search" size={16} color="#9CA3AF" />
                                <RNTextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Search chats..."
                                    placeholderTextColor="#9CA3AF"
                                    style={{
                                        flex: 1,
                                        fontSize: 13,
                                        fontFamily: 'IBMPlexSans_400Regular',
                                        color: AppColors.textPrimary,
                                        height: 36,
                                        padding: 0,
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ height: 1, backgroundColor: '#E5E7EB' }} />

                        {/* Chat history */}
                        <ScrollView contentContainerStyle={{ padding: 8 }} showsVerticalScrollIndicator={false}>
                            {filteredChats.map((chat, idx) => {
                                const prevTime = idx > 0 ? filteredChats[idx - 1].time : null;
                                const showHeader = chat.time !== prevTime;
                                return (
                                    <View key={chat.id}>
                                        {showHeader && (
                                            <Text style={{
                                                fontSize: 11,
                                                fontFamily: 'IBMPlexSans_600SemiBold',
                                                color: '#9CA3AF',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                paddingHorizontal: 8,
                                                paddingTop: idx > 0 ? 14 : 6,
                                                paddingBottom: 6,
                                            }}>
                                                {chat.time}
                                            </Text>
                                        )}
                                        <Pressable
                                            onPress={() => loadChat(chat)}
                                            style={({ pressed }) => ({
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 10,
                                                paddingVertical: 10,
                                                paddingHorizontal: 8,
                                                borderRadius: 8,
                                                backgroundColor: activeChatId === chat.id ? '#EEF2FF' : pressed ? '#F3F4F6' : 'transparent',
                                            })}
                                        >
                                            <Ionicons name="chatbubble-outline" size={16} color={activeChatId === chat.id ? AppColors.primary : '#9CA3AF'} />
                                            <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, fontFamily: activeChatId === chat.id ? 'IBMPlexSans_500Medium' : 'IBMPlexSans_400Regular', color: activeChatId === chat.id ? AppColors.primary : AppColors.textPrimary }}>
                                                {chat.title}
                                            </Text>
                                            <Pressable onPress={() => setMenuChat(chat)} hitSlop={8} style={{ padding: 4 }}>
                                                <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
                                            </Pressable>
                                        </Pressable>
                                    </View>
                                );
                            })}
                        </ScrollView>

                        {/* Drawer footer */}
                        <View style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            paddingBottom: insets.bottom + 12,
                            borderTopWidth: 1,
                            borderTopColor: '#E5E7EB',
                        }}>
                            <Pressable
                                onPress={() => { closeDrawer(); router.back(); }}
                                style={({ pressed }) => ({
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    paddingVertical: 8,
                                    opacity: pressed ? 0.6 : 1,
                                })}
                            >
                                <Ionicons name="arrow-back" size={18} color="#9CA3AF" />
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: '#9CA3AF' }}>Back to Dashboard</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            )}

            {/* ─── Chat actions menu ─── */}
            <Modal visible={!!menuChat} transparent animationType="fade" onRequestClose={() => setMenuChat(null)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }} onPress={() => setMenuChat(null)}>
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={{ backgroundColor: AppColors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8, paddingBottom: insets.bottom + 12, paddingHorizontal: 8 }}
                    >
                        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' }} />
                        </View>
                        <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: 'IBMPlexSans_600SemiBold', color: '#9CA3AF', paddingHorizontal: 12, paddingVertical: 8 }}>
                            {menuChat?.title}
                        </Text>
                        <Pressable
                            onPress={() => {
                                const c = menuChat;
                                setMenuChat(null);
                                if (c) { setRenameTarget(c); setRenameValue(c.title); }
                            }}
                            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, backgroundColor: pressed ? '#F3F4F6' : 'transparent' })}
                        >
                            <Ionicons name="create-outline" size={20} color={AppColors.textPrimary} />
                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>Rename</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                const c = menuChat;
                                setMenuChat(null);
                                if (c) { setDeleteTarget(c); }
                            }}
                            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, backgroundColor: pressed ? AppColors.error + '12' : 'transparent' })}
                        >
                            <Ionicons name="trash-outline" size={20} color={AppColors.error} />
                            <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.error }}>Delete</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ─── Rename chat ─── */}
            <Modal visible={!!renameTarget} transparent animationType="fade" onRequestClose={() => setRenameTarget(null)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 }} onPress={() => setRenameTarget(null)}>
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={{ backgroundColor: AppColors.white, borderRadius: 16, padding: 18, gap: 14 }}
                    >
                        <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary }}>Rename chat</Text>
                        <RNTextInput
                            value={renameValue}
                            onChangeText={setRenameValue}
                            placeholder="Chat title"
                            placeholderTextColor="#9CA3AF"
                            autoFocus
                            style={{ height: 46, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary }}
                        />
                        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
                            <Pressable onPress={() => setRenameTarget(null)} style={({ pressed }) => ({ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: pressed ? '#F3F4F6' : 'transparent' })}>
                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={submitRename} disabled={!renameValue.trim()} style={({ pressed }) => ({ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: !renameValue.trim() ? '#D1D5DB' : pressed ? AppColors.primaryHover : AppColors.primary })}>
                                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Save</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ─── Delete confirmation ─── */}
            <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 }} onPress={() => setDeleteTarget(null)}>
                    <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: AppColors.white, borderRadius: 16, padding: 20, gap: 8, alignItems: 'center' }}>
                        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: AppColors.error + '14', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                            <Ionicons name="trash-outline" size={24} color={AppColors.error} />
                        </View>
                        <Text style={{ fontSize: 17, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, textAlign: 'center' }}>Delete chat?</Text>
                        <Text numberOfLines={2} style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', textAlign: 'center', lineHeight: 19 }}>
                            “{deleteTarget?.title}” and all its messages will be permanently removed.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, width: '100%' }}>
                            <Pressable onPress={() => setDeleteTarget(null)} style={({ pressed }) => ({ flex: 1, height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#F3F4F6' : AppColors.white })}>
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleDeleteChat} style={({ pressed }) => ({ flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? '#B91C1C' : AppColors.error })}>
                                <Text style={{ fontSize: 15, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.white }}>Delete</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ─── Case Picker ─── */}
            <Modal visible={casePickerOpen} transparent animationType="slide" onRequestClose={() => setCasePickerOpen(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }} onPress={() => setCasePickerOpen(false)}>
                    <Pressable
                        style={{
                            backgroundColor: AppColors.white,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            paddingTop: 16,
                            paddingBottom: insets.bottom + 16,
                            paddingHorizontal: 16,
                            maxHeight: '70%',
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={{ fontSize: 16, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.textPrimary, marginBottom: 4 }}>
                            Attach Case Context
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: '#6B7280', marginBottom: 14 }}>
                            The assistant will use the case details and evidence to answer.
                        </Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {(activeCasesQuery.data ?? []).length === 0 ? (
                                <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF', textAlign: 'center', paddingVertical: 24 }}>
                                    No active cases to attach.
                                </Text>
                            ) : (
                                (activeCasesQuery.data ?? []).map((c) => (
                                    <Pressable
                                        key={c.id}
                                        onPress={() => { setContextCaseId(String(c.id)); setCasePickerOpen(false); }}
                                        style={({ pressed }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: 14,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: String(c.id) === contextCaseId ? AppColors.primary : '#E5E7EB',
                                            backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                            marginBottom: 8,
                                        })}
                                    >
                                        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: AppColors.primary + '10', alignItems: 'center', justifyContent: 'center' }}>
                                            <Ionicons name="folder-outline" size={17} color="#1E2A5E" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_600SemiBold', color: AppColors.textPrimary }} numberOfLines={1}>{c.name}</Text>
                                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>{caseDisplayId(c.id)}</Text>
                                        </View>
                                        {String(c.id) === contextCaseId && <Ionicons name="checkmark-circle" size={18} color="#1E2A5E" />}
                                    </Pressable>
                                ))
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
