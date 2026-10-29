export const PROTOCOL = 1;
export const PLAYER_VERSION = '0.1.9';
// Built-in Play-button icons; a play triangle is interleaved before each one.
export const PLAY_ICONS = ['temple', 'controller', 'cube'];
const code = /^(Arrow(Up|Down|Left|Right)|Key[A-Z]|Space|Digit[0-9]|Numpad[0-9]|Numpad(Add|Subtract|Multiply|Divide|Decimal|Enter)|Enter|ShiftLeft|ShiftRight)$/;
const text = (value, name, limit = 4000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > limit) throw Error(`Invalid ${name}`);
  return value;
};
function link(value, name) {
  text(value, name);
  const url = new URL(value, 'https://player.invalid/');
  if (!['https:', 'http:'].includes(url.protocol)) throw Error(`Invalid ${name} URL`);
  return value;
}
export function validateConfig(input) {
  if (!input || input.schema !== 1 || !['manual', 'auto'].includes(input.startMode)) throw Error('Invalid player config schema/startMode');
  const config = structuredClone(input);
  if (!['worldfoundry', 'snes'].includes(config.adapter)) throw Error('Invalid adapter');
  text(config.title, 'title', 200);
  text(config.subtitle, 'subtitle');
  text(config.status, 'status');
  text(config.canvasLabel, 'canvasLabel');
  text(config.restartPrompt, 'restartPrompt');
  text(config.fallbackLabel, 'fallbackLabel');
  link(config.fallbackUrl, 'fallbackUrl');
  if (config.poster != null && config.poster !== 'title-preview.jpg') throw Error('Invalid poster name');
  if (typeof config.fullscreenOnPlay !== 'boolean') throw Error('Invalid fullscreenOnPlay');
  if (!Array.isArray(config.arguments) || !config.arguments.every(arg => typeof arg === 'string' && arg.length < 4096)) throw Error('Invalid runtime arguments');
  if (!Array.isArray(config.help) || !config.help.length || config.help.length > 20) throw Error('Invalid help');
  config.help.forEach(value => text(value, 'help'));
  if (!Array.isArray(config.actions) || config.actions.length < 1 || config.actions.length > 12) throw Error('One to twelve actions are required');
  for (const action of config.actions) {
    if (!code.test(action.code)) throw Error('Invalid action code');
    text(action.label, 'action label', 100); text(action.caption, 'action caption', 30);
  }
  if (config.motionCode != null && !code.test(config.motionCode)) throw Error('Invalid motion code');
  if (config.playIcons != null && (!Array.isArray(config.playIcons) || !config.playIcons.length || config.playIcons.length > PLAY_ICONS.length
    || !config.playIcons.every(id => PLAY_ICONS.includes(id)) || new Set(config.playIcons).size !== config.playIcons.length)) throw Error('Invalid play icons');
  if (config.adapter === 'snes' && (!/^[a-zA-Z0-9_-]+$/.test(config.game) || !Array.isArray(config.games) || !config.games.includes(config.game) || !config.games.every(id => /^[a-zA-Z0-9_-]+$/.test(id)))) throw Error('Invalid SNES game allowlist');
  if (config.verifyLabels != null) {
    if (config.adapter !== 'snes' || typeof config.verifyLabels !== 'object' || Array.isArray(config.verifyLabels)) throw Error('Invalid verification labels');
    for (const [id,label] of Object.entries(config.verifyLabels)) { if(!config.games.includes(id)) throw Error('Unknown verification game'); text(label,'verification label',100); }
  }
  if (config.previews != null && (!Array.isArray(config.previews) || !config.previews.every(id => config.games?.includes(id)))) throw Error('Invalid previews');
  if (config.levels != null) {
    if (!config.levels || typeof config.levels !== 'object' || Array.isArray(config.levels)) throw Error('Invalid levels');
    for (const [slug, level] of Object.entries(config.levels)) {
      if (!level || Object.keys(level).some(key => !['title','arguments'].includes(key))) throw Error('Invalid level fields');
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) throw Error('Invalid level slug');
      text(level.title, 'level title', 200);
      if (!Array.isArray(level.arguments) || !level.arguments.every(arg => typeof arg === 'string' && arg.length < 4096)) throw Error('Invalid level arguments');
    }
    if (!Object.hasOwn(config.levels, config.defaultLevel)) throw Error('Invalid default level');
  }
  return config;
}
export function resolveLevel(config, search = '') {
  if (!config.levels) return config;
  const wanted = new URLSearchParams(search).get('level');
  const slug = Object.hasOwn(config.levels, wanted) ? wanted : config.defaultLevel;
  return { ...config, ...config.levels[slug], level: slug };
}
