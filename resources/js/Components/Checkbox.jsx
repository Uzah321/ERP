import { Checkbox as CarbonCheckbox } from '@carbon/react';

export default function Checkbox({ className = '', onChange, id, name, ...props }) {
    const handleChange = (_, { checked }) => {
        if (onChange) {
            onChange({ target: { checked } });
        }
    };

    return (
        <CarbonCheckbox
            {...props}
            id={id || name || 'checkbox'}
            labelText=""
            hideLabel
            onChange={handleChange}
            className={className}
        />
    );
}
