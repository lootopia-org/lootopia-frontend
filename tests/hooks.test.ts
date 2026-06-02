import { renderHook, act } from '@testing-library/react';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';

// Mock notification store
jest.mock('@/lib/notification-store', () => ({
  useNotificationStore: () => ({
    addNotification: jest.fn(),
  }),
}));

describe('useAsync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with idle state', () => {
    const asyncFn = jest.fn().mockResolvedValue('test');
    const { result } = renderHook(() => useAsync(asyncFn, false));

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should execute function and return success', async () => {
    const asyncFn = jest.fn().mockResolvedValue('success data');
    const { result } = renderHook(() => useAsync(asyncFn, false));

    await act(async () => {
      await result.current.execute();
    });

    expect(asyncFn).toHaveBeenCalled();
    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('success data');
    expect(result.current.error).toBeNull();
  });

  it('should handle error', async () => {
    const error = new Error('Something went wrong');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFn, false));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toEqual(error);
  });



  it('should call onSuccess callback', async () => {
    const onSuccess = jest.fn();
    const asyncFn = jest.fn().mockResolvedValue('test');
    const { result } = renderHook(() => useAsync(asyncFn, false, onSuccess));

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalledWith('test');
  });

  it('should call onError callback', async () => {
    const onError = jest.fn();
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFn, false, undefined, onError));

    await act(async () => {
      await result.current.execute();
    });

    expect(onError).toHaveBeenCalledWith(error);
  });
});

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    rerender({ value: 'second', delay: 500 });
    
    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('second');
  });

  it('should use custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 1000 } }
    );

    rerender({ value: 'second', delay: 1000 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('second');
  });
});
