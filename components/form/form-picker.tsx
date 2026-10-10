"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { CheckIcon, Loader2 } from "lucide-react";

import { unsplash } from "@/lib/unsplash";
import { cn } from "@/lib/utils";
import { defaultImages } from "@/constants/images";
import { FormErrors } from "./form-errors";

const UNSPLASH_COLLECTION_ID = "317099";
const IMAGE_COUNT = 9;

interface FormPickerProps {
    id: string;
    errors?: Record<string, string[] | undefined>;
}

export const FormPicker = ({ id, errors }: FormPickerProps) => {
    const { pending } = useFormStatus();

    const [images, setImages] =
        useState<Array<Record<string, any>>>(defaultImages);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const result = await unsplash.photos.getRandom({
                    collectionIds: [UNSPLASH_COLLECTION_ID],
                    count: IMAGE_COUNT,
                });
                if (result && result.response) {
                    setImages(result.response as Array<Record<string, any>>);
                } else {
                    console.log("Failed to get images from unsplash");
                }
            } catch (error) {
                console.log(error);
                setImages(defaultImages);
            } finally {
                setIsLoading(false);
            }
        };
        fetchImages();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2
                    className="h-6 w-6 animate-spin text-primary"
                    aria-label="Loading background images"
                />
            </div>
        );
    }

    return (
        <fieldset className="relative">
            <legend className="mb-2 text-xs font-semibold text-foreground">
                Background
            </legend>
            <div className="mb-2 grid grid-cols-3 gap-2">
                {images.map((image) => {
                    const isSelected = selectedImageId === image.id;
                    return (
                        <label
                            key={image.id}
                            className={cn(
                                "group relative aspect-video cursor-pointer overflow-hidden rounded-md bg-muted ring-offset-2 ring-offset-popover transition-opacity hover:opacity-90 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                                isSelected && "ring-2 ring-primary",
                                pending && "cursor-not-allowed opacity-50 hover:opacity-50"
                            )}
                        >
                            <input
                                type="radio"
                                name={id}
                                className="sr-only"
                                checked={isSelected}
                                disabled={pending}
                                onChange={() => setSelectedImageId(image.id)}
                                value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`}
                                aria-label={`Photo by ${image.user.name}`}
                            />
                            <Image
                                fill
                                alt=""
                                className="object-cover"
                                src={image.urls.thumb}
                                sizes="96px"
                            />
                            {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <CheckIcon
                                        className="h-4 w-4 text-white"
                                        aria-hidden
                                    />
                                </div>
                            )}
                            <Link
                                href={image.links.html}
                                target="_blank"
                                tabIndex={-1}
                                className="absolute bottom-0 w-full truncate bg-black/50 p-1 text-[10px] text-white opacity-0 hover:underline group-hover:opacity-100"
                            >
                                {image.user.name}
                            </Link>
                        </label>
                    );
                })}
            </div>
            <FormErrors id="image" errors={errors} />
        </fieldset>
    );
};
