import { createLogger, format, transports } from 'winston'; // Import necessary modules from Winston for logging
import DailyRotateFile from 'winston-daily-rotate-file'; // Import DailyRotateFile transport for rotating log files
import fs from 'fs'; // Import fs module to check and create directories
import path from 'path'; // Import path module for working with file and directory paths

// Import ENV configuration
import { ENV } from '../config'; // Update the path to your actual config file location

// Ensure the logs directory exists, creating it if necessary
const logsDir = path.resolve('logs'); // Define the path for the logs directory
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir); // Create the directory if it doesn't exist
}

// Transport for general info and debug logs, rotating daily
const infoTransport = new DailyRotateFile({
    dirname: path.join(logsDir, 'info'), // Directory for info logs
    filename: 'info-%DATE%.log', // Filename pattern for info logs with date
    datePattern: 'YYYY-MM-DD', // Date format for the log file names
    zippedArchive: true, // Compress old log files
    maxSize: '20m', // Maximum log file size before rotating
    maxFiles: '14d', // Retain logs for 14 days
    level: ENV.DEBUG ? 'debug' : 'info', // Log level for this transport based on ENV.DEBUG
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

// Transport for console output, with colored logs
const consoleTransport = new transports.Console({
    level: ENV.DEBUG ? 'debug' : 'warn', // Set log level to 'debug' if ENV.DEBUG is true, otherwise 'warn'
    format: format.combine(
        format.colorize(), // Adds color to console output based on log level
        format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`) // Log format for console output
    ),
});

// Logger configuration, combining multiple transports
const logger = createLogger({
    level: ENV.DEBUG ? 'debug' : 'info', // Default log level based on ENV.DEBUG
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

export default logger; // Export the logger for use in other files
