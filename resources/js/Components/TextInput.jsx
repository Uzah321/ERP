import { forwardRef, useEffect } from 'react';
import { TextInput as CarbonTextInput, PasswordInput } from '@carbon/react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, labelText = '', hideLabel = true, ...props },
    ref,
) {
    useEffect(() => {
        if (isFocused) {
            ref?.current?.focus?.();
        }
    }, [isFocused, ref]);

    if (type === 'password') {
        return (
            <PasswordInput
                {...props}
                labelText={labelText}
                hideLabel={hideLabel}
                className={className}
                ref={ref}
            />
        );
    }

    return (
        <CarbonTextInput
            {...props}
            type={type}
            labelText={labelText}
            hideLabel={hideLabel}
            className={className}
            ref={ref}
        />
    );
});
