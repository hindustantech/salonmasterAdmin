const salaryTypes = [
    'Fixed', 'Commission', 'Fixed + Commission', 'Negotiable'
];


import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface SalaryTypeDropdownProps {
    register: UseFormRegister<any>;
    errors: FieldErrors;
}

export default function SalaryTypeDropdown({ register, errors }: SalaryTypeDropdownProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Type
            </label>
            <select
                {...register("salary_type", { required: "Salary type is required" })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                defaultValue=""
            >
                <option value="" disabled>
                    Select salary type
                </option>
                {salaryTypes.map((type, index) => (
                    <option key={index} value={type}>
                        {type}
                    </option>
                ))}
            </select>

            {errors?.salary_type && (
                <p className="mt-1 text-sm text-red-600">{String(errors.salary_type.message)}</p>
            )}
        </div>
    );
}
