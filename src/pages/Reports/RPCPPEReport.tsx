import React, { useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data: Represents the yearly master inventory count
const mockRPCPPEData = {
    dateAsOf: 'December 31, 2026',
    fundCluster: '01 - Regular Agency Fund',
    entityName: 'Municipality of Calaca',
    ppeType: 'Information and Communication Technology Equipment',
    accountableOfficer: {
        name: 'Jorge Gamit',
        designation: 'General Services Officer',
        assumptionDate: 'January 15, 2023'
    },
    items: [
        {
            article: 'Laptop Computer',
            description: 'Dell Latitude 5420, Core i7, 16GB RAM, SN: DL-88992',
            propertyNo: 'ICT-2024-001',
            unit: 'unit',
            unitValue: 65000.00,
            balancePerCard: 1,
            onHandPerCount: 1,
            shortageOverageQty: 0,
            shortageOverageValue: 0.00,
            remarks: 'Assigned to Mayor\'s Office'
        },
        {
            article: 'Desktop Computer',
            description: 'HP ProDesk 400 G7, Core i5, SN: HP-11002',
            propertyNo: 'ICT-2024-045',
            unit: 'set',
            unitValue: 45000.00,
            balancePerCard: 5,
            onHandPerCount: 4,
            shortageOverageQty: -1, // Shortage
            shortageOverageValue: -45000.00,
            remarks: '1 unit missing, under investigation (Ref: Memo 2026-11)'
        },
        {
            article: 'Printer',
            description: 'Epson EcoTank L3250',
            propertyNo: 'ICT-2025-112',
            unit: 'unit',
            unitValue: 10500.00,
            balancePerCard: 2,
            onHandPerCount: 2,
            shortageOverageQty: 0,
            shortageOverageValue: 0.00,
            remarks: 'Serviceable'
        }
    ]
};

export function RPCPPEReport() {
    const navigate = useNavigate();
    const data = mockRPCPPEData;

    // ✨ THE DYNAMIC LANDSCAPE INJECTOR
    // Safely forces the printer sideways only for this massive table
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `@media print { @page { size: landscape; margin: 0.5cm; } }`;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:bg-white print:p-0 text-gray-900">

            {/* Non-printable Action Bar */}
            <div className="max-w-[1200px] mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Inventory Counts
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-amber-600 font-semibold bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                        Please set printer to Landscape
                    </span>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium"
                    >
                        <Printer className="w-4 h-4" /> Print RPCPPE
                    </button>
                </div>
            </div>

            {/* The A4 Landscape Canvas */}
            <div className="max-w-[1200px] mx-auto bg-white shadow-lg print:shadow-none p-8 print:p-0 min-h-[210mm] print:min-h-0 print:h-fit print:overflow-hidden">

                {/* COA Header (Appendix 73) */}
                <div className="text-center mb-6 font-serif relative">
                    <p className="absolute top-0 right-0 text-sm italic font-sans font-semibold">Appendix 73</p>
                    <h1 className="text-xl font-bold uppercase tracking-wide mt-4">Report on the Physical Count of Property, Plant and Equipment</h1>
                    <div className="flex justify-center items-center gap-2 mt-2 font-sans font-semibold text-sm">
                        <span>Type of Property, Plant and Equipment:</span>
                        <span className="border-b-2 border-black min-w-[300px] inline-block uppercase text-center">{data.ppeType}</span>
                    </div>
                    <div className="flex justify-center items-center gap-2 mt-1 font-sans font-semibold text-sm">
                        <span>As at</span>
                        <span className="border-b-2 border-black min-w-[200px] inline-block uppercase text-center">{data.dateAsOf}</span>
                    </div>
                </div>

                {/* Main Form Border */}
                <div className="border-2 border-black text-xs sm:text-sm">

                    {/* Header Info Block */}
                    <div className="p-3 border-b-2 border-black flex flex-wrap justify-between items-center gap-y-2">
                        <div className="flex gap-2">
                            <span className="font-semibold">Fund Cluster:</span>
                            <span className="uppercase font-bold border-b border-black min-w-[200px]">{data.fundCluster}</span>
                        </div>
                        <p className="w-full mt-2 leading-relaxed">
                            For which <span className="font-bold uppercase border-b border-black px-4">{data.accountableOfficer.name}</span>,
                            <span className="font-bold uppercase border-b border-black px-4">{data.accountableOfficer.designation}</span>,
                            <span className="font-bold uppercase border-b border-black px-4">{data.entityName}</span> is accountable,
                            having assumed such accountability on <span className="font-bold uppercase border-b border-black px-4">{data.accountableOfficer.assumptionDate}</span>.
                        </p>
                    </div>

                    {/* Master Inventory Table */}
                    <table className="w-full text-center text-xs">
                        <thead className="border-b-2 border-black bg-white">
                            <tr className="font-semibold">
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-32">ARTICLE</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black">DESCRIPTION</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-24">PROPERTY NO.</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-16">UNIT OF MEASURE</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-24">UNIT VALUE</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-16">BALANCE PER CARD<br />(Qty)</th>
                                <th rowSpan={2} className="p-2 border-r border-b border-black w-16">ON HAND PER COUNT<br />(Qty)</th>
                                <th colSpan={2} className="p-2 border-r border-b border-black">SHORTAGE/OVERAGE</th>
                                <th rowSpan={2} className="p-2 border-b border-black w-32">REMARKS</th>
                            </tr>
                            <tr className="font-semibold">
                                <th className="p-1 border-r border-b border-black w-16">Qty</th>
                                <th className="p-1 border-r border-b border-black w-24">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-300 print:border-black align-top">
                                    <td className="p-2 border-r border-black font-semibold text-left">{item.article}</td>
                                    <td className="p-2 border-r border-black text-left">{item.description}</td>
                                    <td className="p-2 border-r border-black font-mono">{item.propertyNo}</td>
                                    <td className="p-2 border-r border-black">{item.unit}</td>
                                    <td className="p-2 border-r border-black text-right">{new Intl.NumberFormat('en-PH').format(item.unitValue)}</td>
                                    <td className="p-2 border-r border-black font-semibold">{item.balancePerCard}</td>
                                    <td className="p-2 border-r border-black font-semibold">{item.onHandPerCount}</td>
                                    {/* Format Shortage as Red, Overage as Green, Match as Black */}
                                    <td className={`p-2 border-r border-black font-bold ${item.shortageOverageQty < 0 ? 'text-red-600 print:text-black' : item.shortageOverageQty > 0 ? 'text-emerald-600 print:text-black' : ''}`}>
                                        {item.shortageOverageQty}
                                    </td>
                                    <td className="p-2 border-r border-black text-right">
                                        {item.shortageOverageValue !== 0 ? new Intl.NumberFormat('en-PH').format(Math.abs(item.shortageOverageValue)) : '-'}
                                    </td>
                                    <td className="p-2 text-left text-[10px] leading-tight">{item.remarks}</td>
                                </tr>
                            ))}
                            {/* Padding Rows to make it look official */}
                            {Array.from({ length: Math.max(0, 7 - data.items.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-300 print:border-black h-8">
                                    <td className="border-r border-black"></td><td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td><td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td><td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td><td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td><td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer Signatories (Strict 3-Column Layout per COA) */}
                    <div className="grid grid-cols-3 border-t-2 border-black divide-x-2 divide-black text-xs leading-snug">

                        {/* Column 1: Inventory Committee */}
                        <div className="p-4 flex flex-col min-h-[140px]">
                            <div className="font-semibold mb-6">Certified Correct by:</div>
                            <div className="text-center mt-auto space-y-6">
                                <div>
                                    <div className="border-b border-black uppercase font-bold w-4/5 mx-auto">JUAN DELA CRUZ</div>
                                    <div className="mt-1">Signature over Printed Name of<br />Inventory Committee Chair</div>
                                </div>
                                <div>
                                    <div className="border-b border-black uppercase font-bold w-4/5 mx-auto">MARIA SANTOS</div>
                                    <div className="mt-1">Signature over Printed Name of<br />Inventory Committee Member</div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Head of Agency */}
                        <div className="p-4 flex flex-col min-h-[140px]">
                            <div className="font-semibold mb-6">Approved by:</div>
                            <div className="text-center mt-auto">
                                <div className="border-b border-black uppercase font-bold w-4/5 mx-auto">HON. MAYOR NAME</div>
                                <div className="mt-1">Signature over Printed Name of Head of Agency/<br />Agency Authorized Representative</div>
                            </div>
                        </div>

                        {/* Column 3: COA Representative */}
                        <div className="p-4 flex flex-col min-h-[140px]">
                            <div className="font-semibold mb-6">Verified by:</div>
                            <div className="text-center mt-auto">
                                <div className="border-b border-black h-4 w-4/5 mx-auto"></div>
                                <div className="mt-1">Signature over Printed Name of<br />COA Representative</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}