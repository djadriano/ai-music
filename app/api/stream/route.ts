import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('Missing path', { status: 400 });
  }

  // Security check: ensure we are only serving allowed files (optional but good practice)
  // For this local tool, we might skip strict checks or just ensure it ends in .mp3
  if (!filePath.toLowerCase().endsWith('.mp3')) {
    return new NextResponse('Invalid file type', { status: 400 });
  }

  try {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'audio/mpeg',
      };

      return new NextResponse(file as any, { status: 206, headers });
    } else {
      const headers = {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'audio/mpeg',
      };
      const file = fs.createReadStream(filePath);
      return new NextResponse(file as any, { status: 200, headers });
    }
  } catch (error) {
    console.error('Error streaming file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
