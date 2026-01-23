"use client";

import { useEffect, useState } from "react";
import { Save, AlertTriangle, CheckCircle } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        mode: "test",
        test_pk: "",
        test_sk: "",
        prod_pk: "",
        prod_sk: "",
        whatsapp: "",
    });

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((res) => res.json())
            .then((data) => {
                setSettings({ ...data, test_sk: data.test_sk || "", prod_sk: data.prod_sk || "" });
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                alert("Settings saved!");
            } else if (data.warning) {
                alert("⚠️ " + data.warning);
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500 mb-8">Manage application configuration and modes.</p>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Contact */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Support</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                        <input
                            type="text"
                            name="whatsapp"
                            value={settings.whatsapp || ""}
                            onChange={handleChange}
                            placeholder="e.g. 351912345678"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Format: Country code + Number (no spaces or +). Example: 351912345678</p>
                    </div>
                </div>

                {/* Mode Switch */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-blue-600" /> Environment Mode
                    </h2>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Active Mode</label>
                        <select
                            name="mode"
                            value={settings.mode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="test">Test Mode (Sandbox)</option>
                            <option value="prod">Production (Live)</option>
                        </select>
                        <p className="text-xs text-gray-500">
                            Switching to <strong>Production</strong> will enable real charges.
                        </p>
                    </div>
                </div>

                {/* Test Keys */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-yellow-400">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Test Keys (Sandbox)</h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                            <input
                                type="text"
                                name="test_pk"
                                value={settings.test_pk}
                                onChange={handleChange}
                                placeholder="pk_test_..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                            <input
                                type="text"
                                name="test_sk"
                                value={settings.test_sk}
                                onChange={handleChange}
                                placeholder="sk_test_..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Prod Keys */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-500">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-500" /> Production Keys (Live)
                    </h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                            <input
                                type="text"
                                name="prod_pk"
                                value={settings.prod_pk}
                                onChange={handleChange}
                                placeholder="pk_live_..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                            <input
                                type="text"
                                name="prod_sk"
                                value={settings.prod_sk}
                                onChange={handleChange}
                                placeholder="sk_live_..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-stone-800">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-stone-800 block" /> Admin Security
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            name="new_password"
                            onChange={handleChange}
                            placeholder="Leave blank to keep current"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} /> {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}
