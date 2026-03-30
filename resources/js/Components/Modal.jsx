import { Modal as CarbonModal } from '@carbon/react';

const sizeMap = { sm: 'sm', md: 'md', lg: 'lg', xl: 'lg', '2xl': 'lg' };

export default function Modal({ children, show = false, maxWidth = '2xl', closeable = true, onClose = () => {} }) {
    return (
        <CarbonModal
            open={show}
            onRequestClose={closeable ? onClose : undefined}
            passiveModal
            size={sizeMap[maxWidth] ?? 'lg'}
            modalHeading=""
        >
            {children}
        </CarbonModal>
    );
}
