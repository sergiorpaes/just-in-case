import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    let settings = { mode: 'test', test_pk: '', prod_pk: '' };
    try {
        const dbSettings = await prisma.settings.findUnique({ where: { id: 'default' } });
        if (dbSettings) {
            settings = {
                ...settings,
                mode: dbSettings.mode,
                test_pk: dbSettings.test_pk || '',
                prod_pk: dbSettings.prod_pk || ''
            };
        }
    } catch (e) {
        // Ignore db error, fall back to env or defaults
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
