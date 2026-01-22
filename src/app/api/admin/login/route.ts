import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const data = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(data);

        if (password === settings.admin_password) {
            // Set cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_token', 'true', {
                httpOnly: true,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
    } catch (e) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
