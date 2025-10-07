import React, { useState } from "react";
import axios from "axios";

interface ImportResult {
    message: string;
    inserted: number;
    skipped: number;
    errors: string[];
}

const ImportUsers: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post<ImportResult>(
                `${BASE_URL}/api/v1/importuser/import`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4">📂 Import Users from Excel</h2>

            <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="mb-4 block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
            />

            <button
                onClick={handleUpload}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Uploading..." : "Upload & Import"}
            </button>

            {error && (
                <div className="mt-4 text-red-600 text-sm bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-6">
                    <h3 className="font-semibold text-lg">✅ Import Summary</h3>
                    <p className="text-sm mt-1">Inserted: {result.inserted}</p>
                    <p className="text-sm">Skipped: {result.skipped}</p>

                    {result.errors.length > 0 && (
                        <div className="mt-3">
                            <h4 className="font-medium text-red-600">Errors:</h4>
                            <ul className="list-disc ml-5 text-sm text-red-500">
                                {result.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImportUsers;
