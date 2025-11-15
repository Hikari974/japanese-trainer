import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LevelButton } from '../LevelButton';
import type { LevelProgress } from '../../types/statistics';

describe('LevelButton', () => {
  const mockProgress: LevelProgress = {
    level: 'N5',
    totalWords: 100,
    masteredWords: 65,
    percentage: 65,
  };

  const mockCompletedProgress: LevelProgress = {
    level: 'Kana',
    totalWords: 46,
    masteredWords: 46,
    percentage: 100,
  };

  describe('Unlocked State', () => {
    it('should render level label correctly when unlocked', () => {
      const { getByText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} onPress={() => {}} />
      );

      expect(getByText('N5')).toBeTruthy();
    });

    it('should display progress information when unlocked with progress', () => {
      const { getByText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} progress={mockProgress} onPress={() => {}} />
      );

      expect(getByText('65%')).toBeTruthy();
      expect(getByText('65/100 mots (65%)')).toBeTruthy();
    });

    it('should render properly when unlocked', () => {
      const { getByLabelText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} progress={mockProgress} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N5, déverrouillé, 65% complété');
      // Button renders without error
      expect(button).toBeTruthy();
    });

    it('should be clickable when unlocked', () => {
      const mockOnPress = jest.fn();
      const { getByLabelText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} progress={mockProgress} onPress={mockOnPress} />
      );

      const button = getByLabelText('Niveau N5, déverrouillé, 65% complété');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not be disabled when unlocked', () => {
      const { getByLabelText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} progress={mockProgress} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N5, déverrouillé, 65% complété');
      expect(button.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('Locked State', () => {
    it('should display lock icon when locked', () => {
      const { getByText } = render(
        <LevelButton level="N4" isSelected={false} isLocked={true} onPress={() => {}} />
      );

      expect(getByText('🔒')).toBeTruthy();
    });

    it('should display "Complete X to unlock" message when locked', () => {
      const { getByText } = render(
        <LevelButton level="N4" isSelected={false} isLocked={true} onPress={() => {}} />
      );

      expect(getByText('Complétez N5 pour déverrouiller')).toBeTruthy();
    });

    it('should render with lock icon and disabled state when locked', () => {
      const { getByLabelText, getByText } = render(
        <LevelButton level="N4" isSelected={false} isLocked={true} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N4, verrouillé, complétez N5 pour déverrouiller');
      expect(button).toBeTruthy();
      expect(getByText('🔒')).toBeTruthy();
    });

    it('should be disabled when locked', () => {
      const { getByLabelText } = render(
        <LevelButton level="N4" isSelected={false} isLocked={true} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N4, verrouillé, complétez N5 pour déverrouiller');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should be marked as disabled when locked', () => {
      const { getByLabelText } = render(
        <LevelButton level="N4" isSelected={false} isLocked={true} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N4, verrouillé, complétez N5 pour déverrouiller');
      // Button is disabled
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should not display progress info when locked', () => {
      const { queryByText } = render(
        <LevelButton level="N4" isSelected={false} isLocked={true} onPress={() => {}} />
      );

      // Should show lock message instead of progress
      expect(queryByText('Complétez N5 pour déverrouiller')).toBeTruthy();
      // Should not show progress percentage
      expect(queryByText(/\d+\/\d+ mots/)).toBeNull();
    });
  });

  describe('Selected State', () => {
    it('should apply selected accessibility state when isSelected is true', () => {
      const { getByLabelText } = render(
        <LevelButton level="Kana" isSelected={true} isLocked={false} progress={mockCompletedProgress} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau Kana, déverrouillé, 100% complété');
      expect(button.props.accessibilityState.selected).toBe(true);
    });

    it('should not have selected state when isSelected is false', () => {
      const { getByLabelText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} progress={mockProgress} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N5, déverrouillé, 65% complété');
      expect(button.props.accessibilityState.selected).toBe(false);
    });
  });

  describe('Completed State (100%)', () => {
    it('should display checkmark icon when completed (100%)', () => {
      const { getByText } = render(
        <LevelButton level="Kana" isSelected={false} isLocked={false} progress={mockCompletedProgress} onPress={() => {}} />
      );

      expect(getByText('✅')).toBeTruthy();
    });

    it('should display 100% progress', () => {
      const { getByText } = render(
        <LevelButton level="Kana" isSelected={false} isLocked={false} progress={mockCompletedProgress} onPress={() => {}} />
      );

      expect(getByText('100%')).toBeTruthy();
      expect(getByText('46/46 mots (100%)')).toBeTruthy();
    });

    it('should still be clickable when completed', () => {
      const mockOnPress = jest.fn();
      const { getByLabelText } = render(
        <LevelButton level="Kana" isSelected={false} isLocked={false} progress={mockCompletedProgress} onPress={mockOnPress} />
      );

      const button = getByLabelText('Niveau Kana, déverrouillé, 100% complété');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0% progress correctly', () => {
      const zeroProgress: LevelProgress = {
        level: 'N5',
        totalWords: 100,
        masteredWords: 0,
        percentage: 0,
      };

      const { getByText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} progress={zeroProgress} onPress={() => {}} />
      );

      expect(getByText('0%')).toBeTruthy();
      expect(getByText('0/100 mots (0%)')).toBeTruthy();
    });

    it('should handle unlocked level without progress data', () => {
      const { getByText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} onPress={() => {}} />
      );

      expect(getByText('N5')).toBeTruthy();
      // No progress info should be displayed
    });

    it('should handle Kana level (first level, no previous)', () => {
      const { getByLabelText } = render(
        <LevelButton level="Kana" isSelected={false} isLocked={false} progress={mockCompletedProgress} onPress={() => {}} />
      );

      // Should render without errors
      const button = getByLabelText('Niveau Kana, déverrouillé, 100% complété');
      expect(button).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label for locked level', () => {
      const { getByLabelText } = render(
        <LevelButton level="N3" isSelected={false} isLocked={true} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N3, verrouillé, complétez N4 pour déverrouiller');
      expect(button).toBeTruthy();
    });

    it('should have correct accessibility label for unlocked level with progress', () => {
      const { getByLabelText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} progress={mockProgress} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N5, déverrouillé, 65% complété');
      expect(button).toBeTruthy();
    });

    it('should have button accessibility role', () => {
      const { getByLabelText } = render(
        <LevelButton level="N5" isSelected={false} isLocked={false} progress={mockProgress} onPress={() => {}} />
      );

      const button = getByLabelText('Niveau N5, déverrouillé, 65% complété');
      expect(button.props.accessibilityRole).toBe('button');
    });
  });
});
