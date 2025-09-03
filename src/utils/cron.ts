// src/utils/cron.ts
/**
 * Validates a cron expression
 * @param cronExpression The cron expression to validate
 * @returns True if valid, false otherwise
 */
export const isValidCronExpression = (cronExpression: string): boolean => {
  // This is a simple validation, a more robust implementation would be more complex
  // Basic format: * * * * * (minute hour day month dayOfWeek)
  const cronRegex = /^(\*|[0-9]+|\*\/[0-9]+|[0-9]+-[0-9]+|[0-9]+,[0-9]+)(\s+(\*|[0-9]+|\*\/[0-9]+|[0-9]+-[0-9]+|[0-9]+,[0-9]+)){4}$/;
  return cronRegex.test(cronExpression);
};

/**
 * Returns a human-readable description of a cron expression
 * @param cronExpression The cron expression to describe
 * @returns A human-readable description
 */
export const describeCronExpression = (cronExpression: string): string => {
  // This is a simplified implementation
  // A full implementation would require a more complex library
  const parts = cronExpression.split(' ');
  
  if (parts.length !== 5) {
    return 'Invalid cron expression';
  }
  
  const [minute, hour, day, month, dayOfWeek] = parts;
  
  // Simple descriptions
  if (cronExpression === '0 0 * * *') {
    return 'At 12:00 AM every day';
  }
  
  if (cronExpression === '0 9 * * *') {
    return 'At 9:00 AM every day';
  }
  
  if (cronExpression === '0 0 * * 0') {
    return 'At 12:00 AM every Sunday';
  }
  
  if (cronExpression === '0 0 1 * *') {
    return 'At 12:00 AM on the 1st of every month';
  }
  
  return `Runs at ${minute} minutes past hour ${hour} on day ${day} of month ${month} and day ${dayOfWeek} of week`;
};