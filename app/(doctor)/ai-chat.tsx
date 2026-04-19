import { useState, useRef, useEffect } from 'react';
import {
    View, Text, ScrollView, Pressable, TextInput as RNTextInput,
    Keyboard, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/theme';

/* ─── Icons ─── */
function BackIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 19l-7-7 7-7" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function SendIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function BotAvatarIcon() {
    return (
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M14 24h3l3-7 5 14 4-10 3 3h5" stroke={AppColors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
                        backgroundColor: AppColors.secondary,
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
    { label: '🧬  DNA Analysis', query: 'Run DNA analysis on the latest sample' },
    { label: '📁  Evidence Review', query: 'Review evidence for the current case' },
    { label: '📋  Case Summary', query: 'Give me a summary of the active case' },
    { label: '👤  Facial Recognition', query: 'Start facial recognition analysis' },
];

/* ─── Component ─── */
export default function AiChat() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { q } = useLocalSearchParams<{ q?: string }>();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
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

    /* ─── AI Bubble ─── */
    const AiBubble = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, maxWidth: '85%' }}>
            <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: AppColors.primary + '10',
                alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
            }}>
                <BotAvatarIcon />
            </View>
            <View style={{
                flex: 1,
                backgroundColor: AppColors.white,
                borderRadius: 16,
                borderTopLeftRadius: 4,
                borderLeftWidth: 3,
                borderLeftColor: AppColors.secondary,
                padding: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
            }}>
                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.textPrimary, lineHeight: 22 }}>
                    {text}
                </Text>
            </View>
        </View>
    );

    /* ─── User Bubble ─── */
    const UserBubble = ({ text }: { text: string }) => (
        <View style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
            <LinearGradient
                colors={[AppColors.primary, AppColors.primaryHover]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    borderRadius: 16,
                    borderTopRightRadius: 4,
                    padding: 14,
                }}
            >
                <Text style={{ fontSize: 14, fontFamily: 'IBMPlexSans_400Regular', color: AppColors.white, lineHeight: 22 }}>
                    {text}
                </Text>
            </LinearGradient>
        </View>
    );

    /* ─── Typing Bubble ─── */
    const TypingBubble = () => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: AppColors.primary + '10',
                alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
            }}>
                <BotAvatarIcon />
            </View>
            <View style={{
                backgroundColor: AppColors.white,
                borderRadius: 16,
                borderTopLeftRadius: 4,
                borderLeftWidth: 3,
                borderLeftColor: AppColors.secondary,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
            }}>
                <TypingDots />
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            {/* ─── Header ─── */}
            <LinearGradient
                colors={[AppColors.primary, AppColors.primaryHover]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    paddingTop: insets.top + 8,
                    gap: 14,
                }}
            >
                <Pressable onPress={() => router.back()} hitSlop={8}>
                    <BackIcon />
                </Pressable>

                {/* Bot avatar with gradient ring */}
                <View style={{
                    width: 40, height: 40, borderRadius: 20,
                    borderWidth: 2,
                    borderColor: AppColors.secondary,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                }}>
                    <Svg width={20} height={20} viewBox="0 0 48 48" fill="none">
                        <Path d="M14 24h3l3-7 5 14 4-10 3 3h5" stroke={AppColors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontFamily: 'IBMPlexSans_700Bold', color: AppColors.white }}>
                        Forensic AI
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                        <Text style={{ fontSize: 12, fontFamily: 'IBMPlexSans_400Regular', color: 'rgba(255,255,255,0.7)' }}>
                            Online
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ─── Messages ─── */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={{ padding: 20, paddingBottom: 8, gap: 16 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={scrollToEnd}
                >
                    {messages.map((msg) =>
                        msg.role === 'ai'
                            ? <AiBubble key={msg.id} text={msg.text} />
                            : <UserBubble key={msg.id} text={msg.text} />
                    )}

                    {isTyping && <TypingBubble />}

                    {/* Suggestion chips — show after greeting when no user messages yet */}
                    {messages.length === 1 && !isTyping && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 10, paddingLeft: 38, paddingTop: 4 }}
                        >
                            {SUGGESTIONS.map((s) => (
                                <Pressable
                                    key={s.label}
                                    onPress={() => sendMessage(s.query)}
                                    style={({ pressed }) => ({
                                        borderWidth: 1,
                                        borderColor: AppColors.primary,
                                        borderRadius: 20,
                                        paddingHorizontal: 16,
                                        paddingVertical: 9,
                                        backgroundColor: pressed ? AppColors.primary + '08' : 'transparent',
                                    })}
                                >
                                    <Text style={{ fontSize: 13, fontFamily: 'IBMPlexSans_500Medium', color: AppColors.primary }}>
                                        {s.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}
                </ScrollView>

                {/* ─── Input Bar ─── */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    paddingBottom: insets.bottom + 10,
                    backgroundColor: AppColors.white,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 4,
                    gap: 10,
                }}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F4F4F4',
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingHorizontal: 18,
                        height: 48,
                    }}>
                        <RNTextInput
                            ref={inputRef}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Ask about cases, evidence, analysis..."
                            placeholderTextColor="#9CA3AF"
                            style={{
                                flex: 1,
                                fontSize: 14,
                                fontFamily: 'IBMPlexSans_400Regular',
                                color: AppColors.textPrimary,
                                height: 46,
                                padding: 0,
                            }}
                            returnKeyType="send"
                            onSubmitEditing={() => sendMessage()}
                        />
                    </View>

                    {/* Gradient send button */}
                    <Pressable onPress={() => sendMessage()} style={{ overflow: 'hidden', borderRadius: 24 }}>
                        <LinearGradient
                            colors={['#4CC1E9', '#1E2A5E']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{
                                width: 48, height: 48, borderRadius: 24,
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <SendIcon />
                        </LinearGradient>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
