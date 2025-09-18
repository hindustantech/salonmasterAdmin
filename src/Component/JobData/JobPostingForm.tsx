import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import CandidateList from './CandidateList';
import SkillsDropdown from './SkillsDropdown';
// import JobTitleDropdown from '../DropDown/JobTitleDropdown';
// import SalaryTypeDropdown from '../DropDown/SalaryTypeDropdown';
// import ExperienceDropdown from '../DropDown/ExperienceDropdown';

import JobTitleDropdown from './JobTitleDropdown';
import SalaryTypeDropdown from './SalaryTypeDropdown';
import ExperienceDropdown from './ExperienceDropdown';
import { Country, State, City } from 'country-state-city';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
// import { useToast } from '../../components/ui/use-toast';

interface JobPostingFormData {
  job_title: string;
  custom_job_title: string;
  job_description: string;
  gender_preference: string;
  required_experience: string;
  salary_type: string;
  salary_range: { min: number; max: number };
  job_type: string;
  work_timings: { start: string; end: string };
  working_days: string[];
  skills: string[];
  benefits: string[];
  vacancy_count: number;
  location: string;
  contact_person: { name: string; phone: string; email: string };
  application_deadline: string;
  interview_details: string;
  address: {
    country: string;
    state: string;
    city: string;
    pincode?: string;
    countryIsoCode: string;
    stateIsoCode: string;
  };
}

const JobPostingForm = () => {
  // const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<JobPostingFormData>({
    defaultValues: {
      job_title: '',
      custom_job_title: '',
      job_description: '',
      gender_preference: 'Any',
      required_experience: '',
      salary_type: 'Fixed + Commission',
      salary_range: { min: 0, max: 0 },
      job_type: 'Full-time',
      work_timings: { start: '10:00', end: '19:00' },
      working_days: [],
      skills: [],
      benefits: [],
      vacancy_count: 1,
      location: '',
      contact_person: { name: '', phone: '', email: '' },
      application_deadline: '',
      interview_details: '',
      address: { country: '', state: '', city: '', pincode: '', countryIsoCode: '', stateIsoCode: '' },
    },
  });

  const [showCandidates, setShowCandidates] = useState(false);
  const [postedJob, setPostedJob] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const navigate = useNavigate();
  const selectedCountry = watch('address.country');
  const selectedState = watch('address.state');

  const BASEURL = 'https://backend.thesalonmaster.com';

  // Fetch countries on component mount
  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
  }, []);

  // Fetch states and set countryIsoCode when a country is selected
  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find((c) => c.name === selectedCountry);
      if (country) {
        setValue('address.countryIsoCode', country.isoCode);
        const fetchedStates = State.getStatesOfCountry(country.isoCode);
        setStates(fetchedStates);
        setCities([]); // Reset cities
        setValue('address.state', '');
        setValue('address.stateIsoCode', '');
        setValue('address.city', '');
      }
    } else {
      setStates([]);
      setCities([]);
      setValue('address.state', '');
      setValue('address.stateIsoCode', '');
      setValue('address.city', '');
      setValue('address.countryIsoCode', '');
    }
  }, [selectedCountry, countries, setValue]);

  // Fetch cities and set stateIsoCode when a state is selected
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const country = countries.find((c) => c.name === selectedCountry);
      const state = states.find((s) => s.name === selectedState);
      if (country && state) {
        setValue('address.stateIsoCode', state.isoCode);
        const fetchedCities = City.getCitiesOfState(country.isoCode, state.isoCode);
        setCities(fetchedCities);
        setValue('address.city', '');
      }
    } else {
      setCities([]);
      setValue('address.city', '');
      setValue('address.stateIsoCode', '');
    }
  }, [selectedCountry, selectedState, countries, states, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: JobPostingFormData) => {
      const response = await axios.post(`${BASEURL}/api/v1/jobpost`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setPostedJob(data.data);
      setShowCandidates(true);
      alert({
        title: 'Success',
        description: 'Job posted successfully!',
        className: 'bg-green-500 text-white',
      });
    },
    onError: (error: any) => {
      alert({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to post job.',
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      });
    },
  });

  const onSubmit: SubmitHandler<JobPostingFormData> = (data) => {
    mutation.mutate(data);
  };

  return (

    <div className="min-h-screen bg-glassGold flex items-center justify-center p-4 sm:p-6 md:p-8">

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
        {showCandidates ? (
          <CandidateList jobId={postedJob?._id} />
        ) : (
          <div>
            <div className='flex items-center justify-between mb-6'>
              <button onClick={() => { navigate('/') }}> <ArrowLeft /> </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center sm:text-left">Create Job Posting</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label> */}
                  <JobTitleDropdown register={register} errors={errors} />

                  {errors.job_title && <p className="mt-1 text-sm text-red-600">{errors.job_title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Job Title</label>
                  <input
                    {...register('custom_job_title')}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g., Senior Full Stack Developer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                <textarea
                  {...register('job_description', { required: 'Job description is required' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-32"
                  placeholder="Describe the job responsibilities and requirements..."
                />
                {errors.job_description && <p className="mt-1 text-sm text-red-600">{errors.job_description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <SkillsDropdown
                  selectedSkills={watch('skills')}
                  onChange={(skills) => setValue('skills', skills)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender Preference</label>
                  <select
                    {...register('gender_preference')}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="Any">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1">Required Experience</label> */}
                  <ExperienceDropdown register={register} errors={errors} />

                  {errors.required_experience && <p className="mt-1 text-sm text-red-600">{errors.required_experience.message}</p>}
                </div>
              </div>

              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label> */}
                <SalaryTypeDropdown register={register} errors={errors} />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                  <input
                    type="number"
                    {...register('salary_range.min', { required: 'Minimum salary is required', min: 0 })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g., 50000"
                  />
                  {errors.salary_range?.min && <p className="mt-1 text-sm text-red-600">{errors.salary_range.min.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                  <input
                    type="number"
                    {...register('salary_range.max', { required: 'Maximum salary is required', min: 0 })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g., 80000"
                  />
                  {errors.salary_range?.max && <p className="mt-1 text-sm text-red-600">{errors.salary_range.max.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  {...register('job_type', { required: 'Job type is required' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
                {errors.job_type && <p className="mt-1 text-sm text-red-600">{errors.job_type.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    {...register('work_timings.start', { required: 'Start time is required' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  {errors.work_timings?.start && <p className="mt-1 text-sm text-red-600">{errors.work_timings.start.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    {...register('work_timings.end', { required: 'End time is required' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  {errors.work_timings?.end && <p className="mt-1 text-sm text-red-600">{errors.work_timings.end.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                <div className="flex flex-wrap gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label key={day} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={day}
                        {...register('working_days', { required: 'Select at least one working day' })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
                {errors.working_days && <p className="mt-1 text-sm text-red-600">{errors.working_days.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                <div className="flex flex-wrap gap-4">
                  {['Health insurance', 'Paid vacation', 'Product discounts', 'Commission bonuses'].map((benefit) => (
                    <label key={benefit} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={benefit}
                        {...register('benefits')}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-700">{benefit}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vacancy Count</label>
                <input
                  type="number"
                  {...register('vacancy_count', { required: 'Vacancy count is required', min: 1 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., 1"
                />
                {errors.vacancy_count && <p className="mt-1 text-sm text-red-600">{errors.vacancy_count.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  {...register('location', { required: 'Location is required' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., Remote or On-site"
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    {...register('address.country', { required: 'Country is required' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.address?.country && <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    {...register('address.state', { required: 'State is required' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    disabled={!selectedCountry}
                  >
                    <option value="">Select a state</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {errors.address?.state && <p className="nt-1 text-sm text-red-600">{errors.address.state.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    {...register('address.city', { required: 'City is required' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    disabled={!selectedState}
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.address?.city && <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode (Optional)</label>
                  <input
                    {...register('address.pincode')}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g., 94105"
                  />
                </div>
              </div>

              {/* Hidden inputs for ISO codes */}
              <input type="hidden" {...register('address.countryIsoCode')} />
              <input type="hidden" {...register('address.stateIsoCode')} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
                  <input
                    {...register('contact_person.name', { required: 'Contact person name is required' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g., John Doe"
                  />
                  {errors.contact_person?.name && <p className="mt-1 text-sm text-red-600">{errors.contact_person.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Phone</label>
                  <input
                    {...register('contact_person.phone', { required: 'Contact person phone is required' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g., +1 123-456-7890"
                  />
                  {errors.contact_person?.phone && <p className="mt-1 text-sm text-red-600">{errors.contact_person.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Email</label>
                <input
                  {...register('contact_person.email', {
                    required: 'Contact person email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., john.doe@example.com"
                />
                {errors.contact_person?.email && <p className="mt-1 text-sm text-red-600">{errors.contact_person.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  {...register('application_deadline', { required: 'Application deadline is required' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                {errors.application_deadline && <p className="mt-1 text-sm text-red-600">{errors.application_deadline.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Details</label>
                <textarea
                  {...register('interview_details', { required: 'Interview details are required' })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-32"
                  placeholder="Provide details about the interview process..."
                />
                {errors.interview_details && <p className="mt-1 text-sm text-red-600">{errors.interview_details.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-customRed text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  'Post Job'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPostingForm;