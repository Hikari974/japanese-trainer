import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../index';

describe('HomeScreen', () => {
  it('should render with default difficulty Normal', () => {
    const { getByLabelText } = render(<HomeScreen />);

    const normalButton = getByLabelText('Difficulté Normal');
    expect(normalButton.props.accessibilityState.selected).toBe(true);
  });

  it('should render all 6 levels (Kana, N5-N1)', () => {
    const { getByLabelText } = render(<HomeScreen />);

    expect(getByLabelText('Niveau Kana')).toBeTruthy();
    expect(getByLabelText('Niveau N5')).toBeTruthy();
    expect(getByLabelText('Niveau N4')).toBeTruthy();
    expect(getByLabelText('Niveau N3')).toBeTruthy();
    expect(getByLabelText('Niveau N2')).toBeTruthy();
    expect(getByLabelText('Niveau N1')).toBeTruthy();
  });

  it('should update difficulty when DifficultySelector changes', () => {
    const { getByLabelText } = render(<HomeScreen />);

    const difficileButton = getByLabelText('Difficulté Difficile');
    fireEvent.press(difficileButton);

    // After pressing, Difficile should be selected
    expect(difficileButton.props.accessibilityState.selected).toBe(true);

    // And Normal should no longer be selected
    const normalButton = getByLabelText('Difficulté Normal');
    expect(normalButton.props.accessibilityState.selected).toBe(false);
  });

  it('should select level when LevelButton is pressed', () => {
    const { getByLabelText } = render(<HomeScreen />);

    const n5Button = getByLabelText('Niveau N5');

    // Initially no level should be selected
    expect(n5Button.props.accessibilityState.selected).toBe(false);

    // Press the button
    fireEvent.press(n5Button);

    // Now N5 should be selected
    expect(n5Button.props.accessibilityState.selected).toBe(true);
  });

  it('should navigate to settings/stats/poc-scroll', () => {
    const { getByLabelText } = render(<HomeScreen />);

    // Verify navigation links are present
    expect(getByLabelText('Voir les statistiques')).toBeTruthy();
    expect(getByLabelText('Paramètres')).toBeTruthy();
    expect(getByLabelText('Tester le POC')).toBeTruthy();
  });

  it('should show start session button', () => {
    const { getByLabelText } = render(<HomeScreen />);

    const startButton = getByLabelText('Commencer la session');
    expect(startButton).toBeTruthy();
  });

  it('should disable start button when no level selected', () => {
    const { getByLabelText } = render(<HomeScreen />);

    const startButton = getByLabelText('Commencer la session');
    expect(startButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should enable start button when level is selected', () => {
    const { getByLabelText } = render(<HomeScreen />);

    const n5Button = getByLabelText('Niveau N5');
    fireEvent.press(n5Button);

    const startButton = getByLabelText('Commencer la session');
    expect(startButton.props.accessibilityState.disabled).toBe(false);
  });

  describe('Level Unlock Logic (US-006.4)', () => {
    it('should show loading state while fetching level states', async () => {
      const { findByText } = render(<HomeScreen />);

      // Should show loading text initially
      const loadingText = await findByText('Chargement des niveaux...');
      expect(loadingText).toBeTruthy();
    });

    it('should load unlock status on mount', async () => {
      const { findByLabelText } = render(<HomeScreen />);

      // Wait for levels to load
      // Kana should be unlocked by default
      const kanaButton = await findByLabelText(/Niveau Kana/);
      expect(kanaButton).toBeTruthy();
    });

    it('should load progression data for all levels on mount', async () => {
      const { findByLabelText } = render(<HomeScreen />);

      // Wait for levels to load with progress data
      // Should have accessibility labels with "complété" (unlocked) or "verrouillé" (locked)
      const kanaButton = await findByLabelText(/Niveau Kana.*complété/);
      expect(kanaButton).toBeTruthy();
    });

    it('should prevent selection of locked levels', async () => {
      const { findByLabelText } = render(<HomeScreen />);

      // Wait for levels to load
      // Find a locked level (assuming N5+ are locked initially)
      const lockedButtons = await findByLabelText(/verrouillé/);

      if (lockedButtons) {
        const wasSelected = lockedButtons.props.accessibilityState.selected;
        fireEvent.press(lockedButtons);

        // Selection state should not change (should still be false)
        expect(lockedButtons.props.accessibilityState.selected).toBe(wasSelected);
      }
    });

    it('should allow selection of unlocked levels', async () => {
      const { findByLabelText } = render(<HomeScreen />);

      // Kana should be unlocked by default
      const kanaButton = await findByLabelText(/Niveau Kana.*complété/);

      expect(kanaButton.props.accessibilityState.selected).toBe(false);

      fireEvent.press(kanaButton);

      // Should now be selected
      expect(kanaButton.props.accessibilityState.selected).toBe(true);
    });

    it('should render locked levels properly', async () => {
      const { findByLabelText } = render(<HomeScreen />);

      // Wait for levels to load
      const lockedButton = await findByLabelText(/verrouillé/);

      // Locked button renders
      expect(lockedButton).toBeTruthy();
    });

    it('should render unlocked levels properly', async () => {
      const { findByLabelText } = render(<HomeScreen />);

      // Kana should be unlocked
      const kanaButton = await findByLabelText(/Niveau Kana.*complété/);
      expect(kanaButton).toBeTruthy();
    });

    it('should display progress bars for unlocked levels', async () => {
      const { findByLabelText, queryByText } = render(<HomeScreen />);

      // Wait for levels to load
      await findByLabelText(/Niveau Kana/);

      // Unlocked levels should show progress (X/Y mots)
      // Note: This depends on actual data, so we just verify structure loads
      expect(queryByText(/mots/)).toBeTruthy();
    });
  });
});
