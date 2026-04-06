import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface AssetQRCodeProps {
    propertyNo: string;
    name: string;
    assetId: string;
}

export function AssetQRCode({ propertyNo, name, assetId }: AssetQRCodeProps) {
    // We encode a URL that points directly to this asset in the app.
    // When they scan it with a phone, it will open the app to this exact item.    
    const scanUrl = `${window.location.origin}/assets/${assetId}`;

    return (
        <div className="flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-xl shadow-sm max-w-xs mx-auto">
            <div className="text-center mb-4 w-full border-b-2 border-gray-100 pb-3">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Gamit Registry</h3>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Official Municipal Property</p>
            </div>

            <div className="bg-white p-2 rounded-lg ring-1 ring-gray-100 mb-4">
                <QRCodeSVG
                    value={scanUrl}
                    size={180}
                    level="H" // High error correction so it works even if the sticker gets scratched
                    includeMargin={false}
                />
            </div>

            <div className="text-center w-full">
                <p className="font-mono font-bold text-lg text-gray-900 tracking-tight">{propertyNo}</p>
                <p className="text-xs text-gray-500 font-medium truncate mt-1" title={name}>{name}</p>
            </div>
        </div>
    );
}