// utils/logger.js
import chalk from 'chalk';

/**
 * Logger estilizado para consola
 * Permite mostrar mensajes con diferentes niveles (info, warn, error, success)
 */
const log = {
  info: (msg) => console.log(`${chalk.blue('[INFO]:')} ${chalk.white(msg)}`),
  success: (msg) => console.log(`${chalk.green('[OK]:')} ${chalk.white(msg)}`),
  warn: (msg) => console.log(`${chalk.yellow('[WARN]:')} ${chalk.white(msg)}`),
  error: (msg) => console.log(`${chalk.red('[ERROR]:')} ${chalk.white(msg)}`),
  custom: (label, color, msg) =>
    console.log(`${chalk[color].bold(label)} ${chalk.white(msg)}`),
};

export default log;
