import { z } from "zod";

import { Checklist } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { DeleteChecklist } from "./schema";

export type InputType = z.infer<typeof DeleteChecklist>;
export type ReturnType = ActionState<InputType, Checklist>;
