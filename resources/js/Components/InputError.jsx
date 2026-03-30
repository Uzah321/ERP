// Deprecated: Carbon form controls accept invalidText prop directly.
// This component is kept for compatibility during migration.
export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={'cds--form-requirement ' + className} style={{ display: 'block', maxHeight: 'none' }}>
            {message}
        </p>
    ) : null;
}
