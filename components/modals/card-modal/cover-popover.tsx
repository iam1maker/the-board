"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";

import { CardDetail } from "@/types";
import { cn } from "@/lib/utils";
import { unsplash } from "@/lib/unsplash";
import { defaultImages } from "@/constants/images";
import { COVER_COLORS, COVER_COLOR_KEYS, CoverColor } from "@/constants/labels";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useCardAction } from "@/hooks/use-card-action";
import { updateCard } from "@/actions/update-card";

const UNSPLASH_COLLECTION_ID = "317099";
const PHOTO_COUNT = 6;

type Photo = { id: string; thumb: string; regular: string; author: string };

const toPhoto = (image: Record<string, any>): Photo => ({
    id: image.id,
    thumb: image.urls.thumb,
    regular: image.urls.regular ?? image.urls.full,
    author: image.user.name,
});

interface CoverPopoverProps {
    card: CardDetail;
    children: React.ReactNode;
}

export const CoverPopover = ({ card, children }: CoverPopoverProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-3">
                {open && <CoverPicker card={card} />}
            </PopoverContent>
        </Popover>
    );
};

const CoverPicker = ({ card }: { card: CardDetail }) => {
    const boardId = card.list.board.id;
    const [photos, setPhotos] = useState<Photo[] | null>(null);
    const { execute, isLoading } = useCardAction(updateCard, card.id);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const result = await unsplash.photos.getRandom({
                    collectionIds: [UNSPLASH_COLLECTION_ID],
                    count: PHOTO_COUNT,
                });
                const images = Array.isArray(result.response)
                    ? (result.response as Array<Record<string, any>>)
                    : defaultImages.slice(0, PHOTO_COUNT);
                if (!cancelled) setPhotos(images.map(toPhoto));
            } catch (error) {
                console.log("[COVER_PHOTOS]", error);
                if (!cancelled) {
                    setPhotos(defaultImages.slice(0, PHOTO_COUNT).map(toPhoto));
                }
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const setColor = (coverColor: CoverColor) =>
        execute({ id: card.id, boardId, coverColor, coverImageUrl: null });
    const setImage = (coverImageUrl: string) =>
        execute({ id: card.id, boardId, coverImageUrl, coverColor: null });
    const remove = () =>
        execute({
            id: card.id,
            boardId,
            coverColor: null,
            coverImageUrl: null,
        });

    const hasCover = !!card.coverColor || !!card.coverImageUrl;

    return (
        <div className="space-y-3">
            <p className="text-center text-sm font-semibold text-foreground">
                Cover
            </p>
            <div>
                <p className="mb-1.5 text-xs font-semibold text-foreground">
                    Colors
                </p>
                <div
                    className="grid grid-cols-5 gap-1.5"
                    role="radiogroup"
                    aria-label="Cover color"
                >
                    {COVER_COLOR_KEYS.map((key) => {
                        const isSelected = card.coverColor === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                aria-label={key}
                                disabled={isLoading}
                                onClick={() => setColor(key)}
                                className={cn(
                                    "flex h-9 items-center justify-center rounded-md ring-offset-2 ring-offset-popover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    COVER_COLORS[key],
                                    isSelected && "ring-2 ring-foreground",
                                )}
                            >
                                {isSelected && (
                                    <Check
                                        className="h-4 w-4 text-white"
                                        aria-hidden
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div>
                <p className="mb-1.5 text-xs font-semibold text-foreground">
                    Photos from Unsplash
                </p>
                {!photos ? (
                    <div className="flex h-24 items-center justify-center">
                        <Loader2
                            className="h-5 w-5 animate-spin text-primary"
                            aria-label="Loading photos"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                        {photos.map((photo) => (
                            <button
                                key={photo.id}
                                type="button"
                                disabled={isLoading}
                                onClick={() => setImage(photo.regular)}
                                aria-label={`Photo by ${photo.author}`}
                                className={cn(
                                    "relative aspect-video overflow-hidden rounded-md bg-muted ring-offset-2 ring-offset-popover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    card.coverImageUrl === photo.regular &&
                                        "ring-2 ring-foreground",
                                )}
                            >
                                <Image
                                    src={photo.thumb}
                                    alt=""
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {hasCover && (
                <Button
                    variant="gray"
                    size="sm"
                    className="w-full"
                    onClick={remove}
                    disabled={isLoading}
                >
                    Remove cover
                </Button>
            )}
        </div>
    );
};
