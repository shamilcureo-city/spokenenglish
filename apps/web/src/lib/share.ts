/**
 * The growth engine's payload: a shareable "win" the learner sends to friends
 * (WhatsApp first — it's how India shares). Each share is a branded object that
 * carries the app name + URL, so a friend's win becomes the next user's
 * curiosity. This is the K-factor lever (see GROWTH.md / MASTERPLAN.md Phase 2).
 *
 * We render the win to a real PNG on a <canvas> (no heavy html-to-image dep) and
 * share it via the Web Share API with files; we fall back to a WhatsApp text
 * link, then the clipboard, so it always does *something* on every device.
 */

import { COACH_NAME } from '@fluentmap/core/conversation';
import { APP_SHARE_URL } from './constants';

export type WinKind = 'lesson' | 'levelup' | 'unit' | 'streak' | 'warmup';

export interface Win {
  kind: WinKind;
  /** Lesson / unit title, when relevant. */
  title?: string;
  /** 1–3 stars for a lesson result. */
  stars?: number;
  /** XP earned this session. */
  xp?: number;
  /** Current streak in days. */
  streak: number;
  /** Current level. */
  level: number;
}

export type ShareResult = 'shared' | 'dismissed' | 'whatsapp' | 'copied' | 'unavailable';

/* ── headlines ────────────────────────────────────────────────────────────── */

function headline(win: Win): { emoji: string; line: string; sub?: string } {
  switch (win.kind) {
    case 'levelup':
      return { emoji: '⚡', line: `Level ${win.level} unlocked!`, sub: 'My spoken English is levelling up' };
    case 'unit':
      return { emoji: '🏆', line: 'Unit complete!', sub: win.title };
    case 'streak':
      return { emoji: '🔥', line: `${win.streak}-day speaking streak!`, sub: 'Showing up every day' };
    case 'warmup':
      return { emoji: '🎙️', line: 'Another day speaking English!', sub: `A real chat with ${COACH_NAME}` };
    case 'lesson':
    default: {
      const s = win.stars ?? 0;
      return {
        emoji: s >= 3 ? '🌟' : '✅',
        line: s >= 3 ? 'Nailed a 3-star lesson!' : 'Finished a speaking lesson!',
        sub: win.title,
      };
    }
  }
}

/** The WhatsApp / clipboard text — carries the URL so the loop closes. */
export function buildShareText(win: Win): string {
  const h = headline(win);
  const bits: string[] = [];
  if (win.streak > 0) bits.push(`🔥 ${win.streak}-day streak`);
  if (typeof win.xp === 'number' && win.xp > 0) bits.push(`+${win.xp} XP`);
  const stats = bits.length ? ` (${bits.join(' · ')})` : '';
  return (
    `${h.emoji} ${h.line}${stats} on Speakwell — I'm learning to speak English by actually *talking*, ` +
    `with an AI partner called ${COACH_NAME}. Come practise with me: ${APP_SHARE_URL}`
  );
}

/** Invite-a-friend ("practise with me") — the second growth loop. */
export function buildInviteText(name?: string): string {
  const who = name?.trim() ? `${name.trim()} here! ` : '';
  return (
    `${who}I'm practising spoken English on Speakwell — short daily chats with an AI partner (${COACH_NAME}), ` +
    `feedback in our own language. Let's keep each other going 👇 ${APP_SHARE_URL}`
  );
}

/* ── canvas card ──────────────────────────────────────────────────────────── */

const SIZE = 1080;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Render the win to a 1080×1080 PNG File, ready for navigator.share. */
export async function renderWinCard(win: Win): Promise<File | null> {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background — the app's near-black with an emerald glow.
  ctx.fillStyle = '#0b0d12';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const glow = ctx.createRadialGradient(SIZE / 2, 250, 60, SIZE / 2, 250, 760);
  glow.addColorStop(0, 'rgba(52, 211, 153, 0.20)');
  glow.addColorStop(1, 'rgba(52, 211, 153, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  ctx.textAlign = 'center';

  // Wordmark: emerald "S" tile + "Speakwell".
  const tile = 64;
  ctx.font = `800 44px ${FONT}`;
  const wordW = ctx.measureText('Speakwell').width; // measured with the wordmark font set
  const groupW = tile + 20 + wordW;
  const gx = cx - groupW / 2;
  const tileY = 96;
  const tg = ctx.createLinearGradient(gx, tileY, gx + tile, tileY + tile);
  tg.addColorStop(0, '#34d399');
  tg.addColorStop(1, '#5eead4');
  ctx.fillStyle = tg;
  roundRect(ctx, gx, tileY, tile, tile, 16);
  ctx.fill();
  ctx.fillStyle = '#0b0d12';
  ctx.font = `900 38px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('S', gx + tile / 2, tileY + tile / 2 + 2);
  ctx.fillStyle = '#e6e8ee';
  ctx.font = `800 44px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText('Speakwell', gx + tile + 20, tileY + tile / 2 + 1);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const h = headline(win);

  // Big emoji.
  ctx.font = `300 150px ${FONT}`;
  ctx.fillText(h.emoji, cx, 400);

  // Headline (wrapped).
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 76px ${FONT}`;
  const hLines = wrap(ctx, h.line, SIZE - 200);
  let y = 510;
  for (const line of hLines) {
    ctx.fillText(line, cx, y);
    y += 88;
  }

  // Subtitle.
  if (h.sub) {
    ctx.fillStyle = 'rgba(230,232,238,0.65)';
    ctx.font = `500 38px ${FONT}`;
    const sLines = wrap(ctx, h.sub, SIZE - 240);
    y += 6;
    for (const line of sLines.slice(0, 2)) {
      ctx.fillText(line, cx, y);
      y += 50;
    }
  }

  // Stats pills row: stars · +XP · streak.
  const pills: string[] = [];
  if (typeof win.stars === 'number' && win.stars > 0) {
    pills.push('★'.repeat(win.stars) + '☆'.repeat(Math.max(0, 3 - win.stars)));
  }
  if (typeof win.xp === 'number' && win.xp > 0) pills.push(`+${win.xp} XP`);
  if (win.streak > 0) pills.push(`🔥 ${win.streak}-day`);

  if (pills.length) {
    ctx.font = `700 40px ${FONT}`;
    const padX = 34;
    const gap = 24;
    const ph = 84;
    const widths = pills.map((p) => ctx.measureText(p).width + padX * 2);
    const totalW = widths.reduce((a, b) => a + b, 0) + gap * (pills.length - 1);
    let px = cx - totalW / 2;
    const py = Math.max(y + 40, 720);
    pills.forEach((p, i) => {
      const w = widths[i]!;
      ctx.fillStyle = 'rgba(52,211,153,0.14)';
      roundRect(ctx, px, py, w, ph, ph / 2);
      ctx.fill();
      ctx.fillStyle = '#a7f3d0';
      ctx.textBaseline = 'middle';
      ctx.fillText(p, px + w / 2, py + ph / 2 + 2);
      ctx.textBaseline = 'alphabetic';
      px += w + gap;
    });
  }

  // Footer CTA band.
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, 80, SIZE - 200, SIZE - 160, 120, 28);
  ctx.fill();
  ctx.fillStyle = '#e6e8ee';
  ctx.font = `700 36px ${FONT}`;
  ctx.fillText('Learn to speak English by talking', cx, SIZE - 138);
  ctx.fillStyle = '#5eead4';
  ctx.font = `600 32px ${FONT}`;
  ctx.fillText(APP_SHARE_URL.replace(/^https?:\/\//, ''), cx, SIZE - 100);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
  if (!blob) return null;
  return new File([blob], 'speakwell-win.png', { type: 'image/png' });
}

/* ── share actions ────────────────────────────────────────────────────────── */

function openWhatsApp(text: string): boolean {
  try {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    return w != null; // null ⇒ popup blocked — report failure so we fall through to clipboard
  } catch {
    return false;
  }
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Share a win. Prefer the native share sheet with the rendered image (the richest
 * viral object); fall back to a WhatsApp text link, then the clipboard.
 *
 * Pass a pre-rendered `file` (rendered while the screen mounts) so the click stays
 * inside the user-gesture window — iOS Safari rejects navigator.share otherwise.
 */
export async function shareWin(win: Win, file?: File | null): Promise<ShareResult> {
  const text = buildShareText(win);

  // 1) Richest: the native sheet WITH the image. Only render the card when the
  //    platform can actually share files — otherwise the async render would burn
  //    the user-gesture window and get the WhatsApp fallback popup-blocked.
  if (typeof navigator.canShare === 'function') {
    const img = file ?? (await renderWinCard(win));
    if (img && navigator.canShare({ files: [img] })) {
      try {
        await navigator.share({ files: [img], text, title: 'Speakwell' });
        return 'shared';
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return 'dismissed'; // user backed out
        // else fall through to the link fallbacks
      }
    }
  }

  // 2) Native sheet, text only.
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text, title: 'Speakwell', url: APP_SHARE_URL });
      return 'shared';
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'dismissed';
    }
  }

  // 3) WhatsApp deep link, then 4) clipboard. (No await reached this point on the
  //    no-Web-Share path, so window.open stays inside the click gesture.)
  if (openWhatsApp(text)) return 'whatsapp';
  if (await copy(text)) return 'copied';
  return 'unavailable';
}

/** Invite a friend to practise (text-only loop). */
export async function shareInvite(name?: string): Promise<ShareResult> {
  const text = buildInviteText(name);
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text, title: 'Speakwell', url: APP_SHARE_URL });
      return 'shared';
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'dismissed';
    }
  }
  if (openWhatsApp(text)) return 'whatsapp';
  if (await copy(text)) return 'copied';
  return 'unavailable';
}
