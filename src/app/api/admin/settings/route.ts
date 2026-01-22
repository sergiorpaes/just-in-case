import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

async function getSettings() {
    let settings = {
        mode: 'test',
        test_pk: '', test_sk: '',
        prod_pk: '', prod_sk: '',
        admin_password: 'admin'
    };

    try {
        const data = await fs.readFile(settingsPath, 'utf8');
        const fileSettings = JSON.parse(data);
        settings = { ...settings, ...fileSettings };
    } catch (e) {
        // File missing, stick to defaults
    }

    // OVERRIDE WITH ENV VARS (If present, they take precedence)
    const env = process.env;
    if (env.NEXT_PUBLIC_APP_MODE) settings.mode = env.NEXT_PUBLIC_APP_MODE;
    if (env.NEXT_PUBLIC_STRIPE_TEST_PK) settings.test_pk = env.NEXT_PUBLIC_STRIPE_TEST_PK;
    if (env.STRIPE_TEST_SK) settings.test_sk = env.STRIPE_TEST_SK;
    if (env.NEXT_PUBLIC_STRIPE_PROD_PK) settings.prod_pk = env.NEXT_PUBLIC_STRIPE_PROD_PK;
    if (env.STRIPE_PROD_SK) settings.prod_sk = env.STRIPE_PROD_SK;
    if (env.ADMIN_PASSWORD) settings.admin_password = env.ADMIN_PASSWORD;

    return settings;
}

async function saveSettings(settings: any) {
    // In production (Netlify/Vercel), we cannot write to the file system.
    // We check if we are in a read-only environment conceptually by checking NODE_ENV
    // But practically, fs.writeFile will just throw. We catch it.
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
}

export async function GET() {
    const settings = await getSettings();
    // Mask secrets for security in frontend
    return NextResponse.json({
        mode: settings.mode,
        test_pk: settings.test_pk,
        test_sk: settings.test_sk ? '***' : '',
        prod_pk: settings.prod_pk,
        prod_sk: settings.prod_sk ? '***' : '',
        // Don't send password, just indicate if it exists (always true basically)
        has_password: true
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const current = await getSettings();

        const newSettings = {
            mode: body.mode || current.mode,
            test_pk: body.test_pk !== undefined ? body.test_pk : current.test_pk,
            test_sk: (body.test_sk && !body.test_sk.includes('***')) ? body.test_sk : current.test_sk,
            prod_pk: body.prod_pk !== undefined ? body.prod_pk : current.prod_pk,
            prod_sk: (body.prod_sk && !body.prod_sk.includes('***')) ? body.prod_sk : current.prod_sk,
            admin_password: body.new_password ? body.new_password : current.admin_password
        };

        try {
            await saveSettings(newSettings);
            return NextResponse.json({ success: true });
        } catch (writeErr) {
            console.error("Write failed (Expected in Production):", writeErr);
            // In Production, saving failing is expected if using Env Vars strategies.
            // We return 200 to not break the UI, but ideally we warn the user.
            // For now, let's return a special message.
            return NextResponse.json({
                success: false,
                warning: "Settings could not be saved to disk (Read-Only Filesystem). Please configure Environment Variables in your Netlify/Vercel dashboard."
            });
        }
    } catch (e) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
