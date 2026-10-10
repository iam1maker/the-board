import type { AnyExtension, Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";

const SAFE_URL = /^(https?:|mailto:)/i;

interface ExtensionOptions {
    placeholder?: string;
    editable: boolean;
}

/**
 * Shared editor setup. Content is stored as Markdown with raw HTML disabled,
 * and links are limited to http(s)/mailto so stored text can't inject markup
 * or javascript: URLs.
 */
export const createExtensions = ({
    placeholder,
    editable,
}: ExtensionOptions): AnyExtension[] => [
    StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
            openOnClick: !editable,
            autolink: true,
            defaultProtocol: "https",
            protocols: ["http", "https", "mailto"],
            isAllowedUri: (url, ctx) =>
                ctx.defaultValidate(url) && SAFE_URL.test(url),
            HTMLAttributes: {
                target: "_blank",
                rel: "noopener noreferrer nofollow",
            },
        },
    }),
    Markdown.configure({
        html: false,
        linkify: true,
        breaks: true,
        transformPastedText: true,
    }),
    ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
];

export const getMarkdown = (editor: Editor): string =>
    (editor.storage as unknown as { markdown: MarkdownStorage }).markdown
        .getMarkdown()
        .trim();
