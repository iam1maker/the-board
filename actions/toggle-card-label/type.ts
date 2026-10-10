import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import { ToggleCardLabel } from "./schema";

export type InputType = z.infer<typeof ToggleCardLabel>;
export type ReturnType = ActionState<
    InputType,
    { cardId: string; labelId: string; added: boolean }
>;
