import { Button } from '@carbon/react';

export default function SecondaryButton({ className = '', disabled, children, type = 'button', ...props }) {
    return (
        <Button kind="secondary" disabled={disabled} type={type} className={className} {...props}>
            {children}
        </Button>
    );
}
