import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppColors, Typography, Spacing } from '@/constants/theme';
import { useSwipeTabs } from '@/hooks/use-swipe-tabs';
import { TabSlideIn } from '@/components/tab-slide-in';
import { AppHeader } from '@/components/app-header';

/* ─── Icons ─── */
function AnalysisModelsIcon() {
    return (
        <Svg width={80} height={80} viewBox="0 0 56 56" fill="none">
            <Path d="M48.1247 15.7524V27.1277H40.2485V28.8762H48.1247V39.3772H49.8732V15.7524H48.1247ZM15.7497 27.1277H7.87549V15.7524H6.125V39.3772H7.87549V28.8762H15.7497V27.1277Z" fill="#6BAFFF" />
            <Path d="M27.9992 23.4801C21.2339 23.4801 15.7478 21.1943 15.7478 18.375V37.7709C15.7478 40.5902 21.2339 42.8741 27.9992 42.8741C34.7646 42.8741 40.2486 40.5882 40.2486 37.7709V18.375C40.2486 21.1943 34.7646 23.4781 27.9972 23.4781" fill="#1E2A5E" />
            <Path d="M27.9992 23.4792C34.7646 23.4792 40.2486 21.1933 40.2486 18.3761C40.2486 15.5588 34.7646 13.2729 27.9972 13.2729C21.2339 13.2729 15.7498 15.5588 15.7498 18.3761C15.7498 21.1933 21.2339 23.4792 27.9992 23.4792ZM27.9992 28.5844C20.6724 28.5844 15.7478 26.2082 15.7478 23.9925V26.1902C17.7329 28.2154 22.4109 29.605 27.9992 29.605C33.5875 29.605 38.2655 28.2154 40.2486 26.1902V23.9905C40.2486 26.2082 35.328 28.5844 27.9992 28.5844ZM27.9992 35.2194C20.6724 35.2194 15.7478 32.8433 15.7478 30.6256V32.8233C17.7329 34.8485 22.4109 36.2401 27.9992 36.2401C33.5875 36.2401 38.2655 34.8505 40.2486 32.8233V30.6256C40.2486 32.8433 35.326 35.2174 27.9972 35.2174" fill="#6BAFFF" />
            <Path d="M48.9979 44.9176C45.132 44.9176 42 43.6122 42 42.0001V53.0846C42 54.6947 45.132 56.0001 48.9979 56.0001C52.8639 56.0001 55.9979 54.6947 55.9979 53.0846V41.998C55.9979 43.6082 52.8639 44.9156 48.9999 44.9156" fill="#1E2A5E" />
            <Path d="M48.9979 44.9165C52.8639 44.9165 55.9979 43.6111 55.9979 41.999C55.9979 40.3889 52.8639 39.0835 48.9999 39.0835C45.136 39.0835 42 40.3889 42 41.999C42 43.6091 45.132 44.9165 48.9979 44.9165ZM48.9979 47.832C44.8112 47.832 42 46.4745 42 45.2053V46.4625C43.1329 47.6215 45.8058 48.4155 48.9979 48.4155C52.1901 48.4155 54.865 47.6215 55.9979 46.4625V45.2073C55.9979 46.4745 53.1827 47.832 48.9979 47.832ZM48.9979 51.6218C44.8112 51.6218 42 50.2663 42 48.997V50.2542C43.1329 51.4112 45.8058 52.2073 48.9979 52.2073C52.1901 52.2073 54.865 51.4112 55.9979 50.2542V48.997C55.9979 50.2663 53.1847 51.6238 48.9999 51.6238" fill="#6BAFFF" />
            <Path d="M48.9979 5.83401C45.132 5.83401 42 4.52865 42 2.9165V13.999C42 15.6112 45.132 16.9165 48.9979 16.9165C52.8639 16.9165 55.9979 15.6112 55.9979 13.999V2.9165C55.9979 4.52665 52.8618 5.83401 48.9979 5.83401Z" fill="#1E2A5E" />
            <Path d="M48.9979 5.83101C52.8639 5.83101 55.9979 4.52765 55.9979 2.9155C55.9979 1.30335 52.8639 0 48.9999 0C45.136 0 42 1.30335 42 2.9155C42 4.52765 45.132 5.83101 48.9979 5.83101ZM48.9979 8.75052C44.8112 8.75052 42 7.39303 42 6.12376V7.38099C43.1329 8.53797 45.8058 9.33202 48.9979 9.33202C52.1901 9.33202 54.865 8.53797 55.9979 7.38099V6.12376C55.9979 7.39303 53.1827 8.75052 48.9979 8.75052ZM48.9979 12.5403C44.8112 12.5403 42 11.1828 42 9.91552V11.1728C43.1329 12.3297 45.8058 13.1238 48.9979 13.1238C52.1901 13.1238 54.865 12.3297 55.9979 11.1728V9.91552C55.9979 11.1828 53.1827 12.5403 48.9979 12.5403Z" fill="#6BAFFF" />
            <Path d="M7.00014 44.9176C3.13423 44.9176 0.00219727 43.6122 0.00219727 42.0001V53.0846C0.00219727 54.6947 3.13423 56.0001 7.00014 56.0001C10.866 56.0001 14.0001 54.6947 14.0001 53.0846V41.998C14.0001 43.6082 10.866 44.9156 7.00214 44.9156" fill="#1E2A5E" />
            <Path d="M6.99994 44.9165C10.8659 44.9165 13.9999 43.6111 13.9999 41.999C13.9999 40.3889 10.8659 39.0835 7.00195 39.0835C3.13403 39.0835 0 40.3889 0 41.999C0 43.6091 3.13403 44.9165 6.99994 44.9165ZM6.99994 47.832C2.81321 47.832 0.00200404 46.4745 0.00200404 45.2053V46.4625C1.13491 47.6215 3.80776 48.4155 6.99994 48.4155C10.1921 48.4155 12.865 47.6215 13.9999 46.4625V45.2073C13.9999 46.4745 11.1867 47.832 7.00195 47.832M6.99994 51.6218C2.81321 51.6218 0.00200404 50.2663 0.00200404 48.997V50.2542C1.13491 51.4112 3.80776 52.2073 6.99994 52.2073C10.1921 52.2073 12.865 51.4112 13.9999 50.2542V48.997C13.9999 50.2663 11.1867 51.6238 7.00195 51.6238" fill="#6BAFFF" />
            <Path d="M7.00014 5.83401C3.13423 5.83401 0.00219727 4.52865 0.00219727 2.9165V13.999C0.00219727 15.6112 3.13423 16.9165 7.00014 16.9165C10.866 16.9165 14.0001 15.6112 14.0001 13.999V2.9165C14.0001 4.52665 10.866 5.83401 7.00214 5.83401" fill="#1E2A5E" />
            <Path d="M6.99994 5.83101C10.8659 5.83101 13.9999 4.52765 13.9999 2.9155C13.9999 1.30335 10.8659 0 7.00195 0C3.13403 0 0 1.30335 0 2.9155C0 4.52765 3.13403 5.83101 6.99994 5.83101ZM6.99994 8.75052C2.81321 8.75052 0.00200404 7.39303 0.00200404 6.12376V7.38099C1.13491 8.53797 3.80776 9.33202 6.99994 9.33202C10.1921 9.33202 12.865 8.53797 13.9999 7.38099V6.12376C13.9999 7.39303 11.1867 8.75052 7.00195 8.75052M6.99994 12.5403C2.81321 12.5403 0.00200404 11.1828 0.00200404 9.91552V11.1728C1.13491 12.3297 3.80776 13.1238 6.99994 13.1238C10.1921 13.1238 12.865 12.3297 13.9999 11.1728V9.91552C13.9999 11.1828 11.1867 12.5403 7.00195 12.5403" fill="#6BAFFF" />
        </Svg>
    );
}

function InvestigativeCasesIcon() {
    return (
        <Svg width={80} height={67} viewBox="0 0 67 56" fill="none">
            <Path d="M59.0738 0H38.8699L34.2582 9.22358H8.34448V46.1179H63.6856V0H59.0738ZM59.0738 41.0669H13.3955V13.8354H59.0738V41.0669ZM59.0738 9.22358H41.066L43.2621 4.61179H58.8542V9.22358H59.0738Z" fill="#7BADDB" />
            <Path d="M55.3411 18.0059H0L8.34509 46.1158H63.6862L55.3411 18.0059Z" fill="#7BADDB" />
            <Path d="M44.1845 9.88232V23.0567L32.7913 16.4684" fill="#B2CDE5" />
            <Path d="M55.5761 16.4684L44.1851 23.0567V9.88232" fill="#B2CDE5" />
            <Path d="M55.5761 16.4653V29.6441L44.1851 23.0536" fill="#4C89C3" />
            <Path d="M32.7913 16.4653V29.6441L44.1845 23.0536M44.1845 23.0536V36.2323L32.7913 29.6441" fill="#1E2A5E" />
            <Path d="M44.1894 23.0552L44.1851 36.2339L55.5761 29.65" fill="#4C89C3" />
            <Path d="M55.5761 29.6475V42.824L44.1851 36.2357" fill="#B2CDE5" />
            <Path d="M32.7913 29.6475V42.824L44.1845 36.2357" fill="#B2CDE5" />
            <Path d="M44.1845 36.2349V49.4114L32.7913 42.8231" fill="#4C89C3" />
            <Path d="M44.1894 36.2349L44.1851 49.4114L55.5761 42.8275" fill="#1E2A5E" />
            <Path d="M32.7919 29.6475V42.824L21.4009 36.2357" fill="#B2CDE5" />
            <Path d="M21.4009 36.2349V49.4114L32.7919 42.8231M32.7919 42.8231V55.9997L21.4009 49.4114" fill="#1E2A5E" />
            <Path d="M32.7957 42.8232L32.7913 55.9998L44.1845 49.4159" fill="#4C89C3" />
            <Path d="M66.9687 36.2401L55.5754 42.824L55.582 29.6475" fill="#B2CDE5" />
            <Path d="M66.9687 36.2349V49.4114L55.5754 42.8231" fill="#4C89C3" />
            <Path d="M55.5761 42.8232V55.9998L44.1851 49.4115" fill="#1E2A5E" />
            <Path d="M55.582 42.8232L55.5754 55.9998L66.9687 49.4159" fill="#4C89C3" />
        </Svg>
    );
}

/* ─── Component ─── */
export default function ExploreScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const swipeHandlers = useSwipeTabs(1);

    return (
        <View style={{ flex: 1, backgroundColor: AppColors.surface }} {...swipeHandlers}>
            <TabSlideIn>
                <ScrollView
                    contentContainerStyle={{
                        paddingTop: insets.top,
                        paddingBottom: insets.bottom + 100,
                    }}
                >
                    <AppHeader onBellPress={() => router.push('/(doctor)/(tabs)')} />

                    {/* Section Title */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, gap: 4 }}>
                        <Text style={{ ...Typography.h4, color: AppColors.textPrimary }}>
                            Explore Knowledge
                        </Text>
                        <Text style={{ ...Typography.bodySmall, color: '#6B7280' }}>
                            Excellence in Forensic Diagnostics & Intelligence
                        </Text>
                    </View>

                    {/* Cards */}
                    <View style={{ paddingHorizontal: Spacing.md, paddingTop: 20, gap: 16 }}>
                        {/* Analysis Models Card */}
                        <Pressable
                            onPress={() => router.push('/(doctor)/analysis-models' as any)}
                            style={({ pressed }) => ({
                                backgroundColor: AppColors.white,
                                borderRadius: 16,
                                borderCurve: 'continuous' as const,
                                padding: 28,
                                alignItems: 'center',
                                opacity: pressed ? 0.92 : 1,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 8,
                                elevation: 3,
                            })}
                        >
                            <AnalysisModelsIcon />
                            <Text style={{
                                fontSize: 18, fontFamily: 'IBMPlexSans_700Bold',
                                color: AppColors.textPrimary, marginTop: 16,
                            }}>
                                Analysis Models
                            </Text>
                            <Text style={{
                                fontSize: 13, fontFamily: 'IBMPlexSans_400Regular',
                                color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 19,
                            }}>
                                Forensic frameworks to simulate crime scenes and analyze case patterns.
                            </Text>
                        </Pressable>

                        {/* Investigative Cases Card */}
                        <Pressable
                            onPress={() => router.push('/(doctor)/investigative-cases' as any)}
                            style={({ pressed }) => ({
                                backgroundColor: AppColors.white,
                                borderRadius: 16,
                                borderCurve: 'continuous' as const,
                                padding: 28,
                                alignItems: 'center',
                                opacity: pressed ? 0.92 : 1,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.06,
                                shadowRadius: 8,
                                elevation: 3,
                            })}
                        >
                            <InvestigativeCasesIcon />
                            <Text style={{
                                fontSize: 18, fontFamily: 'IBMPlexSans_700Bold',
                                color: AppColors.textPrimary, marginTop: 16,
                            }}>
                                Investigative Cases
                            </Text>
                            <Text style={{
                                fontSize: 13, fontFamily: 'IBMPlexSans_400Regular',
                                color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 19,
                            }}>
                                Real-world files with reconstructions, evidence flow, and timelines.
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </TabSlideIn>
        </View>
    );
}
