import Select from 'react-select';

const MultiSelect = ({ selectedRoles, onChange, rolesList }) => {
  const options = rolesList.map(role => ({
    value: role.id,
    label: role.nombre
  }));

  const selectedOptions = options.filter(option =>
    selectedRoles.some(role => role.id === option.value)
  );

  const handleChange = selectedOptions => {
    const updatedRoles = selectedOptions.map(option => ({
      id: option.value,
      nombre: option.label
    }));
    onChange(updatedRoles);
  };

  return (
    <div className="w-full">
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="Selecciona un item..."
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderColor: '#d1d5db',
            boxShadow: 'none',
            '&:hover': { borderColor: '#a5b4fc' },
            padding: '0.1rem'
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#e0e7ff' : state.isFocused ? '#f3f4f6' : 'white',
            color: '#111827',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: '#e0e7ff',
            color: '#111827'
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: '#1f2937'
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: '#6b7280',
            ':hover': {
              backgroundColor: '#c7d2fe',
              color: '#1f2937'
            }
          })
        }}
      />
    </div>
  );
};

export default MultiSelect;
