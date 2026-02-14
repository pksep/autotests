import { createLogger, format, transports } from 'winston'; // Import necessary modules from Winston for logging
import DailyRotateFile from 'winston-daily-rotate-file'; // Import DailyRotateFile transport for rotating log files
import fs from 'fs'; // Import fs module to check and create directories
import path from 'path'; // Import path module for working with file and directory paths

// Import ENV configuration (from project root config)
import { ENV } from '../../config';

// Ensure the logs directory exists, creating it if necessary
const logsDir = path.resolve('logs'); // Define the path for the logs directory
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir); // Create the directory if it doesn't exist
}

// All log levels driven by ENV.LOG_LEVEL (set in config.ts or LOG_LEVEL env var)
const logLevel = ENV.LOG_LEVEL;

// Transport for general info and debug logs, rotating daily
const infoTransport = new DailyRotateFile({
    dirname: path.join(logsDir, 'info'), // Directory for info logs
    filename: 'info-%DATE%.log', // Filename pattern for info logs with date
    datePattern: 'YYYY-MM-DD', // Date format for the log file names
    zippedArchive: true, // Compress old log files
    maxSize: '20m', // Maximum log file size before rotating
    maxFiles: '14d', // Retain logs for 14 days
    level: logLevel,
});

// Transport for warnings and errors, rotating daily
const errorTransport = new DailyRotateFile({
    dirname: path.join(logsDir, 'errors'), // Directory for error logs
    filename: 'error-%DATE%.log', // Filename pattern for error logs with date
    datePattern: 'YYYY-MM-DD', // Date format for the log file names
    zippedArchive: true, // Compress old log files
    maxSize: '20m', // Maximum log file size before rotating
    maxFiles: '14d', // Retain logs for 14 days
    level: 'error', // Log level for this transport (error and above)
});

// Console output uses the same LOG_LEVEL you set in config
const consoleTransport = new transports.Console({
    level: logLevel,
    format: format.combine(
        format.colorize(), // Adds color to console output based on log level
        format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`) // Log format for console output
    ),
});

// Logger configuration, combining multiple transports
const logger = createLogger({
    level: logLevel,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamp format for logs
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`) // Log message format
    ),
    transports: [
        infoTransport, // Transport for info and debug level logs based on ENV.DEBUG
        errorTransport, // Transport for error level logs
        consoleTransport, // Transport for console output based on ENV.DEBUG
    ],
});

// Expose .log(message, ...meta) for general messages (same as info).
// Winston's .log(level, msg) expects LogEntry, so we export a wrapper with .log(message: string, ...meta).
export interface LoggerWithLog {
    log(message: string, ...meta: any[]): void;
    info: typeof logger.info;
    warn: typeof logger.warn;
    error: typeof logger.error;
    debug: typeof logger.debug;
}
const appLogger: LoggerWithLog = {
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    debug: logger.debug.bind(logger),
    log: (message: string, ...meta: any[]) => { logger.info(message, ...meta); },
};

export default appLogger; // Export the logger for use in other files
