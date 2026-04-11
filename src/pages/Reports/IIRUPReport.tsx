import React, { useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data: Represents assets flagged as 'Unserviceable' ready for disposal
const mockIIRUPData = {
    iirupNo: 'IIRUP-2026-05-001',
    date: 'May 15, 2026',
    entityName: 'Municipality of Calaca',
    fundCluster: '01 - Regular Agency Fund',
    accountableOfficer: {
        name: 'Juan Dela Cruz',
        designation: 'Municipal Engineer',
        station: 'Municipal Engineering Office'
    },
    items: [
        {
            dateAcquired: '2018-02-10',
            description: 'Toyota Hilux 4x4 (Engine completely blown, chassis rusted)',
            propertyNo: 'VEH-2018-004',
            qty: 1,
            unitCost: 1200000.00,
            totalCost: 1200000.00,
            accDepreciation: 1140000.00,
            carryingAmount: 60000.00, // 5% Salvage Value
            remarks: 'Unserviceable, for Auction'
        },
        {
            dateAcquired: '2020-06-15',
            description: 'Koppel 2HP Window Type Aircon (Compressor dead)',
            propertyNo: 'APP-AC-2020-088',
            qty: 2,
            unitCost: 25000.00,
            totalCost: 50000.00,
            accDepreciation: 47500.00,
            carryingAmount: 2500.00,
            remarks: 'Beyond economic repair'
        }
    ]
};

export function IIRUPReport() {
    const navigate = useNavigate();
    const data = mockIIRUPData;

    const handlePrint = () => {
        window.print();
    };

    // ✨ THE DYNAMIC LANDSCAPE INJECTOR
    // This safely forces the printer sideways ONLY while viewing this specific report
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `@media print { @page { size: landscape; margin: 0.5cm; } }`;
        document.head.appendChild(style);

        // Cleanup: Remove the rule when the user navigates away
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:bg-white print:p-0 text-gray-900">

            {/* Non-printable Action Bar */}
            <div className="max-w-[1100px] mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Disposals
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-amber-600 font-semibold bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                        Please set printer to Landscape
                    </span>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium"
                    >
                        <Printer className="w-4 h-4" /> Print IIRUP
                    </button>
                </div>
            </div>

            {/* The A4 Landscape Canvas */}
            <div className="max-w-[1100px] mx-auto bg-white shadow-lg print:shadow-none p-8 print:p-0 min-h-[210mm] print:min-h-0 print:h-fit print:overflow-hidden">

                {/* COA Header (Appendix 74) */}
                <div className="text-center mb-6 font-serif relative">
                    <p className="absolute top-0 right-0 text-sm italic font-sans font-semibold">Appendix 74</p>
                    <h1 className="text-xl font-bold uppercase tracking-wide mt-4">Inventory and Inspection Report of Unserviceable Property</h1>
                </div>

                {/* Main Form Border */}
                <div className="border-2 border-black text-xs sm:text-sm">

                    {/* Header Info Grid */}
                    <div className="grid grid-cols-3 border-b-2 border-black">
                        <div className="p-2 border-r-2 border-black col-span-2">
                            <div className="flex gap-2 mb-1">
                                <span className="font-semibold w-24">Entity Name:</span>
                                <span className="uppercase font-bold border-b border-black flex-1">{data.entityName}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold w-24">Fund Cluster:</span>
                                <span className="uppercase font-bold border-b border-black flex-1">{data.fundCluster}</span>
                            </div>
                        </div>
                        <div className="p-2">
                            <div className="flex gap-2 mb-1">
                                <span className="font-semibold">IIRUP No.:</span>
                                <span className="font-bold border-b border-black flex-1 text-center">{data.iirupNo}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold">Date:</span>
                                <span className="border-b border-black flex-1 text-center">{data.date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 border-b-2 border-black flex gap-4 items-center">
                        <span className="font-semibold">Accountable Officer:</span>
                        <span className="uppercase font-bold border-b border-black px-4">{data.accountableOfficer.name}</span>
                        <span className="font-semibold">Designation:</span>
                        <span className="uppercase border-b border-black px-4">{data.accountableOfficer.designation}</span>
                        <span className="font-semibold">Station:</span>
                        <span className="uppercase border-b border-black flex-1">{data.accountableOfficer.station}</span>
                    </div>

                    {/* Items Table - 9 Columns per COA */}
                    <table className="w-full text-center text-xs">
                        <thead className="border-b-2 border-black bg-white">
                            <tr className="font-semibold">
                                <th colSpan={8} className="p-1 border-r-2 border-b-2 border-black">INVENTORY</th>
                                <th className="p-1 border-b-2 border-black">INSPECTION</th>
                            </tr>
                            <tr className="font-semibold">
                                <th className="p-1 border-r border-black w-20">Date Acquired</th>
                                <th className="p-1 border-r border-black">Particulars / Articles</th>
                                <th className="p-1 border-r border-black w-24">Property No.</th>
                                <th className="p-1 border-r border-black w-10">Qty</th>
                                <th className="p-1 border-r border-black w-20">Unit Cost</th>
                                <th className="p-1 border-r border-black w-20">Total Cost</th>
                                <th className="p-1 border-r border-black w-20">Acc. Dep.</th>
                                <th className="p-1 border-r-2 border-black w-20">Carrying Amt</th>
                                <th className="p-1 w-32">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-300 print:border-black align-top">
                                    <td className="p-1 border-r border-black">{item.dateAcquired}</td>
                                    <td className="p-1 border-r border-black text-left">{item.description}</td>
                                    <td className="p-1 border-r border-black font-mono">{item.propertyNo}</td>
                                    <td className="p-1 border-r border-black">{item.qty}</td>
                                    <td className="p-1 border-r border-black text-right">{new Intl.NumberFormat('en-PH').format(item.unitCost)}</td>
                                    <td className="p-1 border-r border-black text-right">{new Intl.NumberFormat('en-PH').format(item.totalCost)}</td>
                                    <td className="p-1 border-r border-black text-right text-red-600 print:text-black">{new Intl.NumberFormat('en-PH').format(item.accDepreciation)}</td>
                                    <td className="p-1 border-r-2 border-black text-right font-bold">{new Intl.NumberFormat('en-PH').format(item.carryingAmount)}</td>
                                    <td className="p-1 text-left text-[10px] leading-tight">{item.remarks}</td>
                                </tr>
                            ))}
                            {/* Padding Rows */}
                            {Array.from({ length: Math.max(0, 6 - data.items.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-300 print:border-black h-6">
                                    <td className="border-r border-black"></td><td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td><td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td><td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td><td className="border-r-2 border-black"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Massive 5-Part Footer Grid */}
                    <div className="grid grid-cols-2 border-t-2 border-black divide-x-2 divide-black text-[11px] leading-snug">

                        {/* LEFT COLUMN */}
                        <div className="flex flex-col divide-y-2 divide-black">
                            {/* Block A: Request */}
                            <div className="p-2 min-h-[100px]">
                                <p className="font-semibold mb-6">I HEREBY REQUEST inspection and disposition, pursuant to Section 79 of PD 1445, of the property enumerated above.</p>
                                <div className="text-center w-3/4 mx-auto">
                                    <div className="border-b border-black uppercase font-bold text-sm">{data.accountableOfficer.name}</div>
                                    <div>Signature over Printed Name of Accountable Officer</div>
                                </div>
                            </div>
                            {/* Block C: Witness */}
                            <div className="p-2 min-h-[100px]">
                                <p className="font-semibold mb-6">WITNESSED BY:</p>
                                <div className="text-center w-3/4 mx-auto">
                                    <div className="border-b border-black h-4"></div>
                                    <div>Signature over Printed Name of COA Representative</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col divide-y-2 divide-black">
                            {/* Block B: Inspection */}
                            <div className="p-2 min-h-[100px]">
                                <p className="font-semibold mb-6">I CERTIFY that I have inspected each and every article enumerated in this report, and that the disposition made thereof was, in my judgment, the best for the public interest.</p>
                                <div className="text-center w-3/4 mx-auto">
                                    <div className="border-b border-black h-4"></div>
                                    <div>Signature over Printed Name of Inspection Officer</div>
                                </div>
                            </div>
                            {/* Block D: Record of Disposition */}
                            <div className="p-2 min-h-[100px]">
                                <p className="font-semibold mb-2">RECORD OF DISPOSITION:</p>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="flex gap-1"><span className="w-24">Appraised Val:</span><span className="border-b border-black flex-1"></span></div>
                                    <div className="flex gap-1"><span className="w-16">OR No.:</span><span className="border-b border-black flex-1"></span></div>
                                    <div className="flex gap-1"><span className="w-24">Amount:</span><span className="border-b border-black flex-1"></span></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Block E: Accounting Entry (Bottom Full Width) */}
                    <div className="border-t-2 border-black p-2 min-h-[80px] text-[11px]">
                        <p className="font-semibold mb-6 text-center">CERTIFICATE OF ACCOUNTING</p>
                        <div className="flex justify-between items-end px-10">
                            <p>Journal Entry Voucher No.: <span className="border-b border-black inline-block w-32"></span></p>
                            <div className="text-center w-64">
                                <div className="border-b border-black h-4"></div>
                                <div>Signature over Printed Name of Chief Accountant/Head of Accounting Div./Unit</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}