import { useState, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import Select from 'react-select'
interface Skill {
  _id: string;
  skill_name: string;
}

interface SkillsDropdownProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

const SkillsDropdown = ({ selectedSkills, onChange }: SkillsDropdownProps) => {
  const [search, setSearch] = useState('');
  const selectRef = useRef<any>(null);
    const BASEURL=`https://backend.thesalonmaster.com`
  const fetchSkills = async ({ pageParam = 1 }) => {
    const response = await axios.get(`${BASEURL}/api/v1/skill`, {
      params: { page: pageParam, limit: 10, search },
    });
    return response.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['skills', search],
    queryFn: fetchSkills,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const skills = data?.pages.flatMap((page) => page.data) || [];

  const handleScroll = (event: any) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const options = skills.map((skill: Skill) => ({
    value: skill._id,
    label: skill.skill_name,
  }));

  return (
    <div className="relative">
      <Select
        ref={selectRef}
        isMulti
        options={options}
        value={options.filter((option) => selectedSkills.includes(option.value))}
        onChange={(selected) =>
          onChange(
            Array.isArray(selected)
              ? selected.map((option) => option.value)
              : []
          )
        }
        onInputChange={(input) => setSearch(input)}
        onMenuScrollToBottom={handleScroll}
        placeholder="Search and select skills..."
        className="mt-1"
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderColor: '#d1d5db',
            boxShadow: 'none',
            '&:hover': { borderColor: '#6366f1' },
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999,
          }),
        }}
      />
      {isFetchingNextPage && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-gray-500">
          Loading more skills...
        </div>
      )}
    </div>
  );
};

export default SkillsDropdown;