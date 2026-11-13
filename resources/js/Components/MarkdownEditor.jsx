import { useEffect, useRef } from 'react';

export default function MarkdownEditor({ value, onChange, height = '55vh' }) {
    const el = useRef(null);
    const handler = useRef(onChange);
    handler.current = onChange;

    useEffect(() => {
        let editor;
        let cancelled = false;

        (async () => {
            const [{ default: Editor }] = await Promise.all([
                import('@toast-ui/editor'),
                import('@toast-ui/editor/dist/toastui-editor.css'),
            ]);
            if (cancelled || !el.current) return;
            editor = new Editor({
                el: el.current,
                height,
                initialEditType: 'markdown',
                previewStyle: 'vertical',
                initialValue: value || '',
                usageStatistics: false,
                events: { change: () => handler.current(editor.getMarkdown()) },
            });
        })();

        return () => {
            cancelled = true;
            editor?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={el} className="min-h-40 rounded-lg border border-slate-300" />;
}
