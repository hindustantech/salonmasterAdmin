import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';

// Sample CSV content as strings
const jobPostingsSampleCSV = `salon_name,brand_name,contact_no,job_title,required_skills,custom_job_title,job_description,gender_preference,required_experience,salary_type,salary_min,salary_max,job_type,start_time,end_time,working_days,benefits,vacancy_count,country,state,city,pincode,countryIsoCode,stateIsoCode,location,contact_name,contact_phone,contact_email
"Salon A","Brand X","1234567890","Hair Stylist","Cutting,Coloring","Senior Stylist","Responsible for hair styling and customer service","Any","1-3 years","Fixed",20000,30000,"Full-time","09:00","17:00","Monday,Tuesday,Wednesday,Thursday,Friday","Insurance,Paid Leave",2,"India","Karnataka","Bangalore","560001","IN","KA","Downtown","John Doe","9876543210","john@example.com"
"Salon B","Brand Y","0987654321","Barber","Shaving,Haircut","Lead Barber","Provide barber services","Male","3-5 years","Variable",15000,25000,"Part-time","10:00","16:00","Monday,Wednesday,Friday","Training","1","India","Maharashtra","Mumbai","400001","IN","MH","Central","Jane Smith","8765432109","jane@example.com"`;

const employeesSampleCSV = `user_name,user_contact_no,name,date_of_birth,gender,skills,available_for_join,joining_date,salary_min,salary_max,looking_job_location,preferred_locations
"John Doe","9876543210","John Doe","1990-05-15","Male","Cutting,Coloring,Styling","true","2025-10-01",20000,30000,"India","Bangalore,Mumbai"
"Jane Smith","8765432109","Jane Smith","1992-08-22","Female","Shaving,Haircut","false","","15000,25000","India","Delhi,Chennai"`;

// Define interfaces for API responses
interface ApiResponse {
    message: string;
    count?: number;
}

const UploadPage: React.FC = () => {
    // State for job postings
    const [jobFile, setJobFile] = useState<File | null>(null);
    const [jobMessage, setJobMessage] = useState<string>('');
    const [jobError, setJobError] = useState<string>('');
    const [jobLoading, setJobLoading] = useState<boolean>(false);
    const BASE_URL=import.meta.env.VITE_BASE_URL
    // State for employees
    const [empFile, setEmpFile] = useState<File | null>(null);
    const [empMessage, setEmpMessage] = useState<string>('');
    const [empError, setEmpError] = useState<string>('');
    const [empLoading, setEmpLoading] = useState<boolean>(false);

    // Handle file change for job postings
    const handleJobFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type !== 'text/csv') {
            setJobError('Please upload a valid CSV file');
            setJobFile(null);
            return;
        }
        setJobError('');
        setJobFile(file || null);
    };

    // Handle file change for employees
    const handleEmpFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type !== 'text/csv') {
            setEmpError('Please upload a valid CSV file');
            setEmpFile(null);
            return;
        }
        setEmpError('');
        setEmpFile(file || null);
    };

    // Handle job posting form submission
    const handleJobSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!jobFile) {
            setJobError('No file selected');
            return;
        }

        setJobLoading(true);
        setJobMessage('');
        setJobError('');

        const formData = new FormData();
        formData.append('file', jobFile);

        try {
            const response = await axios.post<ApiResponse>(`${BASE_URL}/api/v1/upload-jobpostings`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setJobMessage(`Success: ${response.data.message} (${response.data.count || 0} records)`);
            setJobFile(null);
            (document.getElementById('jobFileInput') as HTMLInputElement).value = '';
        } catch (error: any) {
            setJobError(error.response?.data?.message || 'Error uploading job postings');
        } finally {
            setJobLoading(false);
        }
    };

    // Handle employee form submission
    const handleEmpSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!empFile) {
            setEmpError('No file selected');
            return;
        }

        setEmpLoading(true);
        setEmpMessage('');
        setEmpError('');

        const formData = new FormData();
        formData.append('file', empFile);

        try {
            const response = await axios.post<ApiResponse>(`${BASE_URL}/api/v1/upload-employees`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setEmpMessage(`Success: ${response.data.message} (${response.data.count || 0} records)`);
            setEmpFile(null);
            (document.getElementById('empFileInput') as HTMLInputElement).value = '';
        } catch (error: any) {
            setEmpError(error.response?.data?.message || 'Error uploading employees');
        } finally {
            setEmpLoading(false);
        }
    };

    // Download sample CSV files
    const downloadSampleCSV = (csvContent: string, fileName: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Upload CSV Files</h1>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Postings Upload Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Job Postings</h2>
                    <form onSubmit={handleJobSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="jobFileInput" className="block text-sm font-medium text-gray-600">
                                Select CSV File
                            </label>
                            <input
                                id="jobFileInput"
                                type="file"
                                accept=".csv"
                                onChange={handleJobFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => downloadSampleCSV(jobPostingsSampleCSV, 'job_postings_sample.csv')}
                            className="w-full py-2 px-4 rounded-md text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                            Download Sample Job Postings CSV
                        </button>
                        {jobError && <p className="text-red-500 text-sm">{jobError}</p>}
                        {jobMessage && <p className="text-green-500 text-sm">{jobMessage}</p>}
                        <button
                            type="submit"
                            disabled={jobLoading || !jobFile}
                            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${jobLoading || !jobFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                } transition-colors`}
                        >
                            {jobLoading ? 'Uploading...' : 'Upload Job Postings'}
                        </button>
                    </form>
                </div>

                {/* Employees Upload Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Employees</h2>
                    <form onSubmit={handleEmpSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="empFileInput" className="block text-sm font-medium text-gray-600">
                                Select CSV File
                            </label>
                            <input
                                id="empFileInput"
                                type="file"
                                accept=".csv"
                                onChange={handleEmpFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => downloadSampleCSV(employeesSampleCSV, 'employees_sample.csv')}
                            className="w-full py-2 px-4 rounded-md text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                            Download Sample Employees CSV
                        </button>
                        {empError && <p className="text-red-500 text-sm">{empError}</p>}
                        {empMessage && <p className="text-green-500 text-sm">{empMessage}</p>}
                        <button
                            type="submit"
                            disabled={empLoading || !empFile}
                            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${empLoading || !empFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                } transition-colors`}
                        >
                            {empLoading ? 'Uploading...' : 'Upload Employees'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;