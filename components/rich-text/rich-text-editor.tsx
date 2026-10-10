"use client";

import { useMemo, useRef, useState } from "react";
import {
    EditorContent,
    useEditor,
    useEditorState,
    type Editor,
} from "@tiptap/react";
import {
    Bold,
    Code,
    Heading2,
    Italic,
    Link2,
    List,
    ListOrdered,
    Quote,
    Strikethrough,
    type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { createExtensions, getMarkdown } from "./extensions";

interface RichTextEditorProps {
    initialContent?: string;
    placeholder?: string;
    submitLabel?: string;
    isSubmitting?: boolean;
    autoFocus?: boolean;
    /** Show Cancel next to the submit button. */
    onCancel?: () => void;
    /** Receives Markdown; return true to clear the editor (e.g. after posting a comment). */
    onSubmit: (markdown: string) => void | boolean | Promise<void | boolean>;
    className?: string;
}

export const RichTextEditor = ({
    initialContent = "",
    placeholder,
    submitLabel = "Save",
    isSubmitting,
    autoFocus,
    onCancel,
    onSubmit,
    className,
}: RichTextEditorProps) => {
    const extensions = useMemo(
        () => createExtensions({ placeholder, editable: true }),
        [placeholder],
    );

    const submit = async (editor: Editor) => {
        const shouldClear = await onSubmit(getMarkdown(editor));
        if (shouldClear) {
            editor.commands.clearContent();
        }
    };

    // handleKeyDown is bound once when the editor is created, so it reads the
    // latest submit/cancel handlers through a ref instead of a stale closure.
    const keyHandlersRef = useRef({ submit: () => {} });

    const editor = useEditor({
        extensions,
        content: initialContent,
        immediatelyRender: false,
        autofocus: autoFocus ? "end" : false,
        editorProps: {
            attributes: {
                class: "min-h-[96px] px-3 py-2 focus:outline-none",
            },
            handleKeyDown: (_view, event) => {
                // Cmd/Ctrl+Enter saves (Escape is handled on the wrapper below).
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    keyHandlersRef.current.submit();
                    return true;
                }
                return false;
            },
        },
    });

    keyHandlersRef.current = {
        submit: () => {
            if (editor) void submit(editor);
        },
    };

    const isEmpty = useEditorState({
        editor,
        selector: ({ editor }) => editor?.isEmpty ?? true,
    });

    return (
        // Escape is caught here rather than in ProseMirror: a parent dialog may
        // already have marked the event as handled, which ProseMirror respects.
        <div
            className={cn("space-y-2", className)}
            onKeyDown={(e) => {
                if (e.key === "Escape" && onCancel) {
                    e.stopPropagation();
                    onCancel();
                }
            }}
        >
            <div className="overflow-hidden rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
                {editor && <Toolbar editor={editor} />}
                <EditorContent editor={editor} className="rich-text text-sm" />
            </div>
            <div className="flex items-center gap-x-2">
                <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    disabled={
                        !editor || !!isSubmitting || (!!isEmpty && !onCancel)
                    }
                    onClick={() => editor && submit(editor)}
                >
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                )}
                <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                    Markdown supported · ⌘/Ctrl + Enter to save
                </span>
            </div>
        </div>
    );
};

type ToolbarItem = {
    icon: LucideIcon;
    label: string;
    isActive: (editor: Editor) => boolean;
    run: (editor: Editor) => void;
};

const TOOLBAR_ITEMS: ToolbarItem[] = [
    {
        icon: Heading2,
        label: "Heading",
        isActive: (e) => e.isActive("heading", { level: 2 }),
        run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        icon: Bold,
        label: "Bold",
        isActive: (e) => e.isActive("bold"),
        run: (e) => e.chain().focus().toggleBold().run(),
    },
    {
        icon: Italic,
        label: "Italic",
        isActive: (e) => e.isActive("italic"),
        run: (e) => e.chain().focus().toggleItalic().run(),
    },
    {
        icon: Strikethrough,
        label: "Strikethrough",
        isActive: (e) => e.isActive("strike"),
        run: (e) => e.chain().focus().toggleStrike().run(),
    },
    {
        icon: List,
        label: "Bulleted list",
        isActive: (e) => e.isActive("bulletList"),
        run: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
        icon: ListOrdered,
        label: "Numbered list",
        isActive: (e) => e.isActive("orderedList"),
        run: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
        icon: Quote,
        label: "Quote",
        isActive: (e) => e.isActive("blockquote"),
        run: (e) => e.chain().focus().toggleBlockquote().run(),
    },
    {
        icon: Code,
        label: "Code",
        isActive: (e) => e.isActive("code") || e.isActive("codeBlock"),
        run: (e) => e.chain().focus().toggleCode().run(),
    },
];

const Toolbar = ({ editor }: { editor: Editor }) => {
    // Re-render the toolbar when the selection's marks change.
    const active = useEditorState({
        editor,
        selector: ({ editor }) =>
            TOOLBAR_ITEMS.map((item) => item.isActive(editor)).concat(
                editor.isActive("link"),
            ),
    });

    return (
        <div
            role="toolbar"
            aria-label="Formatting"
            className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-1.5 py-1"
        >
            {TOOLBAR_ITEMS.map((item, i) => (
                <ToolbarButton
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    isActive={active[i]}
                    onClick={() => item.run(editor)}
                />
            ))}
            <LinkButton
                editor={editor}
                isActive={active[TOOLBAR_ITEMS.length]}
            />
        </div>
    );
};

interface ToolbarButtonProps {
    label: string;
    icon: LucideIcon;
    isActive: boolean;
    onClick?: () => void;
}

const ToolbarButton = ({
    label,
    icon: Icon,
    isActive,
    onClick,
}: ToolbarButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={isActive}
        title={label}
        className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive && "bg-secondary text-secondary-foreground",
        )}
    >
        <Icon className="h-4 w-4" aria-hidden />
    </button>
);

const LinkButton = ({
    editor,
    isActive,
}: {
    editor: Editor;
    isActive: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");

    const onOpenChange = (next: boolean) => {
        if (next) {
            setUrl(editor.getAttributes("link").href ?? "");
        }
        setOpen(next);
    };

    const apply = () => {
        const href = url.trim();
        const chain = editor.chain().focus().extendMarkRange("link");
        if (href) {
            chain.setLink({ href }).run();
        } else {
            chain.unsetLink().run();
        }
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Link"
                    aria-pressed={isActive}
                    title="Link"
                    className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive && "bg-secondary text-secondary-foreground",
                    )}
                >
                    <Link2 className="h-4 w-4" aria-hidden />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 space-y-2 p-3" align="start">
                <label
                    htmlFor="rich-text-link"
                    className="text-xs font-semibold text-foreground"
                >
                    Link URL
                </label>
                <Input
                    id="rich-text-link"
                    value={url}
                    placeholder="https://"
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            apply();
                        }
                    }}
                    className="h-8"
                    autoFocus
                />
                <div className="flex gap-x-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={apply}
                    >
                        Apply
                    </Button>
                    {isActive && (
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                editor
                                    .chain()
                                    .focus()
                                    .extendMarkRange("link")
                                    .unsetLink()
                                    .run();
                                setOpen(false);
                            }}
                        >
                            Remove
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
