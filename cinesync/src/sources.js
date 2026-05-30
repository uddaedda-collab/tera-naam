'use strict';

/**
 * CineSync - Source parsing utilities
 * --------------------------------------------------
 * Converts user-pasted links (YouTube, Google Drive, direct video URLs)
 * into a normalized media descriptor the player understands.
 *
 * Returned descriptor shape:
 * {
 *   type:  'youtube' | 'gdrive' | 'direct' | 'upload',
 *   id:    string|null,   // provider-specific id (youtube videoId / drive fileId)
 *   url:   string,        // playable url or embeddable url
 *   raw:   string,        // original input
 *   title: string|null
 * }
 */

/** Extract a YouTube video id from many possible URL formats. */
function parseYouTube(input) {
  if (typeof input !== 'string') return null;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = input.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

/** Extract a Google Drive file id from a share/preview/open link. */
function parseGoogleDrive(input) {
  if (typeof input !== 'string') return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([A-Za-z0-9_-]+)/,
    /drive\.google\.com\/uc\?(?:export=\w+&)?id=([A-Za-z0-9_-]+)/,
    /docs\.google\.com\/[^/]+\/d\/([A-Za-z0-9_-]+)/,
  ];
  for (const re of patterns) {
    const m = input.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

/**
 * Build a Google Drive preview URL that can be embedded in an iframe.
 * The /preview endpoint plays the file with Drive's own player.
 */
function driveEmbedUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Build a Google Drive direct-stream URL usable inside an HTML5 <video> tag.
 * Note: large/quota-limited files may require the iframe preview instead.
 */
function driveDirectUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/** Is this a plausible direct video file URL? */
function isDirectVideo(input) {
  if (typeof input !== 'string') return false;
  if (!/^https?:\/\//i.test(input)) return false;
  // Common video extensions, optionally followed by query string.
  return /\.(mp4|webm|ogg|ogv|m4v|mov|mkv|m3u8|mpd)(\?.*)?$/i.test(input);
}

/**
 * Main entry point. Normalize any supported input into a media descriptor.
 * Returns null when the input cannot be understood.
 */
function parseSource(input, opts = {}) {
  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  const yt = parseYouTube(raw);
  if (yt) {
    return {
      type: 'youtube',
      id: yt,
      url: `https://www.youtube.com/watch?v=${yt}`,
      raw,
      title: opts.title || null,
    };
  }

  const drive = parseGoogleDrive(raw);
  if (drive) {
    return {
      type: 'gdrive',
      id: drive,
      url: driveEmbedUrl(drive),
      directUrl: driveDirectUrl(drive),
      raw,
      title: opts.title || null,
    };
  }

  if (isDirectVideo(raw)) {
    return {
      type: 'direct',
      id: null,
      url: raw,
      raw,
      title: opts.title || null,
    };
  }

  // Generic https URL that isn't recognized: still allow as direct attempt.
  if (/^https?:\/\//i.test(raw)) {
    return {
      type: 'direct',
      id: null,
      url: raw,
      raw,
      title: opts.title || null,
      unverified: true,
    };
  }

  return null;
}

/** Build a descriptor for a server-uploaded file. */
function uploadSource(filename, originalName) {
  return {
    type: 'upload',
    id: filename,
    url: `/uploads/${filename}`,
    raw: filename,
    title: originalName || filename,
  };
}

module.exports = {
  parseYouTube,
  parseGoogleDrive,
  driveEmbedUrl,
  driveDirectUrl,
  isDirectVideo,
  parseSource,
  uploadSource,
};
