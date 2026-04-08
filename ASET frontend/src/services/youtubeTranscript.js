/**
 * Client-side YouTube transcript fetcher
 * Works because browser has YouTube session cookies
 * No API key needed, no rate limits
 */

function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || null;
}

async function fetchTranscript(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube URL');

  // Step 1: Fetch the YouTube page to get caption track info
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    credentials: 'include',
    headers: { 'Accept-Language': 'en-US,en;q=0.9' }
  });

  if (!pageRes.ok) throw new Error('Could not load YouTube page');
  const html = await pageRes.text();

  // Step 2: Extract caption tracks from page data
  const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (!captionMatch) throw new Error('No captions available for this video');

  const tracks = JSON.parse(captionMatch[1].replace(/\\u0026/g, '&'));

  // Step 3: Find English track
  const enTrack = tracks.find(t => t.languageCode === 'en' && t.kind !== 'asr') ||
                  tracks.find(t => t.languageCode === 'en') ||
                  tracks.find(t => t.languageCode?.startsWith('en')) ||
                  tracks[0];

  if (!enTrack) throw new Error('No English captions found');

  // Step 4: Fetch the caption XML
  const captionRes = await fetch(enTrack.baseUrl);
  if (!captionRes.ok) throw new Error('Could not fetch captions');
  const xml = await captionRes.text();

  // Step 5: Parse XML to plain text
  const text = xml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (!text || text.length < 50) throw new Error('Transcript is empty');

  return { text, videoId, trackLanguage: enTrack.languageCode };
}

export { fetchTranscript, extractVideoId };
