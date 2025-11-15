import { useState, useEffect, useMemo, useCallback } from 'react';
import { YStack, XStack, H2, H3, Text, Card, Spinner } from 'tamagui';
import { ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from './components/AppHeader';
import { ProgressBar } from './components/ProgressBar';
import { useStatistics } from './hooks/useStatistics';
import type { JLPTLevel } from './types/word';
import type { LevelProgress } from './types/statistics';

// Level colors matching training page
const levelColors: Record<JLPTLevel, string> = {
  Kana: '$levelKana',
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};

// JLPT level order for progression
const JLPT_LEVELS: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { statistics, isLoading, calculateProgress, getUnlockedLevels } = useStatistics();

  // State for progression data
  const [levelsProgress, setLevelsProgress] = useState<Map<JLPTLevel, LevelProgress>>(new Map());
  const [unlockedLevels, setUnlockedLevels] = useState<JLPTLevel[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Load progression data on mount
  useEffect(() => {
    async function loadProgressionData() {
      try {
        const [progressResults, unlockedResults] = await Promise.all([
          Promise.all(JLPT_LEVELS.map(level => calculateProgress(level))),
          getUnlockedLevels()
        ]);

        const progressMap = new Map<JLPTLevel, LevelProgress>();
        JLPT_LEVELS.forEach((level, index) => {
          progressMap.set(level, progressResults[index]);
        });

        setLevelsProgress(progressMap);
        setUnlockedLevels(unlockedResults);
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to load progression data:', error);
        }
      } finally {
        setIsLoadingProgress(false);
      }
    }

    loadProgressionData();
  }, [calculateProgress, getUnlockedLevels]);

  // Calculate global progression across all levels
  const globalProgress = useMemo(() => {
    let totalWords = 0;
    let totalMastered = 0;

    levelsProgress.forEach(progress => {
      totalWords += progress.totalWords;
      totalMastered += progress.masteredWords;
    });

    const percentage = totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) : 0;

    return { totalWords, totalMastered, percentage };
  }, [levelsProgress]);

  // Find current level (highest unlocked)
  const currentLevel = useMemo(() => {
    if (unlockedLevels.length === 0) return 'Kana';

    // Return the highest level in the unlocked list
    const orderedUnlocked = JLPT_LEVELS.filter(level => unlockedLevels.includes(level));
    return orderedUnlocked[orderedUnlocked.length - 1] || 'Kana';
  }, [unlockedLevels]);

  // Handle level card tap
  const handleLevelTap = useCallback((level: JLPTLevel) => {
    const isLocked = !unlockedLevels.includes(level);

    if (isLocked) {
      if (__DEV__) {
        console.log(`Cannot navigate to locked level: ${level}`);
      }
      return;
    }

    router.push({
      pathname: '/(tabs)/level-progress/[level]',
      params: { level: level.toLowerCase() }
    });
  }, [unlockedLevels, router]);

  // Calculate stats by level
  const statsByLevel = useMemo(() => {
    if (!statistics) return {};

    const levels: JLPTLevel[] = ['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'];
    const result: Record<JLPTLevel, { points: number; attempts: number }> = {} as any;

    levels.forEach(level => {
      result[level] = { points: 0, attempts: 0 };
    });

    Object.values(statistics.words).forEach(wordStat => {
      result[wordStat.level].points += wordStat.points;
      result[wordStat.level].attempts += wordStat.totalAttempts;
    });

    return result;
  }, [statistics]);

  // Calculate success rate
  const successRate = useMemo(() => {
    if (!statistics || statistics.globalStats.totalAttempts === 0) return 0;
    const successCount = Object.values(statistics.words).reduce(
      (sum, word) => sum + word.successCount,
      0
    );
    return Math.round((successCount / statistics.globalStats.totalAttempts) * 100);
  }, [statistics]);

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <AppHeader title="Statistiques" showBackButton />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </YStack>
      </YStack>
    );
  }

  if (!statistics) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <AppHeader title="Statistiques" showBackButton />
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Text>Impossible de charger les statistiques</Text>
        </YStack>
      </YStack>
    );
  }

  const hasStats = statistics.globalStats.totalAttempts > 0;

  return (
    <YStack flex={1} backgroundColor="$background">
      <AppHeader title="Statistiques" showBackButton />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <YStack padding="$4" gap="$4">
          {/* Progression JLPT Section */}
          {isLoadingProgress ? (
            <Card padding="$4" borderRadius="$4" backgroundColor="$gray2">
              <YStack alignItems="center" gap="$2">
                <Spinner size="small" color="$blue10" />
                <Text fontSize={14} color="$gray11">Chargement progression...</Text>
              </YStack>
            </Card>
          ) : (
            <Card padding="$4" borderRadius="$4" backgroundColor="$gray2">
              <H2 marginBottom="$3">Progression JLPT</H2>

              {/* Global Progress Header */}
              <YStack gap="$3" marginBottom="$4" padding="$3" borderRadius="$3" backgroundColor="$gray3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} color="$gray11">Niveau actuel</Text>
                  <Text fontSize={18} fontWeight="bold" color={levelColors[currentLevel]}>
                    {currentLevel}
                  </Text>
                </XStack>

                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} color="$gray11">Mots maîtrisés</Text>
                  <Text fontSize={18} fontWeight="600">
                    {globalProgress.totalMastered} / {globalProgress.totalWords}
                  </Text>
                </XStack>

                <YStack gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={14} color="$gray11">Progression globale</Text>
                    <Text fontSize={18} fontWeight="bold" color="$blue10">
                      {globalProgress.percentage}%
                    </Text>
                  </XStack>
                  <ProgressBar
                    value={globalProgress.percentage}
                    height={8}
                    color="$blue10"
                    backgroundColor="$gray5"
                  />
                </YStack>
              </YStack>

              {/* Level Cards */}
              <YStack gap="$2">
                {JLPT_LEVELS.map(level => {
                  const progress = levelsProgress.get(level);
                  const isLocked = !unlockedLevels.includes(level);
                  const isCompleted = progress && progress.percentage >= 100;

                  if (!progress) return null;

                  return (
                    <Pressable
                      key={level}
                      onPress={() => handleLevelTap(level)}
                      disabled={isLocked}
                    >
                      <XStack
                        padding="$3"
                        borderRadius="$3"
                        backgroundColor={isLocked ? '$gray1' : '$gray3'}
                        opacity={isLocked ? 0.4 : 1}
                        gap="$3"
                        alignItems="center"
                      >
                        {/* Level indicator bar */}
                        <YStack
                          width={8}
                          height={48}
                          borderRadius="$2"
                          backgroundColor={isCompleted ? '$green10' : levelColors[level]}
                        />

                        {/* Level content */}
                        <YStack flex={1} gap="$2">
                          <XStack justifyContent="space-between" alignItems="center">
                            <XStack alignItems="center" gap="$2">
                              <Text fontSize={18} fontWeight="bold">
                                {level}
                              </Text>
                              {isLocked && <Text fontSize={16}>🔒</Text>}
                              {isCompleted && <Text fontSize={16}>✅</Text>}
                              {!isLocked && !isCompleted && <Text fontSize={16}>🔄</Text>}
                            </XStack>
                            <Text fontSize={16} fontWeight="600" color={isCompleted ? '$green10' : '$color'}>
                              {progress.masteredWords}/{progress.totalWords}
                            </Text>
                          </XStack>

                          <YStack gap="$1">
                            <ProgressBar
                              value={progress.percentage}
                              height={6}
                              color={isCompleted ? '$green10' : levelColors[level]}
                              backgroundColor="$gray5"
                            />
                            <Text fontSize={12} color="$gray11">
                              {progress.percentage.toFixed(1)}% maîtrisé
                            </Text>
                          </YStack>
                        </YStack>
                      </XStack>
                    </Pressable>
                  );
                })}
              </YStack>
            </Card>
          )}

          {!hasStats ? (
            <Card padding="$4" borderRadius="$4" backgroundColor="$gray2">
              <YStack alignItems="center" gap="$2">
                <Text fontSize={16} color="$gray11" textAlign="center">
                  Aucune statistique disponible
                </Text>
                <Text fontSize={14} color="$gray10" textAlign="center">
                  Commencez une session d'entraînement pour voir vos progrès !
                </Text>
              </YStack>
            </Card>
          ) : (
            <>
              {/* Global Statistics */}
              <Card padding="$4" borderRadius="$4" backgroundColor="$gray2">
                <H2 marginBottom="$3">Statistiques Globales</H2>

                <YStack gap="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={16} color="$gray11">Points totaux</Text>
                    <Text fontSize={24} fontWeight="bold" color="$blue10">
                      {statistics.globalStats.totalPoints}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={16} color="$gray11">Tentatives totales</Text>
                    <Text fontSize={20} fontWeight="600">
                      {statistics.globalStats.totalAttempts}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={16} color="$gray11">Taux de réussite</Text>
                    <Text fontSize={20} fontWeight="600" color={successRate >= 70 ? '$green10' : '$orange10'}>
                      {successRate}%
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={16} color="$gray11">Mots parfaits</Text>
                    <Text fontSize={20} fontWeight="600" color="$green10">
                      {statistics.globalStats.perfectCount}
                    </Text>
                  </XStack>

                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={16} color="$gray11">Mots uniques</Text>
                    <Text fontSize={20} fontWeight="600">
                      {statistics.globalStats.totalWords}
                    </Text>
                  </XStack>
                </YStack>
              </Card>

              {/* Level Breakdown */}
              <Card padding="$4" borderRadius="$4" backgroundColor="$gray2">
                <H3 marginBottom="$3">Points par Niveau</H3>

                <YStack gap="$2">
                  {(['Kana', 'N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map(level => {
                    const levelStats = statsByLevel[level];
                    const hasLevelStats = levelStats && levelStats.attempts > 0;

                    return (
                      <XStack
                        key={level}
                        justifyContent="space-between"
                        alignItems="center"
                        padding="$2"
                        borderRadius="$2"
                        backgroundColor={hasLevelStats ? '$gray3' : '$gray1'}
                      >
                        <XStack alignItems="center" gap="$2">
                          <YStack
                            width={8}
                            height={32}
                            borderRadius="$2"
                            backgroundColor={levelColors[level]}
                          />
                          <Text fontSize={16} fontWeight="600">
                            {level}
                          </Text>
                        </XStack>

                        <XStack gap="$4" alignItems="center">
                          <Text fontSize={14} color="$gray11">
                            {levelStats.attempts} tentative{levelStats.attempts > 1 ? 's' : ''}
                          </Text>
                          <Text fontSize={18} fontWeight="bold" color="$blue10" minWidth={40} textAlign="right">
                            {levelStats.points}
                          </Text>
                        </XStack>
                      </XStack>
                    );
                  })}
                </YStack>
              </Card>
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
