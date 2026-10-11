import { setDisclaimerAccepted } from '@/database/user';
import { useColors } from '@/hooks/use-colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DisclaimerProps {
  onAccept: () => void;
}

export default function Disclaimer({ onAccept }: DisclaimerProps) {
  const { colorScheme } = useColorScheme();
  const colors = useColors();
  const isDark = colorScheme === 'dark';

  const [isChecked, setIsChecked] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleCheckboxToggle = () => {
    // Light haptic feedback on toggle
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });

    const nextState = !isChecked;
    setIsChecked(nextState);

    // Spring animation for checkbox scale
    Animated.sequence([
      Animated.spring(checkboxScale, {
        toValue: 1.25,
        useNativeDriver: true,
        speed: 40,
        bounciness: 12,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
      }),
    ]).start();
  };

  const handleProceed = async () => {
    if (!isChecked || isExiting) return;

    setIsExiting(true);
    // Medium haptic feedback on proceed
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });

    // Save acceptance to database
    await setDisclaimerAccepted(true);

    // Button animation feedback
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Fade out overlay screen smoothly
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start(() => {
      onAccept();
    });
  };

  // Gradient Colors based on mode
  const gradientColors = isDark
    ? ['#1E2228', '#14161B', '#0B0C0E'] as const
    : ['#FFFFFF', '#F9F9F6', '#EEEEE8'] as const;

  return (
    <Animated.View style={[styles.absoluteContainer, { opacity: fadeAnim }]}>
      <LinearGradient colors={gradientColors} style={styles.gradientBg}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {/* Disclaimer Main Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderColor,
                },
              ]}
            >
              {/* Header Icon */}
              <View style={styles.iconContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isDark ? 'rgba(232, 144, 75, 0.12)' : 'rgba(75, 114, 232, 0.12)' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={40}
                    color={colors.accent}
                  />
                </View>
              </View>

              {/* Title */}
              <Text
                style={{ color: colors.textPrimary }}
                className="text-2xl font-bold text-center font-serif mb-4"
              >
                Disclaimer & Terms of Use
              </Text>

              {/* Scrollable text container */}
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
              >

                <View
                  style={{
                    borderLeftColor: colors.accent,
                    backgroundColor: `${colors.accent}0A`,
                  }}
                  className="border-l-[3px] pl-4 py-2.5 pr-2 rounded-r-lg mb-5"
                >
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                      fontStyle: 'italic'
                    }}
                    className="text-sm font-semibold text-center leading-[1.45rem]"
                  >
                    bhaktāmṛtaṁ viśva-janānumodanaṁ{"\n"}
                    sarvārtha-daṁ śrī-śaṭhakopa-vāṅmayam{"\n"}
                    sahasra-śākhopaniṣat-samāgamaṁ{"\n"}
                    namāmy ahaṁ drāviḍa-veda-sāgaram
                  </Text>

                  <View
                    style={{ backgroundColor: colors.borderColor }}
                    className="h-px w-16 my-3 self-center"
                  />

                  <Text
                    style={{
                      color: colors.textMuted,
                      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                      fontStyle: 'italic',
                    }}
                    className="text-sm leading-[1.375rem] text-justify"
                  >
                    I worship the vast Ocean of Drāviḍa Veda, which is the complete collection of the Upaniṣads with thousands of sections, taught by Śaṭhakopa. It is like nectar to those who love Bhagavān and gives equal joy to everyone—both the beings of the universe and the Supreme Lord, who grants all blessings.
                  </Text>

                  <Text
                    style={{
                      color: colors.textMuted,
                      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                      fontStyle: 'italic',
                    }}
                    className="text-[0.8125rem] text-right mt-1.5"
                  >
                    — Nāthamuni
                  </Text>
                </View>

                <Text
                  style={{
                    color: colors.textMuted,
                    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                  }}
                  className="text-sm leading-[1.375rem] text-justify mb-4"
                >
                  Welcome to <Text style={{ color: colors.accent }} className="font-bold">Prabandha Mālai</Text>, developed as a part of <Text style={{ color: colors.accent }} className="font-bold">NDVS (Namāmyahaṁ Drāviḍa Veda Sāgaram)</Text> project. Before you proceed to dive into the nectar of pāsurams, please read the following disclaimer and terms of use carefully.
                </Text>

                <View style={styles.sectionHeader}>
                  <Ionicons name="book-outline" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={{ color: colors.textPrimary }} className="text-[0.8125rem] font-bold uppercase tracking-wider font-serif">
                    Content & Interpretations
                  </Text>
                </View>
                <Text
                  style={{ color: colors.textMuted }}
                  className="text-[0.8125rem] leading-[1.25rem] text-justify mb-4"
                >
                  This application provides access to sacred texts, lyrics, translations, and historical commentaries (pāsuram, meanings, and histories). While we have made every effort to maintain the accuracy, authenticity, and preservation of these texts, please note that translations and commentaries are interpretive and intended for educational, devotional, and informational purposes. If you come across any discrepancies, please feel free to reach out to us. You can find the contact information in the <Text style={{ color: colors.accent }} className="font-bold">settings</Text> page. The content provided is for devotional purposes only and should not be used for any commercial purposes.
                </Text>

                <View style={styles.sectionHeader}>
                  <Ionicons name="heart-outline" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={{ color: colors.textPrimary }} className="text-[0.8125rem] font-bold uppercase tracking-wider font-serif">
                    Respectful Engagement
                  </Text>
                </View>
                <Text
                  style={{ color: colors.textMuted }}
                  className="text-[0.8125rem] leading-[1.25rem] text-justify mb-4"
                >
                  Due to the sacred and historical nature of these hymns, we request that all users engage with this application and its contents with respect, mindfulness, and proper intent.
                </Text>

                <View style={styles.sectionHeader}>
                  <Ionicons name="lock-closed-outline" size={16} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={{ color: colors.textPrimary }} className="text-[0.8125rem] font-bold uppercase tracking-wider font-serif">
                    Offline & Privacy First
                  </Text>
                </View>
                <Text
                  style={{ color: colors.textMuted }}
                  className="text-[0.8125rem] leading-[1.25rem] text-justify"
                >
                  Your privacy is fully protected. All data, settings, favorites, and usage histories are stored entirely offline on your local device. We do not collect, {"\n"}trace, or share any personal information.
                </Text>
              </ScrollView>
            </View>

            {/* Checkbox Agreement */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheckboxToggle}
              style={styles.checkboxContainer}
            >
              <Animated.View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isChecked ? colors.accent : colors.borderColor,
                    backgroundColor: isChecked ? colors.accent : 'transparent',
                    transform: [{ scale: checkboxScale }],
                  },
                ]}
              >
                {isChecked && (
                  <Ionicons name="checkmark" size={16} color={isDark ? '#181A1F' : '#FFFFFF'} />
                )}
              </Animated.View>
              <Text
                style={{ color: colors.textPrimary }}
                className="text-xs leading-4 font-medium flex-1 ml-3"
              >
                I have read and agree to the terms and respect guidelines.
              </Text>
            </TouchableOpacity>

            {/* Proceed Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
              <TouchableOpacity
                disabled={!isChecked || isExiting}
                onPress={handleProceed}
                activeOpacity={0.85}
                style={[
                  styles.button,
                  isChecked
                    ? { backgroundColor: colors.accent }
                    : { backgroundColor: isDark ? '#2C3540' : '#E5E7EB' },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: isChecked
                        ? (isDark ? '#181A1F' : '#FFFFFF')
                        : colors.textMuted,
                    },
                  ]}
                  className="font-bold tracking-wider"
                >
                  Proceed
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
  gradientBg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    width: '100%',
    maxHeight: '75%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    textTransform: 'uppercase',
  },
});
