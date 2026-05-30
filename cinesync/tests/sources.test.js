'use strict';

const {
  parseYouTube,
  parseGoogleDrive,
  driveEmbedUrl,
  isDirectVideo,
  parseSource,
  uploadSource,
} = require('../src/sources');

describe('parseYouTube', () => {
  test('watch URL', () => {
    expect(parseYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  test('short youtu.be URL', () => {
    expect(parseYouTube('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  test('embed URL', () => {
    expect(parseYouTube('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  test('shorts URL', () => {
    expect(parseYouTube('https://www.youtube.com/shorts/abc12345678')).toBe('abc12345678');
  });
  test('URL with extra query params', () => {
    expect(parseYouTube('https://www.youtube.com/watch?list=PL&v=dQw4w9WgXcQ&t=10s')).toBe('dQw4w9WgXcQ');
  });
  test('non-youtube returns null', () => {
    expect(parseYouTube('https://vimeo.com/12345')).toBeNull();
    expect(parseYouTube(123)).toBeNull();
  });
});

describe('parseGoogleDrive', () => {
  test('file/d/ URL', () => {
    expect(parseGoogleDrive('https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing')).toBe('1A2B3C4D5E');
  });
  test('open?id= URL', () => {
    expect(parseGoogleDrive('https://drive.google.com/open?id=1A2B3C4D5E')).toBe('1A2B3C4D5E');
  });
  test('uc?id= URL', () => {
    expect(parseGoogleDrive('https://drive.google.com/uc?export=download&id=1A2B3C4D5E')).toBe('1A2B3C4D5E');
  });
  test('embed url builder', () => {
    expect(driveEmbedUrl('XYZ')).toBe('https://drive.google.com/file/d/XYZ/preview');
  });
});

describe('isDirectVideo', () => {
  test.each([
    ['https://example.com/movie.mp4', true],
    ['https://example.com/movie.webm', true],
    ['https://cdn.example.com/stream.m3u8?token=abc', true],
    ['https://example.com/page.html', false],
    ['ftp://example.com/movie.mp4', false],
    ['not a url', false],
  ])('%s -> %s', (input, expected) => {
    expect(isDirectVideo(input)).toBe(expected);
  });
});

describe('parseSource', () => {
  test('detects youtube', () => {
    const s = parseSource('https://youtu.be/dQw4w9WgXcQ');
    expect(s.type).toBe('youtube');
    expect(s.id).toBe('dQw4w9WgXcQ');
  });
  test('detects google drive and builds preview + direct', () => {
    const s = parseSource('https://drive.google.com/file/d/FILEID123/view');
    expect(s.type).toBe('gdrive');
    expect(s.url).toContain('/preview');
    expect(s.directUrl).toContain('export=download');
  });
  test('detects direct mp4', () => {
    const s = parseSource('https://example.com/a.mp4');
    expect(s.type).toBe('direct');
  });
  test('unknown https is direct+unverified', () => {
    const s = parseSource('https://example.com/whatever');
    expect(s.type).toBe('direct');
    expect(s.unverified).toBe(true);
  });
  test('garbage returns null', () => {
    expect(parseSource('   ')).toBeNull();
    expect(parseSource('hello world')).toBeNull();
    expect(parseSource(null)).toBeNull();
  });
  test('passes title through', () => {
    const s = parseSource('https://youtu.be/dQw4w9WgXcQ', { title: 'Our Song' });
    expect(s.title).toBe('Our Song');
  });
});

describe('uploadSource', () => {
  test('builds upload descriptor', () => {
    const s = uploadSource('123-abc.mp4', 'date-night.mp4');
    expect(s.type).toBe('upload');
    expect(s.url).toBe('/uploads/123-abc.mp4');
    expect(s.title).toBe('date-night.mp4');
  });
});
