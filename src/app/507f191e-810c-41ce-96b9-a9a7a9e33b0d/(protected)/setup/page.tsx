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
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page {
                        size: 21cm 7cm;
                        margin: 0;
                    }
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 21cm !important;
                        height: 7cm !important;
                        overflow: hidden !important;
                    }
                }
            `}} />
            
            {/* Screen View */}
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 print:hidden">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-8 text-center">
                    
                    <div className="space-y-4">
                        <div className="relative w-48 h-24 mx-auto mb-4">
                            <Image
                                src="/images/logo.png"
                                alt="Just in Case"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-stone-800 font-serif">Essentials for your stay</h1>
                        <div className="text-stone-600 space-y-2">
                            <p>Scan QR code to order</p>
                        </div>
                    </div>

                    <div className="flex justify-center p-4 bg-white rounded-xl text-center flex-col items-center">
                        {qrCodeDataUrl && (
                            <img
                                src={qrCodeDataUrl}
                                alt="QR Code"
                                className="w-64 h-64 object-contain"
                            />
                        )}
                    </div>

                    <div className="pt-4">
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

            {/* Print View: 21x7 cm */}
            <div className="hidden print:flex w-[21cm] h-[7cm] bg-white items-center justify-between p-6 box-border">
                {/* Left Box: Logo */}
                <div className="flex-none flex items-center justify-center w-40 pl-2">
                    <div className="relative w-full h-24">
                        <Image
                            src="/images/logo.png"
                            alt="Just in Case"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Middle Box: Instructions */}
                <div className="flex-1 px-8 border-l border-r border-stone-200 mx-6 h-full flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-stone-900 mb-4 font-serif">Essentials for your stay</h1>
                    <ul className="text-stone-700 text-sm space-y-3 font-medium">
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-stone-900 bg-stone-100 rounded-full w-6 h-6 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                            <span><b>Scan the QR code</b> to open the app.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-stone-900 bg-stone-100 rounded-full w-6 h-6 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                            <span>Choose your items and add them to your <b>Stay Basket</b>.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="font-bold text-stone-900 bg-stone-100 rounded-full w-6 h-6 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                            <span><b>Pay conveniently</b> all at once on Checkout Day.</span>
                        </li>
                    </ul>
                </div>

                {/* Right Box: QR Code */}
                <div className="flex-none flex flex-col items-center justify-center pr-2">
                    {qrCodeDataUrl && (
                        <img
                            src={qrCodeDataUrl}
                            alt="QR Code"
                            className="w-32 h-32 object-contain mb-1.5"
                        />
                    )}
                    <p className="text-stone-500 font-mono text-[9px] m-0 leading-none">{url.replace(/^https?:\/\//, '')}</p>
                </div>
            </div>
        </>
    );
}
