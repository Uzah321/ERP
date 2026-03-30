import { Button } from '@carbon/react';

export default function DangerButton({ className = '', disabled, children, ...props }) {
    return (
        <Button kind="danger" disabled={disabled} className={className} {...props}>
            {children}
        </Button>
    );
}
