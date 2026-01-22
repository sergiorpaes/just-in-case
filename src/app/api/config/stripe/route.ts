import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

export async function GET() {
    let settings = { mode: 'test', test_pk: '', prod_pk: '' };
    try {
        const data = await fs.readFile(settingsPath, 'utf8');
        settings = JSON.parse(data);
    } catch (e) {
        // Ignore file read error, fall back to env or defaults
    }

    // ENV VARS OVERRIDE
    const envMode = process.env.NEXT_PUBLIC_APP_MODE; // 'test' or 'prod'
    if (envMode) settings.mode = envMode;

    const testPk = process.env.NEXT_PUBLIC_STRIPE_TEST_PK;
    if (testPk) settings.test_pk = testPk;

    const prodPk = process.env.NEXT_PUBLIC_STRIPE_PROD_PK;
    if (prodPk) settings.prod_pk = prodPk;

    const isTest = settings.mode === 'test';

    return NextResponse.json({
        publishableKey: isTest ? settings.test_pk : settings.prod_pk,
        isTestMode: isTest
    });
}
