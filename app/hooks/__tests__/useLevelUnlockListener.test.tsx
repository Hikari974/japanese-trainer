import { renderHook, act } from '@testing-library/react-native';
import { useLevelUnlockListener } from '../useLevelUnlockListener';
import type { LevelUnlockEvent } from '../../types/statistics';

// Mock expo-router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  }),
}));

// Mock __DEV__ global
global.__DEV__ = true;

describe('useLevelUnlockListener hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should register unlock callback on mount and cleanup on unmount', () => {
    const mockRegister = jest.fn(() => jest.fn());
    const { unmount } = renderHook(() => useLevelUnlockListener(mockRegister));

    // Verify callback was registered
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith(expect.any(Function));

    // Get the unregister function returned by mockRegister
    const unregisterFn = mockRegister.mock.results[0].value;

    // Unmount and verify cleanup
    unmount();
    expect(unregisterFn).toHaveBeenCalled();
  });

  it('should initialize with modal closed and null levels', () => {
    const mockRegister = jest.fn(() => jest.fn());
    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.unlockedLevel).toBe(null);
    expect(result.current.previousLevel).toBe(null);
  });

  it('should open modal when unlock event is received', () => {
    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    expect(result.current.isModalOpen).toBe(false);

    // Trigger unlock event for N5
    act(() => {
      unlockCallback!({ level: 'N5', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.unlockedLevel).toBe('N5');
    expect(result.current.previousLevel).toBe('Kana');
  });

  it('should calculate previous level correctly for N4', () => {
    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    // Unlock N4 -> previous should be N5
    act(() => {
      unlockCallback!({ level: 'N4', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(result.current.unlockedLevel).toBe('N4');
    expect(result.current.previousLevel).toBe('N5');
  });

  it('should calculate previous level correctly for N3', () => {
    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    // Unlock N3 -> previous should be N4
    act(() => {
      unlockCallback!({ level: 'N3', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(result.current.unlockedLevel).toBe('N3');
    expect(result.current.previousLevel).toBe('N4');
  });

  it('should handle Kana unlock with null previous level', () => {
    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    // Unlock Kana -> no previous level
    act(() => {
      unlockCallback!({ level: 'Kana', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(result.current.unlockedLevel).toBe('Kana');
    expect(result.current.previousLevel).toBe(null);
  });

  it('should close modal and navigate to training page on handleStartTraining', () => {
    jest.useFakeTimers();

    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    // Unlock N5
    act(() => {
      unlockCallback!({ level: 'N5', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(result.current.isModalOpen).toBe(true);

    // Click "Start Training"
    act(() => {
      result.current.handleStartTraining();
    });

    // Modal should close immediately
    expect(result.current.isModalOpen).toBe(false);

    // Navigation should not have been called yet (300ms delay)
    expect(mockPush).not.toHaveBeenCalled();

    // Fast-forward 300ms delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Navigation should now be called with correct params
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/training',
      params: { level: 'N5', difficulty: 'Normal' },
    });

    jest.useRealTimers();
  });

  it('should not navigate if unlockedLevel is null on handleStartTraining', () => {
    jest.useFakeTimers();

    const mockRegister = jest.fn(() => jest.fn());
    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    // Modal closed, no unlocked level
    expect(result.current.unlockedLevel).toBe(null);

    // Try to start training (should not navigate)
    act(() => {
      result.current.handleStartTraining();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockPush).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should close modal on handleDismiss', () => {
    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    // Unlock N5
    act(() => {
      unlockCallback!({ level: 'N5', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(result.current.isModalOpen).toBe(true);

    // Dismiss modal
    act(() => {
      result.current.handleDismiss();
    });

    expect(result.current.isModalOpen).toBe(false);
  });

  it('should log unlock event in dev mode', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    renderHook(() => useLevelUnlockListener(mockRegister));

    // Trigger unlock
    act(() => {
      unlockCallback!({ level: 'N2', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Level unlock event received: N2')
    );

    consoleLogSpy.mockRestore();
  });

  it('should handle multiple unlock events (replace previous state)', () => {
    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    // First unlock: N5
    act(() => {
      unlockCallback!({ level: 'N5', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(result.current.unlockedLevel).toBe('N5');
    expect(result.current.previousLevel).toBe('Kana');

    // Second unlock: N4 (replace state)
    act(() => {
      unlockCallback!({ level: 'N4', timestamp: '2025-11-15T10:01:00Z' });
    });

    expect(result.current.unlockedLevel).toBe('N4');
    expect(result.current.previousLevel).toBe('N5');
    expect(result.current.isModalOpen).toBe(true);
  });

  it('should provide correct function signatures', () => {
    const mockRegister = jest.fn(() => jest.fn());
    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    expect(typeof result.current.handleStartTraining).toBe('function');
    expect(typeof result.current.handleDismiss).toBe('function');
    expect(typeof result.current.isModalOpen).toBe('boolean');
  });

  it('should handle N1 unlock (last level in sequence)', () => {
    let unlockCallback: (event: LevelUnlockEvent) => void;
    const mockRegister = jest.fn((cb) => {
      unlockCallback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useLevelUnlockListener(mockRegister));

    // Unlock N1 -> previous should be N2
    act(() => {
      unlockCallback!({ level: 'N1', timestamp: '2025-11-15T10:00:00Z' });
    });

    expect(result.current.unlockedLevel).toBe('N1');
    expect(result.current.previousLevel).toBe('N2');
  });
});
