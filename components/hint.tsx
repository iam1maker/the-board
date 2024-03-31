import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger    
} from "@/components/ui/tooltip"


interface HintProps{
    children: React.ReactNode;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    sideOffset?: number;
}

export const Hint = ({
    children,
    description,
    side = "bottom",
    sideOffset = 0
}: HintProps) =>{
    return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        {children}
                    </TooltipTrigger>
                    <TooltipContent
                    sideOffset={sideOffset}
                    side={side}
                    className="text-xs max-w-[220px] break-words"
                    >
                        {description}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
}