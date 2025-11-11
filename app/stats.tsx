import { useMemo } from 'react';
import { YStack, XStack, H2, H3, Text, Card, Spinner } from 'tamagui';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from './components/AppHeader';
import { useStatistics } from './hooks/useStatistics';
import type { JLPTLevel } from './types/word';

// Level colors matching training page
const levelColors: Record<JLPTLevel, string> = {
  Kana: '$levelKana',
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { statistics, isLoading } = useStatistics();

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
