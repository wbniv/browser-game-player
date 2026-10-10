// One host per frame; callers own site navigation and game selection.
let sequence = 0;
export function mountPlayer(target, options) {
  if (!(target instanceof HTMLElement)) throw TypeError('A host element is required');
  const source = new URL(options.src, location.href);
  if (source.origin !== location.origin) throw Error('This release requires a same-origin player frame');
  let id = 'bgp-' + (++sequence) + '-' + crypto.randomUUID();
  source.searchParams.set('instance', id);
  const frame = document.createElement('iframe');
  frame.title = options.title || 'Browser game player';
  frame.className = options.className || '';
  frame.allow = 'fullscreen; autoplay; gamepad'; frame.allowFullscreen = true;
  frame.loading = options.loading || 'eager'; frame.src = source.href;
  let destroyed = false;
  let current = 'idle', connected = false;
  let pending = [];
  const controller = new AbortController();
  function command(command, extra = {}) {
    if (destroyed) throw Error('Player has been destroyed');
    if (!connected) { pending.push([command,extra]); return; }
    frame.contentWindow?.postMessage({ type: 'browser-game-player', protocol: 1, instanceId: id, command, ...extra }, source.origin);
  }
  window.addEventListener('message', event => {
    const data = event.data;
    if (destroyed || event.source !== frame.contentWindow || event.origin !== source.origin || !data || data.type !== 'browser-game-player' || data.protocol !== 1 || data.instanceId !== id) return;
    if (data.event === 'height') {
      if (options.autoHeight !== false && Number.isFinite(data.height) && data.height >= 200 && data.height <= 2400) frame.style.height = Math.ceil(data.height) + 'px';
      return;
    }
    if (!['idle', 'loading', 'ready', 'running', 'paused', 'error'].includes(data.event)) return;
    if (data.detail != null && (typeof data.detail !== 'string' || data.detail.length > 4000)) return;
    if (data.event === 'idle') { connected = true; const queued=pending;pending=[];queued.forEach(([name,extra])=>command(name,extra)); }
    current = data.event;
    target.dispatchEvent(new CustomEvent('player-state', { detail: { state: current, instanceId: id, detail: data.detail } }));
  }, { signal: controller.signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) command('pause'); // Resume requires a focused gesture.
  }, { signal: controller.signal });
  target.replaceChildren(frame);
  return {
    frame, get instanceId() { return id; }, get state() { return current; },
    start: () => command('start'), pause: () => command('pause'), resume: () => command('resume'),
    restart() { if (confirm(options.restartPrompt || 'Restart the game? Current progress will be lost.')) command('restart', { confirmed: true }); },
    setSource(src) {
      if (destroyed) throw Error('Player has been destroyed');
      const next = new URL(src, location.href);
      if (next.origin !== source.origin) throw Error('Changing player origin is unsupported');
      next.searchParams.set('instance',id);
      if (frame.src !== next.href) { id='bgp-'+(++sequence)+'-'+crypto.randomUUID();next.searchParams.set('instance',id);connected=false;pending=[];current='idle';frame.src=next.href; }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true; controller.abort(); frame.remove(); pending = []; current = 'disposed';
      if (target.player?.frame === frame) delete target.player;
    }
  };
}
export function connectPlayers(root = document) {
  const handles = [];
  root.querySelectorAll('[data-browser-game-player]').forEach(host => {
    if (host.player) return;
    host.player = mountPlayer(host, { src: host.dataset.src, title: host.dataset.title, className: host.dataset.frameClass, autoHeight: host.dataset.autoHeight !== 'false' });
    handles.push(host.player);
  });
  return handles;
}
