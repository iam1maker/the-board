/**
 * 该模块导出与复制卡片操作相关的类型定义。
 * 它没有直接的函数或类定义，而是提供了类型推断和导出，以便在其他地方使用。
 */

import { z } from "zod";

// 导入Card实体类型和创建安全操作的ActionState类型
import { Card } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
// 导入CopyCard的schema，用于类型推断
import { CopyCard } from "./schema";

/**
 * InputType定义了CopyCard操作的输入类型。
 * 它通过Zod库的类型推断功能从CopyCard schema中获得。
 */
export type InputType = z.infer<typeof CopyCard>;

/**
 * ReturnType定义了执行CopyCard操作后的返回类型。
 * 它是ActionState的泛型实例，结合了InputType和Card类型。
 */
export type ReturnType = ActionState<InputType, Card>;
