// src/pages/Reports/PTRReport.tsx
import React, { useEffect, useState } from 'react';
import { Printer, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function PTRReport() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Extract historyId from the URL Query Parameters
    const historyId = searchParams.get('historyId');

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dynamic report data based on the History ID
    useEffect(() => {
        const fetchPTRData = async () => {
            if (!historyId) {
                setError("Invalid request. No transfer history ID specified.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Call the Fastify endpoint
                const response = await api.get(`/reports/ptr?historyId=${historyId}`);
                setData(response.data);
            } catch (err: any) {
                console.error("Failed to generate PTR:", err);
                const errorMsg = err.response?.data?.message || "Failed to load PTR data from the server.";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPTRData();
    }, [historyId]);

    const handlePrint = () => {
        window.print();
    };

    // --- Loading State UI ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <Clock className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-1">Generating PTR...</h2>
                <p className="text-gray-500">Compiling COA transfer records.</p>
            </div>
        );
    }

    // --- Error State UI ---
    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Report Generation Failed</h2>
                    <p className="text-sm text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // --- Official COA Report UI ---
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:bg-white print:p-0 text-gray-900">

            {/* Non-printable Action Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to History
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-orange-600 font-semibold bg-orange-50 px-3 py-1 rounded-md border border-orange-200">
                        Ready to Print
                    </span>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition-colors font-bold"
                    >
                        <Printer className="w-4 h-4" /> Print PTR
                    </button>
                </div>
            </div>

            {/* The A4 Paper Canvas */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-10 print:p-0 min-h-[297mm] print:min-h-0 print:h-fit print:overflow-hidden">

                {/* COA Header */}
                <div className="text-center mb-8 font-serif">
                    <p className="text-sm italic text-right mb-4 font-sans font-semibold">Appendix 76</p>
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
                                <div className="uppercase font-bold border-b border-black inline-block min-w-[200px]">{data.source.name}</div>
                                <div className="text-xs mt-1">{data.source.designation}</div>
                                <div className="text-xs">{data.source.department}</div>
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
                                <div className="uppercase font-bold border-b border-black inline-block min-w-[200px]">{data.destination.name}</div>
                                <div className="text-xs mt-1">{data.destination.designation}</div>
                                <div className="text-xs">{data.destination.department}</div>
                            </div>
                        </div>
                    </div>

                    {/* Transfer Reason Checkboxes */}
                    <div className="p-3 border-b-2 border-black flex items-center gap-6">
                        <span className="font-semibold">Transfer Type:</span>
                        {['Donation', 'Reassignment', 'Relocation', 'Others'].map(type => {
                            // Check if the backend string includes the checkbox type
                            const isChecked = data.transferType?.includes(type);
                            return (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                    <div className="w-4 h-4 border border-black flex items-center justify-center">
                                        {isChecked && <div className="w-2 h-2 bg-black"></div>}
                                    </div>
                                    {type}
                                </label>
                            );
                        })}
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-center">
                        <thead className="border-b-2 border-black">
                            <tr className="font-semibold bg-white">
                                <th className="p-2 border-r border-black w-24">Date Acquired</th>
                                <th className="p-2 border-r border-black w-32">Property No.</th>
                                <th className="p-2 border-r border-black">Description</th>
                                <th className="p-2 border-r border-black w-28">Condition of PPE</th>
                                <th className="p-2 w-32 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-300 print:border-black align-top">
                                    <td className="p-2 border-r border-black">{item.dateAcquired}</td>
                                    <td className="p-2 border-r border-black font-mono text-xs">{item.propertyNo}</td>
                                    <td className="p-2 border-r border-black text-left">{item.description}</td>
                                    <td className="p-2 border-r border-black">{item.condition}</td>
                                    <td className="p-2 text-right">
                                        {new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2 }).format(item.amount)}
                                    </td>
                                </tr>
                            ))}
                            {/* Empty rows to fill space and look official */}
                            {Array.from({ length: Math.max(0, 5 - data.items.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-300 print:border-black h-8">
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Reasons for Transfer Textbox */}
                    <div className="border-t-2 border-black min-h-[80px] p-3">
                        <span className="font-semibold italic block mb-1">Reason for Transfer:</span>
                        <p className="px-2 text-gray-800">{data.reasonForTransfer}</p>
                    </div>

                    {/* Signatories */}
                    <div className="grid grid-cols-3 border-t-2 border-black text-center divide-x-2 divide-black">

                        {/* Approved By */}
                        <div className="p-4 flex flex-col justify-between h-40">
                            <div className="text-left font-semibold">Approved by:</div>
                            <div>
                                <div className="border-b border-black uppercase font-bold mt-10 w-4/5 mx-auto">
                                    {data.approvedBy.name}
                                </div>
                                <div className="text-xs mt-1">Signature over Printed Name</div>
                                <div className="text-xs mt-1 font-semibold">{data.approvedBy.designation}</div>
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
                                <div className="border-b border-black uppercase font-bold mt-10 w-4/5 mx-auto">
                                    {data.source.name}
                                </div>
                                <div className="text-xs mt-1">Signature over Printed Name</div>
                                <div className="text-xs mt-1 font-semibold">{data.source.designation}</div>
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
                                <div className="border-b border-black uppercase font-bold mt-10 w-4/5 mx-auto">
                                    {data.destination.name}
                                </div>
                                <div className="text-xs mt-1">Signature over Printed Name</div>
                                <div className="text-xs mt-1 font-semibold">{data.destination.designation}</div>
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