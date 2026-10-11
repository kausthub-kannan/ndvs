import { useLanguage } from '@/context/language-context';
import { getAdjacentPasuramIds, getPasuramById, toggleBookmark } from '@/database/prabhandham';
import { AdjacentPasuramIds, PasuramDetail } from '@/database/utils/db';
import { useColors } from '@/hooks/use-colors';
import { parseBoldText } from '@/utils/parse-bold';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlowHeart } from '@/components/glow-heart';
import { SectionBlock } from '@/components/section-block';
type Adjacent = AdjacentPasuramIds;

const SCREEN_W = Dimensions.get('window').width;


const splitTags = (val: string | null | undefined) => {
  if (!val) return [];
  return val.split(',').map((s) => s.trim()).filter(Boolean);
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PasuramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const colors = useColors();

  const [pasuram, setPasuram] = useState<PasuramDetail | null>(null);
  const [adjacent, setAdjacent] = useState<Adjacent>({ prevId: null, nextId: null });
  const [loading, setLoading] = useState(true);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  // Generation counter: each navigation increments this; stale callbacks bail out early
  const navGenRef = useRef(0);
  // Tracks which ID was already loaded by navigateTo to skip the useEffect re-fetch
  const loadedIdRef = useRef<number | null>(null);
  // Keep adjacent in a ref so the PanResponder closure always sees the latest value
  const adjacentRef = useRef<Adjacent>({ prevId: null, nextId: null });
  adjacentRef.current = adjacent;

  const loadPasuram = useCallback(async (pasuramId: number) => {
    setLoading(true);
    try {
      const [row, adj] = await Promise.all([
        getPasuramById(pasuramId),
        getAdjacentPasuramIds(pasuramId),
      ]);
      setPasuram(row as PasuramDetail);
      setAdjacent(adj as Adjacent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    // Skip re-fetch if navigateTo already loaded this pasuram
    if (loadedIdRef.current === numId) return;
    loadPasuram(numId);
  }, [id, loadPasuram]);

  /**
   * direction:  1 → slide left  (Next: exit left,  enter from right)
   *            -1 → slide right (Prev: exit right, enter from left)
   *
   * Interruptible: each call cancels any in-flight animation so rapid taps
   * feel instant with no lockout period.
   */
  const navigateTo = useCallback(
    (targetId: number | null, direction: 1 | -1) => {
      if (!targetId) return;

      // Claim this navigation — any older async continuation will see a stale gen and bail
      navGenRef.current += 1;
      const myGen = navGenRef.current;

      // Stop whatever animation is running and snap instantly to the exit position
      slideAnim.stopAnimation();
      slideAnim.setValue(direction * -SCREEN_W);

      // Position incoming content off-screen on the opposite side
      // We do a tiny delay so RN flushes the setValue before we start the spring
      slideAnim.setValue(direction * SCREEN_W);
      scrollRef.current?.scrollTo({ y: 0, animated: false });

      // Mark so useEffect won't re-fetch
      loadedIdRef.current = targetId;

      // Fetch new data, then spring in
      loadPasuram(targetId).then(() => {
        if (navGenRef.current !== myGen) return; // superseded by a newer tap
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 18,
          bounciness: 4,
        }).start(({ finished }) => {
          if (finished && navGenRef.current === myGen) {
            router.setParams({ id: String(targetId) });
          }
        });
      });
    },
    [slideAnim, loadPasuram, router]
  );

  const handleBookmarkToggle = useCallback(async () => {
    if (!pasuram) return;
    const newVal = await toggleBookmark(pasuram.id, pasuram.bookmark);
    setPasuram((prev) => (prev ? { ...prev, bookmark: newVal } : prev));
  }, [pasuram]);

  // ─── Swipe gesture ─────────────────────────────────────────────────────────
  const SWIPE_THRESHOLD = 30; // px
  const panResponder = useRef(
    PanResponder.create({
      // Only intercept if horizontal movement clearly dominates
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 12,
      onMoveShouldSetPanResponderCapture: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 12,
      onPanResponderRelease: (_, { dx }) => {
        const { prevId, nextId } = adjacentRef.current;
        if (dx < -SWIPE_THRESHOLD && nextId) {
          // Swiped left → Next
          navigateTo(nextId, 1);
        } else if (dx > SWIPE_THRESHOLD && prevId) {
          // Swiped right → Prev
          navigateTo(prevId, -1);
        }
      },
    })
  ).current;

  if (!pasuram && loading) {
    return (
      <SafeAreaView className="flex-1 bg-main">
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted text-base">Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pasuram) return null;

  const lyricsText =
    language === 'tamil' ? pasuram.tamil_scripts : pasuram.english_scripts;

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* ── Top Bar — Prev / serial / Next (stays fixed, no animation) ── */}
      <View
        className="flex-row items-center justify-between px-4 py-2.5 border-b"
        style={{ borderBottomColor: `${colors.accent}1F` }}
      >
        {/* Prev */}
        <TouchableOpacity
          onPress={() => navigateTo(adjacent.prevId, -1)}
          disabled={!adjacent.prevId}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          className="flex-row items-center py-1.5 px-2.5 rounded-[1.125rem] min-w-[4.75rem]"
          style={{
            backgroundColor: adjacent.prevId ? `${colors.accent}1F` : 'rgba(255,255,255,0.04)',
            opacity: adjacent.prevId ? 1 : 0.35,
          }}
        >
          <Ionicons name="chevron-back" size={16} color={colors.accent} />
          <Text className="text-accent text-[0.8125rem] font-semibold ml-0.5">Prev</Text>
        </TouchableOpacity>

        {/* Serial number */}
        <Text
          className="text-text-muted text-[0.8125rem] font-semibold tracking-[0.025rem]"
          numberOfLines={1}
        >
          {pasuram.si_no}
        </Text>

        {/* Next */}
        <TouchableOpacity
          onPress={() => navigateTo(adjacent.nextId, 1)}
          disabled={!adjacent.nextId}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          className="flex-row items-center py-1.5 px-2.5 rounded-[1.125rem] min-w-[4.75rem] justify-end"
          style={{
            backgroundColor: adjacent.nextId ? `${colors.accent}1F` : 'rgba(255,255,255,0.04)',
            opacity: adjacent.nextId ? 1 : 0.35,
          }}
        >
          <Text className="text-accent text-[0.8125rem] font-semibold mr-0.5">Next</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* ── Animated content pane (also the swipe target) ── */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: slideAnim }]
          // overflow: 'hidden',
        }}
        {...panResponder.panHandlers}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="pl-6 pr-5 pb-[8.125rem]"
          showsVerticalScrollIndicator={false}
        >
          {/* Header block */}
          <View className="mt-5 mb-[1.375rem]">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-accent text-[0.8125rem] font-bold tracking-[0.075rem] uppercase mb-1.5">
                  {pasuram.prabhandham}
                </Text>
                <Text className="text-gray-500 text-xs tracking-[0.03125rem]">{pasuram.azhwar}</Text>
              </View>
              <GlowHeart bookmarked={pasuram.bookmark === 1} onToggle={handleBookmarkToggle} />
            </View>
          </View>

          {/* Lyrics */}
          {lyricsText ? (() => {
            const cleaned = lyricsText.replace(/\\/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
            const parts = cleaned.split(/(<verse>[\s\S]*?<\/verse>)/g);
            return (
              <View className="mb-8 px-3">
                {parts.map((part, index) => {
                  if (part.startsWith('<verse>') && part.endsWith('</verse>')) {
                    const verseText = part.substring(7, part.length - 8).trim();
                    return (
                      <Text
                        key={index}
                        style={{
                          fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                          lineHeight: 30,
                          textAlign: 'center',
                        }}
                        className="text-lyric-text text-[1rem] tracking-[0.01875rem] my-3"
                        selectable={true}
                      >
                        {parseBoldText(verseText)}
                      </Text>
                    );
                  } else {
                    const trimmed = part.trim();
                    if (!trimmed) return null;
                    return (
                      <Text
                        key={index}
                        style={{
                          fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                          lineHeight: 30,
                        }}
                        className="text-lyric-text text-[1rem] text-center tracking-[0.01875rem]"
                        selectable={true}
                      >
                        {parseBoldText(trimmed)}
                      </Text>
                    );
                  }
                })}
              </View>
            );
          })() : null}

          {/* Tags */}
          {(pasuram.rasa || pasuram.avataram || pasuram.archavathara) ? (
            <View className="flex-row flex-wrap gap-1.5 mt-3">
              {splitTags(pasuram.rasa).map((tag, idx) => (
                <View key={`rasa-${idx}`} className="px-2 py-1 rounded-md items-center justify-center bg-rose-100">
                  <Text className="text-[0.6875rem] font-bold tracking-[0.0125rem] text-rose-800" selectable={true}>{tag}</Text>
                </View>
              ))}
              {splitTags(pasuram.avataram).map((tag, idx) => (
                <View key={`avataram-${idx}`} className="px-2 py-1 rounded-md items-center justify-center bg-green-100">
                  <Text className="text-[0.6875rem] font-bold tracking-[0.0125rem] text-green-800" selectable={true}>{tag}</Text>
                </View>
              ))}
              {splitTags(pasuram.archavathara).map((tag, idx) => (
                <View key={`arch-${idx}`} className="px-2 py-1 rounded-md items-center justify-center bg-blue-100">
                  <Text className="text-[0.6875rem] font-bold tracking-[0.0125rem] text-blue-800" selectable={true}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Divider */}
          <View className="h-px bg-border-color mt-7 mb-7" />

          {/* Meaning & Purport */}
          <View className="mb-2">
            <SectionBlock title="Meaning" content={pasuram.meaning} />
            <SectionBlock title="Purport" content={pasuram.purport} />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', `${colors.main}CC`, colors.main]}
        className="absolute bottom-0 left-0 right-0 h-[5.625rem]"
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}
