import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getSettings() {
    // 1. Get from DB
    let dbSettings = await prisma.settings.findUnique({
        where: { id: 'default' }
    });

    if (!dbSettings) {
        // Create default if not exists
        dbSettings = await prisma.settings.create({
            data: {
                id: 'default',
                mode: 'test',
                admin_password: 'admin'
            }
        });
    }

    // 2. Override with ENV VARS (security best practice: Environment > Database)
    const settings = { ...dbSettings };
    const env = process.env;

    if (env.NEXT_PUBLIC_APP_MODE) settings.mode = env.NEXT_PUBLIC_APP_MODE;
    if (env.NEXT_PUBLIC_STRIPE_TEST_PK) settings.test_pk = env.NEXT_PUBLIC_STRIPE_TEST_PK;
    if (env.STRIPE_TEST_SK) settings.test_sk = env.STRIPE_TEST_SK;
    if (env.NEXT_PUBLIC_STRIPE_PROD_PK) settings.prod_pk = env.NEXT_PUBLIC_STRIPE_PROD_PK;
    if (env.STRIPE_PROD_SK) settings.prod_sk = env.STRIPE_PROD_SK;
    if (env.ADMIN_PASSWORD) settings.admin_password = env.ADMIN_PASSWORD;

    return settings;
}

export async function GET() {
    try {
        const settings = await getSettings();
        return NextResponse.json({
            mode: settings.mode,
            test_pk: settings.test_pk,
            test_sk: settings.test_sk ? '***' : '',
            prod_pk: settings.prod_pk,
            prod_sk: settings.prod_sk ? '***' : '',
            has_password: true
        });
    } catch (e) {
        console.error("Settings GET error:", e);
        return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const current = await getSettings();

        // Prepare update data
        const updateData: any = {};
        if (body.mode) updateData.mode = body.mode;
        if (body.test_pk !== undefined) updateData.test_pk = body.test_pk;
        if (body.test_sk && !body.test_sk.includes('***')) updateData.test_sk = body.test_sk;
        if (body.prod_pk !== undefined) updateData.prod_pk = body.prod_pk;
        if (body.prod_sk && !body.prod_sk.includes('***')) updateData.prod_sk = body.prod_sk;
        if (body.new_password) updateData.admin_password = body.new_password;

        await prisma.settings.upsert({
            where: { id: 'default' },
            update: updateData,
            create: {
                id: 'default',
                ...updateData
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Settings POST error:", e);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
