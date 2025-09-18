const jobTitles = ["Hair Stylist", "Beautician", "Nail Technician", "Spa Therapist", "Receptionist", "Manager", "Trainee", "Other"];

import type { FieldErrors, UseFormRegister } from "react-hook-form";

type JobTitleDropdownProps = {
    register: UseFormRegister<any>;
    errors: FieldErrors;
};

export default function JobTitleDropdown({ register, errors }: JobTitleDropdownProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
            </label>
            <select
                {...register("job_title", { required: "Job title is required" })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                defaultValue=""
            >
                <option value="" disabled>
                    Select a job title
                </option>
                {jobTitles.map((title, index) => (
                    <option key={index} value={title}>
                        {title}
                    </option>
                ))}
            </select>

            {errors.job_title && (
                <p className="mt-1 text-sm text-red-600">
                    {String(errors.job_title.message)}

                </p>
            )}
        </div>
    );
}
