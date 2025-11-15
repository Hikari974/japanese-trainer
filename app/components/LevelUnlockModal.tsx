import React, { useEffect } from 'react';
import { Dialog, YStack, XStack, H2, Text, Button } from 'tamagui';
import * as Haptics from 'expo-haptics';
import type { JLPTLevel } from '../types/word';

export interface LevelUnlockModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * The level that was unlocked
   */
  unlockedLevel: JLPTLevel;

  /**
   * The previous level that was completed
   */
  previousLevel: JLPTLevel;

  /**
   * Callback when user wants to start training the new level
   */
  onStartTraining: () => void;

  /**
   * Callback when user dismisses the modal
   */
  onDismiss: () => void;
}

// Level colors matching training page
const levelColors: Record<JLPTLevel, string> = {
  Kana: '$levelKana',
  N5: '$levelN5',
  N4: '$levelN4',
  N3: '$levelN3',
  N2: '$levelN2',
  N1: '$levelN1',
};

/**
 * Modal displayed when a new level is unlocked
 * Features: celebration message, haptic feedback, 2 CTAs (start training / later)
 */
export function LevelUnlockModal({
  open,
  unlockedLevel,
  previousLevel,
  onStartTraining,
  onDismiss,
}: LevelUnlockModalProps) {
  // Trigger haptic feedback when modal opens
  useEffect(() => {
    if (open) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [open]);

  return (
    <Dialog modal open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          padding="$6"
          maxWidth={400}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <Button
              position="absolute"
              top="$3"
              right="$3"
              size="$2"
              circular
              chromeless
              onPress={onDismiss}
              accessibilityLabel="Fermer"
            >
              <Text fontSize={18}>✕</Text>
            </Button>
          </Dialog.Close>

          {/* Celebration icon */}
          <YStack alignItems="center" gap="$2">
            <Text fontSize={60} lineHeight={60}>
              🎉
            </Text>

            <H2 fontSize={24} fontWeight="bold" color="$color" textAlign="center">
              FÉLICITATIONS !
            </H2>
          </YStack>

          {/* Unlock message */}
          <YStack gap="$3" alignItems="center">
            <Text
              fontSize={18}
              fontWeight="600"
              color={levelColors[unlockedLevel]}
              textAlign="center"
            >
              Niveau {unlockedLevel} Débloqué
            </Text>

            <Text fontSize={14} color="$gray11" textAlign="center">
              Vous avez maîtrisé tous les mots de {previousLevel}.{'\n'}
              Vous pouvez maintenant accéder au niveau {unlockedLevel} !
            </Text>
          </YStack>

          {/* Action buttons */}
          <YStack gap="$3" marginTop="$2">
            {/* Primary CTA: Start training */}
            <Button
              size="$4"
              backgroundColor={levelColors[unlockedLevel]}
              onPress={onStartTraining}
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              accessibilityLabel={`Commencer l'entraînement ${unlockedLevel}`}
            >
              <Text fontSize={16} fontWeight="bold" color="$background">
                Commencer {unlockedLevel} →
              </Text>
            </Button>

            {/* Secondary CTA: Dismiss */}
            <Button
              size="$4"
              chromeless
              onPress={onDismiss}
              pressStyle={{ opacity: 0.6 }}
              accessibilityLabel="Fermer le modal"
            >
              <Text fontSize={16} color="$gray11">
                Plus tard
              </Text>
            </Button>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
