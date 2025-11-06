import { retryWithBackoff } from '@/lib/utils/retry-with-backoff';

describe('Retry Utility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should successfully return result on first try', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(mockFn, 3, 100);

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockRejectedValueOnce(new Error('Second attempt failed'))
      .mockResolvedValue('Success on third attempt');

    // Start the async operation
    const promise = retryWithBackoff(mockFn, 3, 100);

    // Advance timers to trigger the first retry
    await jest.advanceTimersByTimeAsync(100);
    // Advance timers to trigger the second retry
    await jest.advanceTimersByTimeAsync(400); // 100ms * 2^1 = 200ms + some random factor

    const result = await promise;
    expect(result).toBe('Success on third attempt');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max retries are exceeded', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

    const promise = retryWithBackoff(mockFn, 3, 100);

    // Advance timers for all 3 retries
    await jest.advanceTimersByTimeAsync(100); // First retry after 100ms
    await jest.advanceTimersByTimeAsync(400); // Second retry after 400ms (2^1 * base_delay)
    await jest.advanceTimersByTimeAsync(900); // Third retry after ~900ms (2^2 * base_delay with jitter)

    await expect(promise).rejects.toThrow('Always fails');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff timing', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failed'))
      .mockResolvedValue('Success');

    // Start the function
    const promise = retryWithBackoff(mockFn, 3, 1000);

    // First call happens immediately
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Advance timers to trigger first retry (should be around 1000ms)
    await jest.advanceTimersByTimeAsync(1000);
    expect(mockFn).toHaveBeenCalledTimes(2);

    // Advance timers to trigger second retry (should be around 4000ms)
    await jest.advanceTimersByTimeAsync(4000);
    expect(mockFn).toHaveBeenCalledTimes(3);

    const result = await promise;
    expect(result).toBe('Success');
  });

  it('should handle synchronous errors', async () => {
    const mockFn = jest.fn().mockImplementation(() => {
      throw new Error('Sync error');
    });

    const promise = retryWithBackoff(mockFn, 2, 100);

    await jest.advanceTimersByTimeAsync(100); // First retry

    await expect(promise).rejects.toThrow('Sync error');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should handle async errors that reject', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Async error'));

    const promise = retryWithBackoff(mockFn, 2, 100);

    await jest.advanceTimersByTimeAsync(100); // First retry

    await expect(promise).rejects.toThrow('Async error');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});