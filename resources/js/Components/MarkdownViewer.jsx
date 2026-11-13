import { useEffect, useRef } from 'react';

export default function MarkdownViewer({ content }) {
    const el = useRef(null);

    useEffect(() => {
        let viewer;
        let cancelled = false;

        (async () => {
            const [{ default: Viewer }] = await Promise.all([
                import('@toast-ui/editor/dist/toastui-editor-viewer'),
                import('@toast-ui/editor/dist/toastui-editor-viewer.css'),
            ]);
            if (cancelled || !el.current) return;
            viewer = new Viewer({ el: el.current, initialValue: content || '' });
        })();

        return () => {
            cancelled = true;
            viewer?.destroy?.();
        };
    }, [content]);

    return <div ref={el} className="min-h-32" />;
}
