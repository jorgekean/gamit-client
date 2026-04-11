import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data: Semi-expendable items (typically below ₱50,000)
const mockICSData = {
    icsNo: 'ICS-2026-04-112',
    entityName: 'Municipality of Calaca',
    fundCluster: '01 - Regular Agency Fund',
    issuedBy: {
        name: 'Jorge Gamit',
        designation: 'General Services Officer',
        date: 'April 11, 2026'
    },
    receivedBy: {
        name: 'Maria Santos',
        designation: 'HR Management Officer',
        date: 'April 11, 2026'
    },
    items: [
        {
            qty: 4,
            unit: 'pc',
            unitCost: 4500.00,
            totalCost: 18000.00,
            description: 'Ergonomic Office Chair, Mesh Back',
            inventoryItemNo: 'SE-FURN-2026-045',
            usefulLife: '5 years'
        },
        {
            qty: 2,
            unit: 'unit',
            unitCost: 12500.00,
            totalCost: 25000.00,
            description: 'Epson L3210 All-in-One Ink Tank Printer',
            inventoryItemNo: 'SE-IT-2026-088',
            usefulLife: '3 years'
        }
    ]
};

export function ICSReport() {
    const navigate = useNavigate();
    const data = mockICSData;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:bg-white print:p-0 text-gray-900">

            {/* Non-printable Action Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Employee Profile
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium"
                >
                    <Printer className="w-4 h-4" /> Print ICS
                </button>
            </div>

            {/* The A4 Paper Canvas */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-10 print:p-0 min-h-[297mm] print:min-h-0 print:h-fit print:overflow-hidden">

                {/* COA Header (Appendix 59) */}
                <div className="text-center mb-8 font-serif">
                    <p className="text-sm italic text-right mb-4 font-sans font-semibold">Appendix 59</p>
                    <h1 className="text-2xl font-bold uppercase tracking-wide">Inventory Custodian Slip</h1>
                </div>

                {/* Main Form Border */}
                <div className="border-2 border-black text-sm">

                    {/* Header Info Grid */}
                    <div className="grid grid-cols-2 border-b-2 border-black">
                        <div className="p-3 border-r-2 border-black">
                            <span className="font-semibold block mb-1">Entity Name:</span>
                            <div className="uppercase font-bold border-b border-black inline-block min-w-[250px]">{data.entityName}</div>
                            <div className="mt-3">
                                <span className="font-semibold block mb-1">Fund Cluster:</span>
                                <div className="uppercase font-bold border-b border-black inline-block min-w-[250px]">{data.fundCluster}</div>
                            </div>
                        </div>
                        <div className="p-3 flex items-start justify-end">
                            <div className="flex gap-2 text-base">
                                <span className="font-semibold">ICS No.:</span>
                                <span className="font-bold border-b border-black min-w-[150px] text-center">{data.icsNo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table - Note the specific COA rowSpan/colSpan layout */}
                    <table className="w-full text-center">
                        <thead className="border-b-2 border-black bg-white">
                            <tr className="font-semibold">
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-12">Quantity</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-12">Unit</th>
                                <th colSpan={2} className="p-2 border-r border-b border-black">Amount</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black">Description</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-32">Inventory Item No.</th>
                                <th rowSpan={2} className="p-2 border-b border-black w-24">Estimated Useful Life</th>
                            </tr>
                            <tr className="font-semibold">
                                <th className="p-2 border-r border-b border-black w-24">Unit Cost</th>
                                <th className="p-2 border-r border-b border-black w-28">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-300 print:border-black align-top">
                                    <td className="p-2 border-r border-black">{item.qty}</td>
                                    <td className="p-2 border-r border-black">{item.unit}</td>
                                    <td className="p-2 border-r border-black text-right">
                                        {new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(item.unitCost)}
                                    </td>
                                    <td className="p-2 border-r border-black text-right font-medium">
                                        {new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(item.totalCost)}
                                    </td>
                                    <td className="p-2 border-r border-black text-left">{item.description}</td>
                                    <td className="p-2 border-r border-black font-mono text-xs">{item.inventoryItemNo}</td>
                                    <td className="p-2">{item.usefulLife}</td>
                                </tr>
                            ))}

                            {/* Empty padding rows to make the form look official */}
                            {Array.from({ length: Math.max(0, 8 - data.items.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-300 print:border-black h-8">
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Signatories Footer (COA format: Received from vs Received by) */}
                    <div className="grid grid-cols-2 border-t-2 border-black divide-x-2 divide-black">

                        {/* Received From (GSO / Property Officer) */}
                        <div className="p-4 flex flex-col min-h-[160px]">
                            <div className="text-left font-semibold italic mb-8">Received from:</div>

                            <div className="text-center flex-1 flex flex-col justify-end">
                                <div className="border-b border-black uppercase font-bold text-base w-[90%] mx-auto">
                                    {data.issuedBy.name}
                                </div>
                                <div className="text-xs mt-1">Signature over Printed Name</div>

                                <div className="border-b border-black font-semibold uppercase mt-4 w-[90%] mx-auto">
                                    {data.issuedBy.designation}
                                </div>
                                <div className="text-xs mt-1">Position/Agency</div>

                                <div className="border-b border-black mt-4 w-[90%] mx-auto">
                                    {data.issuedBy.date}
                                </div>
                                <div className="text-xs mt-1">Date</div>
                            </div>
                        </div>

                        {/* Received By (Accountable Employee) */}
                        <div className="p-4 flex flex-col min-h-[160px]">
                            <div className="text-left font-semibold italic mb-8">Received by:</div>

                            <div className="text-center flex-1 flex flex-col justify-end">
                                <div className="border-b border-black uppercase font-bold text-base w-[90%] mx-auto">
                                    {data.receivedBy.name}
                                </div>
                                <div className="text-xs mt-1">Signature over Printed Name</div>

                                <div className="border-b border-black font-semibold uppercase mt-4 w-[90%] mx-auto">
                                    {data.receivedBy.designation}
                                </div>
                                <div className="text-xs mt-1">Position/Agency</div>

                                <div className="border-b border-black mt-4 w-[90%] mx-auto">
                                    {data.receivedBy.date}
                                </div>
                                <div className="text-xs mt-1">Date</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}