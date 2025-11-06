// lib/logger.ts
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  static log(entry: LogEntry) {
    // Send to external logging service or console
    console.log(JSON.stringify(entry));
  }

  static info(message: string, metadata?: Record<string, any>) {
    this.log({ 
      timestamp: new Date().toISOString(), 
      level: 'info', 
      message, 
      metadata 
    });
  }

  static warn(message: string, metadata?: Record<string, any>) {
    this.log({ 
      timestamp: new Date().toISOString(), 
      level: 'warn', 
      message, 
      metadata 
    });
  }

  static error(message: string, metadata?: Record<string, any>) {
    this.log({ 
      timestamp: new Date().toISOString(), 
      level: 'error', 
      message, 
      metadata 
    });
  }

  static debug(message: string, metadata?: Record<string, any>) {
    this.log({ 
      timestamp: new Date().toISOString(), 
      level: 'debug', 
      message, 
      metadata 
    });
  }
}