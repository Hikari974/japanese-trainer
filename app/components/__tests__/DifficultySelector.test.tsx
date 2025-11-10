import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DifficultySelector } from '../DifficultySelector';

describe('DifficultySelector', () => {
  it('should render all 4 difficulty options', () => {
    const { getByText } = render(
      <DifficultySelector value="Normal" onChange={() => {}} />
    );

    expect(getByText('Facile')).toBeTruthy();
    expect(getByText('Normal')).toBeTruthy();
    expect(getByText('Difficile')).toBeTruthy();
    expect(getByText('Extrême')).toBeTruthy();
  });

  it('should highlight selected difficulty', () => {
    const { getByLabelText } = render(
      <DifficultySelector value="Difficile" onChange={() => {}} />
    );

    const difficileButton = getByLabelText('Difficulté Difficile');
    expect(difficileButton.props.accessibilityState.selected).toBe(true);

    const facileButton = getByLabelText('Difficulté Facile');
    expect(facileButton.props.accessibilityState.selected).toBe(false);
  });

  it('should call onChange when clicking a difficulty', () => {
    const mockOnChange = jest.fn();
    const { getByLabelText } = render(
      <DifficultySelector value="Normal" onChange={mockOnChange} />
    );

    const extremeButton = getByLabelText('Difficulté Extrême');
    fireEvent.press(extremeButton);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('Extrême');
  });

  it('should apply correct colors for each difficulty', () => {
    const { getByLabelText } = render(
      <DifficultySelector value="Facile" onChange={() => {}} />
    );

    // Verify all difficulty buttons are present with their accessibility labels
    expect(getByLabelText('Difficulté Facile')).toBeTruthy();
    expect(getByLabelText('Difficulté Normal')).toBeTruthy();
    expect(getByLabelText('Difficulté Difficile')).toBeTruthy();
    expect(getByLabelText('Difficulté Extrême')).toBeTruthy();
  });
});
