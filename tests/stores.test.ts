import { act, renderHook } from '@testing-library/react';
import { useChaseStore } from '@/lib/chase-store';
import { useNotificationStore } from '@/lib/notification-store';
import { Chase, UserProgress } from '@/types';

describe('useChaseStore', () => {
  const mockChase: Chase = {
    id: '1',
    title: 'Test Chase',
    description: 'A test chase',
    difficulty: 'easy',
    estimatedDuration: 30,
    location: { latitude: 48.8566, longitude: 2.3522 },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    status: 'active',
    participants: 5,
    rating: 4.5,
    steps: [],
  };

  const mockProgress: UserProgress = {
    userId: '1',
    chaseId: '1',
    currentStep: 0,
    totalSteps: 3,
    pointsEarned: 100,
    startedAt: '2024-01-01T00:00:00Z',
    stepProgress: [],
  };

  beforeEach(() => {
    // Reset store state
    act(() => {
      useChaseStore.setState({
        chases: [],
        currentChase: null,
        userProgress: null,
        isLoading: false,
        error: null,
      });
    });
  });

  it('should set chases', () => {
    const { result } = renderHook(() => useChaseStore());

    act(() => {
      result.current.setChases([mockChase]);
    });

    expect(result.current.chases).toEqual([mockChase]);
  });

  it('should set current chase', () => {
    const { result } = renderHook(() => useChaseStore());

    act(() => {
      result.current.setCurrentChase(mockChase);
    });

    expect(result.current.currentChase).toEqual(mockChase);
  });

  it('should set user progress', () => {
    const { result } = renderHook(() => useChaseStore());

    act(() => {
      result.current.setUserProgress(mockProgress);
    });

    expect(result.current.userProgress).toEqual(mockProgress);
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useChaseStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should set error', () => {
    const { result } = renderHook(() => useChaseStore());

    act(() => {
      result.current.setError('Something went wrong');
    });

    expect(result.current.error).toEqual('Something went wrong');
  });
});

describe('useNotificationStore', () => {
  beforeEach(() => {
    // Reset store state
    act(() => {
      useNotificationStore.setState({ notifications: [] });
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        type: 'success',
        message: 'Test notification',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[0].message).toBe('Test notification');
  });

  it('should remove notification', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({ type: 'info', message: 'Test' });
    });

    const id = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(id);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({ type: 'info', message: 'Test 1' });
      result.current.addNotification({ type: 'info', message: 'Test 2' });
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.clearNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should auto-remove notification after duration', () => {
    const { result } = renderHook(() => useNotificationStore());

    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Test',
        duration: 3000,
      });
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.notifications).toHaveLength(0);
  });
});
