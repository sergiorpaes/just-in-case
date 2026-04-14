import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    let settings: any = {};
    try {
        const dbSettings = await prisma.settings.findUnique({ where: { id: 'default' } });
        if (dbSettings) {
            settings = {
                mode: dbSettings.mode,
                test_pk: dbSettings.test_pk || '',
                prod_pk: dbSettings.prod_pk || ''
            };
        }
    } catch (e) {
        // Ignore db error, fall back to env or defaults
    }

    // Fallbacks
    if (!settings.mode) settings.mode = process.env.NEXT_PUBLIC_APP_MODE || 'test';
    if (!settings.test_pk) settings.test_pk = process.env.NEXT_PUBLIC_STRIPE_TEST_PK || '';
    if (!settings.prod_pk) settings.prod_pk = process.env.NEXT_PUBLIC_STRIPE_PROD_PK || '';

    const isTest = settings.mode === 'test';

    return NextResponse.json({
        publishableKey: isTest ? settings.test_pk : settings.prod_pk,
        isTestMode: isTest
    });
}
