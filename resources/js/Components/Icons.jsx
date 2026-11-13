function Svg({ children, className = 'h-5 w-5' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            {children}
        </svg>
    );
}

export const IconDots = (p) => (<Svg {...p}><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></Svg>);
export const IconEye = (p) => (<Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Svg>);
export const IconPencil = (p) => (<Svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></Svg>);
export const IconTrash = (p) => (<Svg {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></Svg>);
export const IconPlus = (p) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>);
export const IconDownload = (p) => (<Svg {...p}><path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M4 21h16" /></Svg>);
export const IconUpload = (p) => (<Svg {...p}><path d="M12 21V9" /><path d="M7 13l5-5 5 5" /><path d="M4 3h16" /></Svg>);
export const IconSpark = (p) => (<Svg {...p}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 17l.7 1.8L21.5 19.5l-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z" /></Svg>);
export const IconLogin = (p) => (<Svg {...p}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></Svg>);
export const IconUserPlus = (p) => (<Svg {...p}><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0114 0" /><path d="M19 8v6M16 11h6" /></Svg>);
export const IconClose = (p) => (<Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>);
