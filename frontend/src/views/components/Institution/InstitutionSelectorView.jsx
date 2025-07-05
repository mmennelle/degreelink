// views/components/Institution/InstitutionSelectorView.jsx
export const InstitutionSelectorView = ({ 
    institutions, 
    value, 
    onChange, 
    label, 
    placeholder = "Select institution" 
}) => {
    return (
        <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                {label}:
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px' 
                }}
            >
                <option value="">{placeholder}</option>
                {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>
                        {inst.name}
                    </option>
                ))}
            </select>
        </div>
    );
};