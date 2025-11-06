import { Logger } from '@/lib/logger';

// Mock console.log to test that it's called appropriately
const mockConsoleLog = jest.fn();
const originalConsoleLog = console.log;

describe('Logger Service', () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    jest.clearAllMocks();
  });

  it('should log info messages with correct structure', () => {
    const message = 'Test info message';
    const metadata = { userId: '123', action: 'login' };

    Logger.info(message, metadata);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"level":"info"')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test info message"')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"userId":"123"')
    );
  });

  it('should log warn messages with correct structure', () => {
    const message = 'Test warning message';

    Logger.warn(message);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"level":"warn"')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test warning message"')
    );
  });

  it('should log error messages with correct structure', () => {
    const message = 'Test error message';
    const metadata = { error_code: 'E001', component: 'auth' };

    Logger.error(message, metadata);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"level":"error"')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test error message"')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"error_code":"E001"')
    );
  });

  it('should log debug messages with correct structure', () => {
    const message = 'Test debug message';

    Logger.debug(message);

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"level":"debug"')
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Test debug message"')
    );
  });

  it('should include timestamp in log entries', () => {
    const message = 'Test timestamp';

    Logger.info(message);

    const loggedString = mockConsoleLog.mock.calls[0][0];
    const parsed = JSON.parse(loggedString);
    expect(parsed.timestamp).toBeDefined();
    expect(Date.parse(parsed.timestamp)).not.toBeNaN(); // Verify it's a valid date string
  });

  it('should generate different timestamps for successive calls', async () => {
    // Add a small delay between calls to test different timestamps
    Logger.info('First message');
    // Create a short pause for timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    Logger.info('Second message');

    const [firstCall, secondCall] = mockConsoleLog.mock.calls;
    const firstLogged = JSON.parse(firstCall[0]);
    const secondLogged = JSON.parse(secondCall[0]);

    // Verify that both have timestamps and they are different
    expect(firstLogged.timestamp).toBeDefined();
    expect(secondLogged.timestamp).toBeDefined();
    expect(firstLogged.timestamp).not.toBe(secondLogged.timestamp);
  });

  it('should handle empty metadata', () => {
    const message = 'Test message without metadata';

    Logger.info(message);

    const loggedString = mockConsoleLog.mock.calls[0][0];
    const parsed = JSON.parse(loggedString);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test message without metadata');
    // metadata should be undefined or not present
  });

  it('should handle null and undefined values in metadata', () => {
    const message = 'Test message with null metadata';
    const metadata = { 
      valid_value: 'exists', 
      null_value: null, 
      undefined_value: undefined as any,
      nested: { 
        prop: 'value', 
        null_prop: null 
      } 
    };

    Logger.info(message, metadata);

    const loggedString = mockConsoleLog.mock.calls[0][0];
    const parsed = JSON.parse(loggedString);
    
    // The logged json should contain the valid values
    expect(parsed.metadata.valid_value).toBe('exists');
    // Null values are typically serialized as 'null' in JSON
    expect(parsed.metadata.null_value).toBeNull();
    // Undefined values are usually omitted from JSON
    expect('undefined_value' in parsed.metadata).toBeFalsy();
    expect(parsed.metadata.nested.prop).toBe('value');
    expect(parsed.metadata.nested.null_prop).toBeNull();
  });
});