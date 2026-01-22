import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

export async function GET() {
    try {
        const data = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(data);
        const isTest = settings.mode === 'test';

        return NextResponse.json({
            publishableKey: isTest ? settings.test_pk : settings.prod_pk,
            isTestMode: isTest
        });
    } catch (e) {
        return NextResponse.json({ publishableKey: '', isTestMode: false });
    }
}
