import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loader from './Loader';

interface Candidate {
    _id: string;
    name: string;
    skills: { skill_name: string }[];
    matchScore: number;
    expected_salary: { min: number; max: number };
    address: { city: string; state: string; country: string };
}

interface CandidateListProps {
    jobId: string;
}

const CandidateList = ({ jobId }: CandidateListProps) => {
    const BASEURL = `https://backend.thesalonmaster.com`

    const { data, isLoading, error } = useQuery({
        queryKey: ['suggestedCandidates', jobId],
        queryFn: async () => {
            const response = await axios.post(
                `${BASEURL}/api/v1/jobpost/suggestcandidate`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` } }
            );
            return response.data;
        },
    });

    if (isLoading) return <Loader />;
    if (error) return <div className="text-red-500">Error fetching candidates: {(error as any).message}</div>;

    const candidates: Candidate[] = data?.data || [];

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Suggested Candidates</h2>
            {candidates.length === 0 ? (
                <p className="text-gray-600">No matching candidates found.</p>
            ) : (
                <div className="space-y-4">
                    {candidates.map((candidate) => (
                        <div key={candidate._id} className="p-4 border rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">
                                Skills: {candidate.skills.map((skill) => skill.skill_name).join(', ')}
                            </p>
                            <p className="text-sm text-gray-600">
                                Location: {candidate.address.city}, {candidate.address.state}, {candidate.address.country}
                            </p>
                            <p className="text-sm text-gray-600">
                                Expected Salary: ${candidate.expected_salary.min} - ${candidate.expected_salary.max}
                            </p>
                            <p className="text-sm text-gray-600">Match Score: {(candidate.matchScore * 100).toFixed(2)}%</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateList;