import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export interface ClipSegment {
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
  score: number; // 0-1 engagement score
}

export interface ExtractedClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  text: string;
  filename: string;
  filePath: string;
}

/**
 * Score a transcript segment for "clip potential" based on:
 * - Length (30-90 seconds is ideal)
 * - Presence of impactful words
 * - Question marks (engagement hooks)
 * - Exclamation marks
 * - Capitalization ratio
 */
function scoreSegment(text: string, duration: number): number {
  // Ideal duration for short-form clips
  const idealMin = 30;
  const idealMax = 90;
  let score = 0.5;

  // Duration score: prefer 30-90 seconds
  if (duration >= idealMin && duration <= idealMax) {
    score += 0.3 * (1 - Math.abs(duration - 60) / 60);
  } else if (duration < idealMin) {
    score -= 0.2 * (idealMin - duration) / idealMin;
  } else {
    score -= 0.1 * (duration - idealMax) / 60;
  }

  // Engagement signals
  const hasQuestion = /[?？！]/.test(text);
  const hasExclamation = /[!！？]/.test(text);
  const hasNumbers = /\d+/.test(text);
  const hasQuotes = /["'"«»""„"]/.test(text);
  const words = text.split(/\s+/);
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;

  if (hasQuestion) score += 0.15;
  if (hasExclamation) score += 0.1;
  if (hasNumbers) score += 0.1;
  if (hasQuotes) score += 0.1;
  if (capsRatio > 0.05 && capsRatio < 0.3) score += 0.1; // Natural emphasis

  // Penalize very short or very long segments
  if (words.length < 5) score -= 0.3;
  if (words.length > 200) score -= 0.1;

  return Math.max(0, Math.min(1, score));
}

interface Segment {
  start: number;
  end: number;
  text: string;
}

/**
 * Identify the best clip segments from a timestamped transcript.
 * Returns top N clips sorted by engagement score.
 */
export function identifyBestClips(
  segments: Segment[],
  maxClips = 5,
  minDuration = 25,
  maxDuration = 120
): ClipSegment[] {
  const scored: ClipSegment[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const duration = seg.end - seg.start;

    if (duration < minDuration || duration > maxDuration) continue;

    // Skip if segment text is too short
    if (seg.text.trim().split(/\s+/).length < 5) continue;

    const score = scoreSegment(seg.text, duration);
    scored.push({
      startTime: seg.start,
      endTime: seg.end,
      text: seg.text.trim(),
      score,
    });
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Take top clips, but avoid too much overlap
  const selected: ClipSegment[] = [];
  for (const clip of scored) {
    // Check overlap with already selected clips (allow 30% overlap max)
    const overlaps = selected.some(
      (s) =>
        (clip.startTime >= s.startTime &&
          clip.startTime < s.endTime &&
          (clip.startTime - s.startTime) / (s.endTime - s.startTime) < 0.3) ||
        (clip.endTime > s.startTime &&
          clip.endTime <= s.endTime &&
          (s.endTime - clip.endTime) / (s.endTime - s.startTime) < 0.3)
    );
    if (!overlaps) {
      selected.push(clip);
    }
    if (selected.length >= maxClips) break;
  }

  return selected;
}

/**
 * Extract audio clips from an audio file using FFmpeg.
 * Returns paths to the extracted clip files.
 */
export async function extractAudioClips(
  inputFilePath: string,
  clips: ClipSegment[]
): Promise<ExtractedClip[]> {
  const results: ExtractedClip[] = [];
  const outputDir = path.join(process.cwd(), 'data', 'clips');

  // Ensure output directory exists
  const { mkdir } = await import('fs/promises');
  await mkdir(outputDir, { recursive: true });

  const clipIds: string[] = [];

  for (const clip of clips) {
    const clipId = randomUUID().slice(0, 8);
    const filename = `clip-${clipId}.mp3`;
    const outputPath = path.join(outputDir, filename);

    // Build FFmpeg command to extract audio clip
    // Use -ss before -i for fast seeking
    const args = [
      '-y', // Overwrite output
      '-ss', clip.startTime.toString(),
      '-i', inputFilePath,
      '-t', (clip.endTime - clip.startTime).toString(),
      '-vn', // No video
      '-acodec', 'libmp3lame',
      '-q:a', '3', // High quality MP3
      '-ar', '44100',
      '-ac', '2',
      outputPath,
    ];

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);
      let stderr = '';
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          console.error(`FFmpeg error for clip ${clipId}:`, stderr.slice(-500));
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });
      ffmpeg.on('error', reject);
    });

    const result: ExtractedClip = {
      id: clipId,
      startTime: clip.startTime,
      endTime: clip.endTime,
      duration: clip.endTime - clip.startTime,
      text: clip.text,
      filename,
      filePath: outputPath,
    };

    results.push(result);
    clipIds.push(outputPath);
  }

  return results;
}

/**
 * Clean up clip files after they've been downloaded or expired.
 */
export async function cleanupClipFiles(filePaths: string[]): Promise<void> {
  await Promise.allSettled(
    filePaths.map(async (fp) => {
      try {
        await unlink(fp);
      } catch {
        // File may already be gone
      }
    })
  );
}
