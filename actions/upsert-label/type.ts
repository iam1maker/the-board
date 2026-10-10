import { z } from "zod";

import { Label } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { UpsertLabel } from "./schema";

export type InputType = z.infer<typeof UpsertLabel>;
export type ReturnType = ActionState<InputType, Label>;
