// Deprecated: Carbon form controls accept labelText prop directly.
// This component is kept for compatibility during migration.
export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label {...props} className={'cds--label ' + className}>
            {value ? value : children}
        </label>
    );
}
