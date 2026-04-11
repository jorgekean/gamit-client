import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data: In your actual app, fetch this via your Fastify API using the employee/asset ID
const mockPARData = {
    parNo: 'PAR-2026-04-045',
    entityName: 'Municipality of Calaca',
    fundCluster: '01 - Regular Agency Fund',
    issuedBy: {
        name: 'Jorge Gamit',
        designation: 'General Services Officer',
        date: 'April 11, 2026'
    },
    receivedBy: {
        name: 'Juan Dela Cruz',
        designation: 'Municipal Engineer',
        date: 'April 11, 2026'
    },
    items: [
        {
            qty: 1,
            unit: 'unit',
            description: 'Dell Latitude 5420 Laptop, Core i7, 16GB RAM, 512GB SSD',
            propertyNo: 'IT-LT-2026-001',
            dateAcquired: '2026-03-15',
            amount: 65000.00
        },
        {
            qty: 1,
            unit: 'pc',
            description: 'Epson L3250 EcoTank Printer',
            propertyNo: 'IT-PR-2026-002',
            dateAcquired: '2026-03-15',
            amount: 10500.00
        }
    ]
};

export function PARReport() {
    const navigate = useNavigate();
    const data = mockPARData;

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
                    <Printer className="w-4 h-4" /> Print PAR
                </button>
            </div>

            {/* The A4 Paper Canvas */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-10 print:p-0 min-h-[297mm] print:min-h-0 print:h-fit print:overflow-hidden">

                {/* COA Header (Appendix 71) */}
                <div className="text-center mb-8 font-serif">
                    <p className="text-sm italic text-right mb-4 font-sans font-semibold">Appendix 71</p>
                    <h1 className="text-2xl font-bold uppercase tracking-wide">Property Acknowledgment Receipt</h1>
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
                                <span className="font-semibold">PAR No.:</span>
                                <span className="font-bold border-b border-black min-w-[150px] text-center">{data.parNo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-center">
                        <thead className="border-b-2 border-black bg-white">
                            <tr className="font-semibold">
                                <th className="p-2 border-r border-black w-16">Quantity</th>
                                <th className="p-2 border-r border-black w-16">Unit</th>
                                <th className="p-2 border-r border-black">Description</th>
                                <th className="p-2 border-r border-black w-32">Property Number</th>
                                <th className="p-2 border-r border-black w-24">Date Acquired</th>
                                <th className="p-2 w-32 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-300 print:border-black align-top">
                                    <td className="p-2 border-r border-black">{item.qty}</td>
                                    <td className="p-2 border-r border-black">{item.unit}</td>
                                    <td className="p-2 border-r border-black text-left">{item.description}</td>
                                    <td className="p-2 border-r border-black font-mono text-xs">{item.propertyNo}</td>
                                    <td className="p-2 border-r border-black">{item.dateAcquired}</td>
                                    <td className="p-2 text-right">
                                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(item.amount)}
                                    </td>
                                </tr>
                            ))}
                            {/* Empty padding rows to make the form look official even if there is only 1 item */}
                            {Array.from({ length: Math.max(0, 8 - data.items.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-300 print:border-black">
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4 border-r border-black"></td>
                                    <td className="p-4"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Signatories Footer (Split strictly into two columns per COA layout) */}
                    <div className="grid grid-cols-2 border-t-2 border-black divide-x-2 divide-black">

                        {/* Received By (Accountable Employee) */}
                        <div className="p-4 flex flex-col min-h-[160px]">
                            <div className="text-left font-semibold italic mb-8">Received by:</div>

                            <div className="text-center flex-1 flex flex-col justify-end">
                                <div className="border-b border-black uppercase font-bold text-base w-[90%] mx-auto">
                                    {data.receivedBy.name}
                                </div>
                                <div className="text-xs mt-1">Signature over Printed Name of End-User</div>

                                <div className="border-b border-black font-semibold uppercase mt-4 w-[90%] mx-auto">
                                    {data.receivedBy.designation}
                                </div>
                                <div className="text-xs mt-1">Position/Office</div>

                                <div className="border-b border-black mt-4 w-[90%] mx-auto">
                                    {data.receivedBy.date}
                                </div>
                                <div className="text-xs mt-1">Date</div>
                            </div>
                        </div>

                        {/* Issued By (GSO / Property Officer) */}
                        <div className="p-4 flex flex-col min-h-[160px]">
                            <div className="text-left font-semibold italic mb-8">Issued by:</div>

                            <div className="text-center flex-1 flex flex-col justify-end">
                                <div className="border-b border-black uppercase font-bold text-base w-[90%] mx-auto">
                                    {data.issuedBy.name}
                                </div>
                                <div className="text-xs mt-1">Signature over Printed Name of Supply and/or Property Custodian</div>

                                <div className="border-b border-black font-semibold uppercase mt-4 w-[90%] mx-auto">
                                    {data.issuedBy.designation}
                                </div>
                                <div className="text-xs mt-1">Position/Office</div>

                                <div className="border-b border-black mt-4 w-[90%] mx-auto">
                                    {data.issuedBy.date}
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