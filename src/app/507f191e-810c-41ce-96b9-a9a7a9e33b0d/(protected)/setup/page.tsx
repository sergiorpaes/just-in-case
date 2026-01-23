'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import Image from 'next/image';

export default function SetupPage() {
    const [url, setUrl] = useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUrl(window.location.origin);
        }
    }, []);

    useEffect(() => {
        if (url) {
            generateQRCode(url);
        }
    }, [url]);

    const generateQRCode = async (text: string) => {
        try {
            // ... (keep existing implementation)
            const dataUrl = await QRCode.toDataURL(text, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            });
            setQrCodeDataUrl(dataUrl);
        } catch (err) {
            console.error(err);
        }
    };
    /* ... helper ... */
    const generateQRCodeOriginal = async (text: string) => {
        try {
            const dataUrl = await QRCode.toDataURL(text, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            });
            setQrCodeDataUrl(dataUrl);
        } catch (err) {
            console.error(err);
        }
    }


    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 print:block print:bg-white print:p-0 print:h-screen print:overflow-hidden">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-8 text-center print:shadow-none print:w-full print:max-w-none print:absolute print:inset-0 print:flex print:flex-col print:items-center print:justify-center print:space-y-6 print:z-50 print:bg-white print:h-full">

                {/* Header - Hidden on Print if desired, or kept for branding */}
                <div className="space-y-4 print:space-y-4">
                    <div className="relative w-48 h-24 mx-auto mb-4 print:w-96 print:h-48 print:mb-6">
                        <Image
                            src="/images/logo.png"
                            alt="Just in Case"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-800 print:text-5xl font-serif">Essentials for stay</h1>
                    <div className="text-stone-600 print:text-3xl space-y-2">
                        <p>Scan QR code to order</p>
                    </div>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center p-4 bg-white rounded-xl print:p-0 print:my-8 text-center flex-col items-center">
                    {qrCodeDataUrl && (
                        <img
                            src={qrCodeDataUrl}
                            alt="QR Code"
                            className="w-64 h-64 object-contain print:w-80 print:h-80"
                        />
                    )}
                    <p className="hidden print:block text-stone-500 text-xl mt-4 font-mono">{url}</p>
                </div>

                <div className="hidden print:block mt-8">
                    <p className="text-stone-800 text-4xl font-serif">Thank you for staying</p>
                </div>


                {/* Action Buttons - Hidden on Print */}
                <div className="print:hidden pt-4">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors w-full"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        Print QR Code
                    </button>
                </div>
            </div>
        </div>
    );
}
