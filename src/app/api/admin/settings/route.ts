import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

async function getSettings() {
    try {
        const data = await fs.readFile(settingsPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        // Return defaults if file missing
        return {
            mode: 'test',
            test_pk: '', test_sk: '',
            prod_pk: '', prod_sk: '',
            admin_password: 'admin'
        };
    }
}

async function saveSettings(settings: any) {
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

            // Password update
            admin_password: body.new_password ? body.new_password : current.admin_password
        };

        await saveSettings(newSettings);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
