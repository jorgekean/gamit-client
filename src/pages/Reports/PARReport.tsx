// src/pages/Reports/PARReport.tsx
import React, { useEffect, useState } from 'react';
import { Printer, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function PARReport() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Extract context from URL Query Parameters (?assetId=123 or ?employeeId=456)
    const assetId = searchParams.get('assetId');
    const employeeId = searchParams.get('employeeId');

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dynamic report data based on URL parameters
    useEffect(() => {
        const fetchPARData = async () => {
            if (!assetId && !employeeId) {
                setError("Invalid request. No asset or employee specified.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Construct query string safely
                const params = new URLSearchParams();
                if (assetId) params.append('assetId', assetId);
                if (employeeId) params.append('employeeId', employeeId);

                // Call the Fastify endpoint
                const response = await api.get(`/reports/par?${params.toString()}`);
                setData(response.data);
            } catch (err: any) {
                console.error("Failed to generate PAR:", err);
                const errorMsg = err.response?.data?.message || "Failed to load PAR data from the server.";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPARData();
    }, [assetId, employeeId]);

    const handlePrint = () => {
        window.print();
    };

    // --- Loading State UI ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <Clock className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-1">Generating PAR...</h2>
                <p className="text-gray-500">Compiling COA records from the HR Database.</p>
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
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition-colors font-bold"
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
                                <th className="p-2 border-r border-black w-16">Qty</th>
                                <th className="p-2 border-r border-black w-16">Unit</th>
                                <th className="p-2 border-r border-black">Description</th>
                                <th className="p-2 border-r border-black w-32">Property Number</th>
                                <th className="p-2 border-r border-black w-24">Date Acquired</th>
                                <th className="p-2 w-32 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Dynamically map over API fetched items */}
                            {data.items.map((item: any, idx: number) => (
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
                            {/* Empty padding rows to fill space for official appearance */}
                            {Array.from({ length: Math.max(0, 8 - data.items.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-300 print:border-black h-8">
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