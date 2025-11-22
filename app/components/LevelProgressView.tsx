import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { YStack, XStack, Text, Button, H2, ScrollView } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WordProgressItem } from './WordProgressItem';
import type { WordProgress, FilterMode, SortMode, LevelStatsSummary } from '../types/progress';
import type { JLPTLevel } from '../types/word';
import { getWordProgressForLevel, getLevelStatsSummary } from '../services/statistics';

export interface LevelProgressViewProps {
  /**
   * JLPT level to display progress for
   */
  level: JLPTLevel;
}

/**
 * Main screen component for displaying detailed word progress
 * Features: filtering (4 modes), sorting (4 modes), pull-to-refresh, virtualized scrolling
 */
export function LevelProgressView({ level }: LevelProgressViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [wordProgress, setWordProgress] = useState<WordProgress[]>([]);
  const [summary, setSummary] = useState<LevelStatsSummary | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('points-desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data function
  const loadData = useCallback(async () => {
    try {
      const [progress, stats] = await Promise.all([
        getWordProgressForLevel(level),
        getLevelStatsSummary(level),
      ]);

      setWordProgress(progress);
      setSummary(stats);

      if (__DEV__) {
        console.log(`Loaded ${progress.length} words for ${level}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`Failed to load progress for ${level}:`, error);
      }
    }
  }, [level]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  // Filter words based on selected filter mode
  const filteredWords = useMemo(() => {
    switch (filterMode) {
      case 'mastered':
        return wordProgress.filter(w => w.isMastered);
      case 'in-progress':
        return wordProgress.filter(w => w.totalPoints > 0 && w.totalPoints < 5);
      case 'not-started':
        return wordProgress.filter(w => w.totalAttempts === 0);
      case 'all':
      default:
        return wordProgress;
    }
  }, [wordProgress, filterMode]);

  // Sort words based on selected sort mode
  const sortedWords = useMemo(() => {
    const sorted = [...filteredWords];

    switch (sortMode) {
      case 'points-desc':
        sorted.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case 'points-asc':
        sorted.sort((a, b) => a.totalPoints - b.totalPoints);
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
        break;
      case 'recent':
        sorted.sort((a, b) => {
          if (!a.lastAttemptDate && !b.lastAttemptDate) return 0;
          if (!a.lastAttemptDate) return 1;
          if (!b.lastAttemptDate) return -1;
          return b.lastAttemptDate.localeCompare(a.lastAttemptDate);
        });
        break;
    }

    return sorted;
  }, [filteredWords, sortMode]);

  // Render filter button
  const FilterButton = ({ mode, label, count }: { mode: FilterMode; label: string; count: number }) => (
    <Button
      size="$3"
      backgroundColor={filterMode === mode ? '$blue10' : '$backgroundHover'}
      onPress={() => setFilterMode(mode)}
      pressStyle={{ opacity: 0.8 }}
      borderRadius="$10"
      accessibilityLabel={`Filtrer par ${label}`}
      accessibilityState={{ selected: filterMode === mode }}
    >
      <Text
        color={filterMode === mode ? '$background' : '$color'}
        fontWeight="600"
        fontSize={14}
      >
        {label} ({count})
      </Text>
    </Button>
  );

  // Render sort button
  const SortButton = ({ mode, label }: { mode: SortMode; label: string }) => (
    <Button
      size="$3"
      chromeless
      onPress={() => setSortMode(mode)}
      accessibilityLabel={`Trier par ${label}`}
      accessibilityState={{ selected: sortMode === mode }}
    >
      <Text
        color={sortMode === mode ? '$blue10' : '$gray11'}
        fontWeight={sortMode === mode ? '600' : '400'}
        fontSize={14}
      >
        {label}
      </Text>
    </Button>
  );

  // Loading state
  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Text color="$gray11">Chargement...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        paddingTop={insets.top + 16}
        paddingHorizontal="$4"
        paddingBottom="$4"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        gap="$3"
      >
        {/* Back button + Title */}
        <XStack alignItems="center" gap="$3">
          <Button
            size="$4"
            chromeless
            onPress={() => router.back()}
            accessibilityLabel="Retour"
            pressStyle={{ opacity: 0.6, scale: 0.95 }}
            animation="quick"
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </Button>

          <H2 fontSize={24} fontWeight="bold" color="$color" flex={1}>
            Progression {level}
          </H2>
        </XStack>

        {/* Summary */}
        {summary && (
          <XStack gap="$2" flexWrap="wrap">
            <Text fontSize={14} color="$gray11">
              {summary.masteredWords}/{summary.totalWords} mots maîtrisés ({summary.masteryPercentage.toFixed(1)}%)
            </Text>
          </XStack>
        )}

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            <FilterButton
              mode="all"
              label="Tous"
              count={wordProgress.length}
            />
            <FilterButton
              mode="mastered"
              label="Maîtrisés"
              count={summary?.masteredWords ?? 0}
            />
            <FilterButton
              mode="in-progress"
              label="En cours"
              count={summary?.inProgressWords ?? 0}
            />
            <FilterButton
              mode="not-started"
              label="Non démarrés"
              count={summary?.notStartedWords ?? 0}
            />
          </XStack>
        </ScrollView>

        {/* Sort Controls */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$3">
            <SortButton mode="points-desc" label="Points ↓" />
            <SortButton mode="points-asc" label="Points ↑" />
            <SortButton mode="alphabetical" label="A-Z" />
            <SortButton mode="recent" label="Récents" />
          </XStack>
        </ScrollView>
      </YStack>

      {/* Word List */}
      <YStack flex={1} paddingHorizontal="$4" paddingTop="$3">
        {sortedWords.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text color="$gray11" textAlign="center">
              Aucun mot dans cette catégorie
            </Text>
          </YStack>
        ) : (
          <FlashList
            data={sortedWords}
            renderItem={({ item }) => <WordProgressItem wordProgress={item} />}
            keyExtractor={(item) => item.wordId.toString()}
            estimatedItemSize={100}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#888"
              />
            }
            contentContainerStyle={{
              paddingBottom: insets.bottom + 16,
            }}
          />
        )}
      </YStack>
    </YStack>
  );
}
