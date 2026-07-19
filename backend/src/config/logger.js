const env = require('./environment');

const levels = ['error', 'warn', 'info', 'debug', 'verbose'];
const currentLevel = env.isProd ? 'info' : 'debug';
const levelRank = levels.indexOf(currentLevel);

function stamp() {
  return new Date().toISOString();
}

function write(level, args) {
  if (levels.indexOf(level) > levelRank) return;
  const parts = args.map((a) => {
    if (a instanceof Error) return a.stack || a.message;
    if (typeof a === 'object') {
      try { return JSON.stringify(a); } catch { return String(a); }
    }
    return String(a);
  });
  const out = `[${stamp()}] [${level.toUpperCase()}] ${parts.join(' ')}`;
  if (level === 'error') console.error(out);
  else if (level === 'warn') console.warn(out);
  else console.log(out);
}

const logger = {
  error: (...a) => write('error', a),
  warn: (...a) => write('warn', a),
  info: (...a) => write('info', a),
  debug: (...a) => write('debug', a),
  verbose: (...a) => write('verbose', a),
};

module.exports = logger;
