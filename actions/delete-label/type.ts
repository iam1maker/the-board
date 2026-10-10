import { z } from "zod";

import { Label } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { DeleteLabel } from "./schema";

export type InputType = z.infer<typeof DeleteLabel>;
export type ReturnType = ActionState<InputType, Label>;
