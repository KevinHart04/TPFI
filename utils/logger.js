// utils/logger.js
import chalk from 'chalk';

/**
 * Logger estilizado para consola
 * Permite mostrar mensajes con diferentes niveles (info, warn, error, success)
 */
const log = {
  info: (...msgs) => console.log(`${chalk.blue('[INFO]:')}`, ...msgs),
  success: (...msgs) => console.log(`${chalk.green('[OK]:')}`, ...msgs),
  warn: (...msgs) => console.log(`${chalk.yellow('[WARN]:')}`, ...msgs),
  error: (...msgs) => console.log(`${chalk.red('[ERROR]:')}`, ...msgs),
  custom: (label, color, msg) =>
    console.log(`${chalk[color].bold(label)} ${chalk.white(msg)}`),
};

export default log;
