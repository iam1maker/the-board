"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import { cn } from "@/lib/utils";
import { createExtensions } from "./extensions";

interface RichTextViewerProps {
    content: string;
    className?: string;
}

/** Read-only rendering of stored Markdown through the same schema as the editor. */
export const RichTextViewer = ({ content, className }: RichTextViewerProps) => {
    const extensions = useMemo(() => createExtensions({ editable: false }), []);
    const editor = useEditor({
        extensions,
        content,
        editable: false,
        immediatelyRender: false,
        // Rendered content, not an input: don't expose it as a textbox.
        editorProps: { attributes: { role: "document" } },
    });

    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            editor.commands.setContent(content);
        }
    }, [editor, content]);

    return (
        <EditorContent editor={editor} className={cn("rich-text", className)} />
    );
};
