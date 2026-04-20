import { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, Pressable, TextInput as RNTextInput,
    Keyboard, KeyboardAvoidingView, Platform, Animated, Dimensions, Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/theme';

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
                        backgroundColor: '#6366F1',
                        opacity: d,
                        transform: [{ scale: d }],
                    }}
                />
            ))}
        </View>
    );
}

/* ─── Data ─── */
interface Message { id: string; role: 'user' | 'ai'; text: string }

const GREETING = "Good morning, Dr. Khaled. I'm your forensic intelligence assistant. I can help with case analysis, DNA profiling, evidence chain-of-custody, facial recognition, and deepfake detection.\n\nHow can I assist you today?";

function generateAiResponse(msg: string): string {
    const l = msg.toLowerCase();
    if (l.includes('dna') || l.includes('sample') || l.includes('profil'))
        return 'Initiating STR profile lookup. The submitted sample (Reference: EV-2024-0847) shows a 13-locus match with 99.97% confidence. Chain-of-custody log verified — 3 transfers recorded.\n\nShall I generate the full comparison report?';
    if (l.includes('evidence') || l.includes('review'))
        return 'Evidence catalog updated. Current case FC-2024-112 contains 14 items across 3 categories:\n\n• Physical (7): Fingerprints, fibers, blood samples\n• Digital (4): Device images, metadata extracts\n• Documentary (3): Witness statements, scene reports\n\nWhich category would you like to review?';
    if (l.includes('case') || l.includes('summary'))
        return 'Case FC-2024-112 Summary:\n\n• Status: Active — Investigation Phase\n• Lead: Dr. Khaled\n• Evidence Items: 14 cataloged\n• Suspects: 2 persons of interest\n• Last Update: 2 hours ago\n\nPriority action: DNA cross-reference pending on Sample EV-0847. Shall I initiate?';
    if (l.includes('face') || l.includes('recognition') || l.includes('deepfake'))
        return 'Facial recognition engine ready. Model confidence threshold set at 92%. For optimal results, input images should be ≥720p with frontal orientation.\n\nLast scan (Case FC-2024-108) returned 2 matches above threshold. Run new analysis?';
    if (l.includes('help') || l.includes('what can'))
        return "I can assist with:\n\n• Case analysis & evidence review\n• DNA sample processing & STR profiling\n• Facial recognition & deepfake detection\n• Image reconstruction & enhancement\n• Chain-of-custody verification\n• Forensic report generation\n\nWhat would you like to explore?";
    return "I've reviewed the relevant case data. Based on available evidence patterns, I recommend a multi-modal analysis combining physical trace evidence with digital forensics. This approach has shown 94% accuracy in similar cases.\n\nShall I prepare a detailed protocol?";
}

const SUGGESTIONS = [
    { label: 'DNA Analysis', query: 'Run DNA analysis on the latest sample' },
    { label: 'Evidence Review', query: 'Review evidence for the current case' },
    { label: 'Case Summary', query: 'Give me a summary of the active case' },
    { label: 'Facial Recognition', query: 'Start facial recognition analysis' },
];

interface ChatThread { id: string; title: string; time: string; messages: Message[] }

const INITIAL_CHATS: ChatThread[] = [
    { id: 'p1', title: 'DNA analysis on Sample EV-0847', time: 'Yesterday', messages: [] },
    { id: 'p2', title: 'Case #2024-0892 evidence review', time: 'Yesterday', messages: [] },
    { id: 'p3', title: 'Facial recognition — Case #108', time: 'Dec 18', messages: [] },
    { id: 'p4', title: 'Deepfake detection results', time: 'Dec 18', messages: [] },
    { id: 'p5', title: 'Chain of custody verification', time: 'Dec 17', messages: [] },
];

/* ─── Component ─── */
export default function AiChat() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { q } = useLocalSearchParams<{ q?: string }>();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatThread[]>(INITIAL_CHATS);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<ScrollView>(null);
    const inputRef = useRef<RNTextInput>(null);

    useEffect(() => {
        const initial: Message[] = [{ id: '0', role: 'ai', text: GREETING }];
        if (q) {
            initial.push({ id: '1', role: 'user', text: q });
            // Simulate typing for the initial query response
            setMessages(initial);
            setIsTyping(true);
            const timer = setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, { id: '2', role: 'ai', text: generateAiResponse(q) }]);
            }, 800);
            return () => clearTimeout(timer);
        }
        setMessages(initial);
    }, []);

    const openDrawer = () => {
        setDrawerOpen(true);
        Animated.parallel([
            Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
            Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
    };

    const closeDrawer = () => {
        Animated.parallel([
            Animated.spring(drawerAnim, { toValue: -DRAWER_WIDTH, useNativeDriver: true, damping: 20, stiffness: 200 }),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            setDrawerOpen(false);
            setSearchQuery('');
        });
    };

    const saveCurrentChat = () => {
        // Only save if there are user messages (not just the greeting)
        const userMsgs = messages.filter(m => m.role === 'user');
        if (userMsgs.length > 0 && activeChatId) {
            setChatHistory(prev => prev.map(c =>
                c.id === activeChatId ? { ...c, messages: [...messages] } : c
            ));
        } else if (userMsgs.length > 0) {
            const title = userMsgs[0].text.slice(0, 50) + (userMsgs[0].text.length > 50 ? '...' : '');
            const newThread: ChatThread = {
                id: Date.now().toString(),
                title,
                time: 'Today',
                messages: [...messages],
            };
            setChatHistory(prev => [newThread, ...prev]);
        }
    };

    const newChat = () => {
        saveCurrentChat();
        closeDrawer();
        setMessages([{ id: '0', role: 'ai', text: GREETING }]);
        setInput('');
        setActiveChatId(null);
    };

    const loadChat = (chat: ChatThread) => {
        saveCurrentChat();
        closeDrawer();
        setActiveChatId(chat.id);
        if (chat.messages.length > 0) {
            setMessages(chat.messages);
        } else {
            setMessages([{ id: '0', role: 'ai', text: GREETING }]);
        }
        setInput('');
    };

    const filteredChats = chatHistory.filter(c =>
        !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sendMessage = (text?: string) => {
        const trimmed = (text ?? input).trim();
        if (!trimmed) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: generateAiResponse(trimmed) }]);
        }, 800);
    };

    const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = async (text: string, msgId: string) => {
        await Clipboard.setStringAsync(text);
        setCopiedId(msgId);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const retryLastMessage = () => {
        const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
        if (lastUserIdx === -1) return;
        const lastUser = messages[messages.length - 1 - lastUserIdx];
        // Remove last AI response and re-send
        setMessages(prev => prev.filter((_, i) => i < prev.length - 1));
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: generateAiResponse(lastUser.text) }]);
        }, 800);
    };

    /* ─── AI Bubble ─── */
    const AiBubble = ({ text, msgId, showActions }: { text: string; msgId: string; showActions?: boolean }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, maxWidth: '88%' }}>
            <View style={{
                width: 28, height: 28, borderRadius: 10,
                backgroundColor: '#6366F1' + '12',
                alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
            }}>
                <Ionicons name="sparkles" size={13} color="#6366F1" />
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
                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary, lineHeight: 20 }}>
                        {text}
                    </Text>
                </View>
                {showActions && (
                    <View style={{ flexDirection: 'row', gap: 12, paddingTop: 6, paddingLeft: 4 }}>
                        <Pressable
                            onPress={() => copyToClipboard(text, msgId)}
                            hitSlop={6}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                            <Ionicons name={copiedId === msgId ? 'checkmark' : 'copy-outline'} size={14} color="#9CA3AF" />
                            <Text style={{ fontSize: 11, fontFamily: 'IBMPlexSans_400Regular', color: '#9CA3AF' }}>
                                {copiedId === msgId ? 'Copied' : 'Copy'}
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
    const UserBubble = ({ text }: { text: string }) => (
        <View style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
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
                backgroundColor: '#6366F1' + '12',
                alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
            }}>
                <Ionicons name="sparkles" size={13} color="#6366F1" />
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

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }}>
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
                        <Ionicons name="sparkles" size={14} color="#6366F1" />
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
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 14 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={scrollToEnd}
                >
                    {messages.map((msg, idx) => {
                        const isLastAi = msg.role === 'ai' && !messages.slice(idx + 1).some(m => m.role === 'ai');
                        return msg.role === 'ai'
                            ? <AiBubble key={msg.id} text={msg.text} msgId={msg.id} showActions={isLastAi && !isTyping} />
                            : <UserBubble key={msg.id} text={msg.text} />;
                    })}

                    {isTyping && <TypingBubble />}

                    {/* Suggestion chips */}
                    {messages.length === 1 && !isTyping && (
                        <View style={{ gap: 8, paddingLeft: 38, paddingTop: 4 }}>
                            {SUGGESTIONS.map((s) => (
                                <Pressable
                                    key={s.label}
                                    onPress={() => sendMessage(s.query)}
                                    style={({ pressed }) => ({
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 8,
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        borderRadius: 10,
                                        backgroundColor: pressed ? '#F3F4F6' : AppColors.white,
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                    })}
                                >
                                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                                        <Path d="M5 12h14M12 5l7 7-7 7" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                    <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.textPrimary }}>
                                        {s.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </ScrollView>

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
                            backgroundColor: pressed ? '#4F46E5' : '#6366F1',
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
                                    <Ionicons name="sparkles" size={16} color="#6366F1" />
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
                                    backgroundColor: pressed ? '#4F46E5' : '#6366F1',
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
                                            <Ionicons name="chatbubble-outline" size={16} color={activeChatId === chat.id ? '#6366F1' : '#9CA3AF'} />
                                            <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, fontFamily: activeChatId === chat.id ? 'IBMPlexSans_500Medium' : 'IBMPlexSans_400Regular', color: activeChatId === chat.id ? '#6366F1' : AppColors.textPrimary }}>
                                                {chat.title}
                                            </Text>
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
        </View>
    );
}
