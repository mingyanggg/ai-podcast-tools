import { NextRequest, NextResponse } from 'next/server';
import { writeFile, appendFile, existsSync } from 'fs';
import { promisify } from 'util';
import path from 'path';

const writeFileAsync = promisify(writeFile);
const appendFileAsync = promisify(appendFile);

const DATA_FILE = path.join(process.cwd(), 'data', 'waitlist.json');

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try to load existing data
    let emails: string[] = [];
    try {
      if (existsSync(DATA_FILE)) {
        const { readFile } = await import('fs/promises');
        const content = await readFile(DATA_FILE, 'utf-8');
        emails = JSON.parse(content);
      }
    } catch {
      // File doesn't exist or is invalid — start fresh
    }

    if (emails.includes(normalizedEmail)) {
      return NextResponse.json({
        message: "You're already on the waitlist!",
        count: emails.length,
      });
    }

    emails.push(normalizedEmail);

    // Ensure data directory exists
    const { mkdir } = await import('fs/promises');
    try {
      await mkdir(path.dirname(DATA_FILE), { recursive: true });
    } catch {
      // Already exists
    }

    await writeFileAsync(DATA_FILE, JSON.stringify(emails, null, 2));

    return NextResponse.json({
      message: "You're on the list! We'll notify you when we launch.",
      count: emails.length,
    });
  } catch (error) {
    console.error('[Waitlist API Error]', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Simple count endpoint for the waitlist page
  try {
    let count = 0;
    if (existsSync(DATA_FILE)) {
      const { readFile } = await import('fs/promises');
      const content = await readFile(DATA_FILE, 'utf-8');
      const emails = JSON.parse(content);
      count = emails.length;
    }
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
