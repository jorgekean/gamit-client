import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// In a real scenario, you would fetch this from your Fastify /api/transfers/:id endpoint
const mockTransferData = {
    ptrNo: 'PTR-2026-04-001',
    date: 'April 10, 2026',
    entityName: 'Municipality of Calaca',
    fundCluster: '01 - Regular Agency Fund',
    fromAccountableOfficer: 'Juan Dela Cruz',
    fromDesignation: 'Administrative Officer V',
    fromAgency: 'General Services Office',
    toAccountableOfficer: 'Maria Santos',
    toDesignation: 'Municipal Engineer',
    toAgency: 'Municipal Engineering Office',
    reason: 'Reassignment', // Donation, Reassignment, Relocation, Others
    items: [
        {
            dateAcquired: '2024-01-15',
            propertyNo: 'IT-LT-2024-001',
            description: 'Dell Latitude 5420 Laptop, Core i7, 16GB RAM',
            condition: 'Serviceable',
            amount: 65000.00
        },
        {
            dateAcquired: '2024-01-15',
            propertyNo: 'IT-MON-2024-002',
            description: 'Dell 24-inch Monitor P2422H',
            condition: 'Serviceable',
            amount: 12500.00
        }
    ]
};

export function PTRReport() {
    const navigate = useNavigate();
    const data = mockTransferData;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:bg-white print:p-0 text-gray-900">

            {/* Non-printable Action Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Transfer History
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                    <Printer className="w-4 h-4" /> Print PTR
                </button>
            </div>

            {/* The A4 Paper Canvas */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-10 print:p-0 min-h-[297mm] print:min-h-0 print:h-fit print:overflow-hidden">

                {/* COA Header */}
                <div className="text-center mb-8 font-serif">
                    <p className="text-sm italic text-right mb-4 font-sans">Appendix 76</p>
                    <h1 className="text-2xl font-bold uppercase tracking-wide">Property Transfer Report</h1>
                </div>

                {/* Main Form Border */}
                <div className="border-2 border-black text-sm">

                    {/* Entity Info */}
                    <div className="grid grid-cols-2 border-b-2 border-black">
                        <div className="p-2 border-r-2 border-black">
                            <span className="font-semibold">Entity Name:</span> {data.entityName}
                        </div>
                        <div className="p-2">
                            <span className="font-semibold">Fund Cluster:</span> {data.fundCluster}
                        </div>
                    </div>

                    {/* From / To Section */}
                    <div className="grid grid-cols-2 border-b-2 border-black">
                        {/* LEFT: Source */}
                        <div className="p-3 border-r-2 border-black">
                            <div className="mb-4">
                                <span className="font-semibold block mb-1">From Accountable Officer/Agency/Fund Cluster:</span>
                                <div className="uppercase font-bold border-b border-black inline-block min-w-[200px]">{data.fromAccountableOfficer}</div>
                                <div className="text-xs">{data.fromDesignation}</div>
                                <div className="text-xs">{data.fromAgency}</div>
                            </div>
                        </div>

                        {/* RIGHT: Destination & Meta */}
                        <div className="p-0 flex flex-col">
                            <div className="p-2 border-b border-black flex justify-between">
                                <span className="font-semibold">PTR No.:</span>
                                <span className="font-bold">{data.ptrNo}</span>
                            </div>
                            <div className="p-2 border-b border-black flex justify-between">
                                <span className="font-semibold">Date:</span>
                                <span>{data.date}</span>
                            </div>
                            <div className="p-3 flex-1">
                                <span className="font-semibold block mb-1">To Accountable Officer/Agency/Fund Cluster:</span>
                                <div className="uppercase font-bold border-b border-black inline-block min-w-[200px]">{data.toAccountableOfficer}</div>
                                <div className="text-xs">{data.toDesignation}</div>
                                <div className="text-xs">{data.toAgency}</div>
                            </div>
                        </div>
                    </div>

                    {/* Transfer Reason */}
                    <div className="p-3 border-b-2 border-black flex items-center gap-6">
                        <span className="font-semibold">Transfer Type:</span>
                        {['Donation', 'Reassignment', 'Relocation', 'Others'].map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <div className="w-4 h-4 border border-black flex items-center justify-center">
                                    {data.reason === type && <div className="w-2 h-2 bg-black"></div>}
                                </div>
                                {type}
                            </label>
                        ))}
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-center">
                        <thead className="border-b-2 border-black">
                            <tr className="font-semibold">
                                <th className="p-2 border-r border-black w-24">Date Acquired</th>
                                <th className="p-2 border-r border-black w-32">Property No.</th>
                                <th className="p-2 border-r border-black">Description</th>
                                <th className="p-2 border-r border-black w-28">Condition of PPE</th>
                                <th className="p-2 w-32 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-300 print:border-black">
                                    <td className="p-2 border-r border-black">{item.dateAcquired}</td>
                                    <td className="p-2 border-r border-black font-mono text-xs">{item.propertyNo}</td>
                                    <td className="p-2 border-r border-black text-left">{item.description}</td>
                                    <td className="p-2 border-r border-black">{item.condition}</td>
                                    <td className="p-2 text-right">
                                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.amount)}
                                    </td>
                                </tr>
                            ))}
                            {/* Empty rows to fill space if needed */}
                            {Array.from({ length: Math.max(0, 5 - data.items.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-300 print:border-black">
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Reasons for Transfer Textbox */}
                    <div className="border-t-2 border-black min-h-[80px] p-2">
                        <span className="font-semibold italic block mb-1">Reason for Transfer:</span>
                        <p className="px-2">{data.reason} of equipment for official use.</p>
                    </div>

                    {/* Signatories */}
                    <div className="grid grid-cols-3 border-t-2 border-black text-center divide-x-2 divide-black">

                        {/* Approved By */}
                        <div className="p-4 flex flex-col justify-between h-40">
                            <div className="text-left font-semibold">Approved by:</div>
                            <div>
                                <div className="border-b border-black uppercase font-bold mt-10 w-4/5 mx-auto"></div>
                                <div className="text-xs mt-1">Signature over Printed Name</div>
                            </div>
                            <div className="flex text-xs text-left mt-2 px-2">
                                <span className="w-12">Date:</span>
                                <div className="border-b border-black flex-1"></div>
                            </div>
                        </div>

                        {/* Released By */}
                        <div className="p-4 flex flex-col justify-between h-40">
                            <div className="text-left font-semibold">Released/Issued by:</div>
                            <div>
                                <div className="border-b border-black uppercase font-bold mt-10 w-4/5 mx-auto">{data.fromAccountableOfficer}</div>
                                <div className="text-xs mt-1">Signature over Printed Name</div>
                            </div>
                            <div className="flex text-xs text-left mt-2 px-2">
                                <span className="w-12">Date:</span>
                                <div className="border-b border-black flex-1"></div>
                            </div>
                        </div>

                        {/* Received By */}
                        <div className="p-4 flex flex-col justify-between h-40">
                            <div className="text-left font-semibold">Received by:</div>
                            <div>
                                <div className="border-b border-black uppercase font-bold mt-10 w-4/5 mx-auto">{data.toAccountableOfficer}</div>
                                <div className="text-xs mt-1">Signature over Printed Name</div>
                            </div>
                            <div className="flex text-xs text-left mt-2 px-2">
                                <span className="w-12">Date:</span>
                                <div className="border-b border-black flex-1"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}