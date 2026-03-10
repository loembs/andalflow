import { config } from '@/config/environment';

// Niveaux de log
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Interface pour le logger (Principe SOLID - Interface Segregation)
interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: Error, ...args: any[]): void;
}

// Implémentation du logger (Principe SOLID - Single Responsibility)
class Logger implements ILogger {
  private isEnabled(level: LogLevel): boolean {
    if (!config.app.debug) return false;
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    
    const currentLevel = levels[config.app.logLevel as LogLevel] || 1;
    return levels[level] >= currentLevel;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.isEnabled('debug')) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.isEnabled('info')) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.isEnabled('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (this.isEnabled('error')) {
      console.error(this.formatMessage('error', message), error, ...args);
    }
  }
}

// Instance singleton du logger
export const logger = new Logger();

// Hook personnalisé pour le logging dans les composants React
export const useLogger = (componentName: string) => {
  return {
    debug: (message: string, ...args: any[]) => 
      logger.debug(`[${componentName}] ${message}`, ...args),
    info: (message: string, ...args: any[]) => 
      logger.info(`[${componentName}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => 
      logger.warn(`[${componentName}] ${message}`, ...args),
    error: (message: string, error?: Error, ...args: any[]) => 
      logger.error(`[${componentName}] ${message}`, error, ...args),
  };
};
