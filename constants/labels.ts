/**
 * Label and cover palettes. Keys are stored in the database; classes are
 * listed in full so Tailwind can see them.
 */
export const LABEL_COLORS = {
    green: { name: "Green", className: "bg-emerald-500 text-white" },
    yellow: { name: "Yellow", className: "bg-amber-400 text-amber-950" },
    orange: { name: "Orange", className: "bg-orange-500 text-white" },
    red: { name: "Red", className: "bg-red-500 text-white" },
    purple: { name: "Purple", className: "bg-violet-500 text-white" },
    blue: { name: "Blue", className: "bg-blue-500 text-white" },
    sky: { name: "Sky", className: "bg-sky-400 text-sky-950" },
    lime: { name: "Lime", className: "bg-lime-500 text-lime-950" },
    pink: { name: "Pink", className: "bg-pink-500 text-white" },
    slate: { name: "Slate", className: "bg-slate-600 text-white" },
} as const;

export type LabelColor = keyof typeof LABEL_COLORS;

export const LABEL_COLOR_KEYS = Object.keys(LABEL_COLORS) as [
    LabelColor,
    ...LabelColor[],
];

/** Created for a board the first time its labels are requested (like Trello). */
export const DEFAULT_LABEL_COLORS: LabelColor[] = [
    "green",
    "yellow",
    "orange",
    "red",
    "purple",
    "blue",
];

export const COVER_COLORS = {
    green: "bg-emerald-500",
    yellow: "bg-amber-400",
    orange: "bg-orange-500",
    red: "bg-red-500",
    purple: "bg-violet-500",
    blue: "bg-blue-500",
    sky: "bg-sky-400",
    lime: "bg-lime-500",
    pink: "bg-pink-500",
    slate: "bg-slate-600",
} as const;

export type CoverColor = keyof typeof COVER_COLORS;

export const COVER_COLOR_KEYS = Object.keys(COVER_COLORS) as [
    CoverColor,
    ...CoverColor[],
];

/** Only Unsplash images (already used for board backgrounds) are accepted as covers. */
export const COVER_IMAGE_HOST = "https://images.unsplash.com/";

export const MAX_LABEL_NAME_LENGTH = 50;
export const MAX_RICH_TEXT_LENGTH = 20_000;
export const MAX_CHECKLIST_TITLE_LENGTH = 200;
