
import type { FieldErrors, UseFormRegister } from "react-hook-form";
const experiences = [
  'Fresher', '6 months', '1 year', '2 years', '3+ years'
];



interface ExperienceDropdownProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export default function ExperienceDropdown({ register, errors }: ExperienceDropdownProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Required Experience
      </label>
      <select
        {...register("required_experience", {
          required: "Required experience is required"
        })}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        defaultValue=""
      >
        <option value="" disabled>
          Select experience
        </option>
        {experiences.map((exp, index) => (
          <option key={index} value={exp}>
            {exp}
          </option>
        ))}
      </select>

      {errors.required_experience && (
        <p className="mt-1 text-sm text-red-600">
          {String(errors.required_experience.message)}
        </p>
      )}
    </div>
  );
}
