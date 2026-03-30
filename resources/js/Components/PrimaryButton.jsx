import { Button } from '@carbon/react';

export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <Button kind="primary" disabled={disabled} className={className} {...props}>
            {children}
        </Button>
    );
}
