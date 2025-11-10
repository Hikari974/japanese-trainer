import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LevelButton } from '../LevelButton';

describe('LevelButton', () => {
  it('should render level label correctly', () => {
    const { getByText } = render(
      <LevelButton level="N5" isSelected={false} onPress={() => {}} />
    );

    expect(getByText('N5')).toBeTruthy();
  });

  it('should apply selected styles when isSelected is true', () => {
    const { getByLabelText } = render(
      <LevelButton level="Kana" isSelected={true} onPress={() => {}} />
    );

    const button = getByLabelText('Niveau Kana');
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <LevelButton level="N3" isSelected={false} onPress={mockOnPress} />
    );

    const button = getByLabelText('Niveau N3');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
