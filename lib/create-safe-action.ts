import { z } from "zod";

/**
 * 定义一个字段错误的对象类型，它是一个键值对，其中键是输入类型T的属性名，
 * 值是一个字符串数组，用于存储该字段的错误信息。
 *
 * @template T 输入数据的类型
 */
export type FieldErrors<T> = {
    [K in keyof T]?: string[];
};

/**
 * 定义一个动作状态的对象类型，封装了动作的执行状态，包括字段错误、全局错误信息和动作返回的数据。
 *
 * @template TInput 输入数据的类型
 * @template TOutput 输出数据的类型
 */
export type ActionState<TInput, TOutput> = {
    fieldErrors?: FieldErrors<TInput>; // 字段级别的错误信息
    error?: string | null; // 全局错误信息
    data?: TOutput; // 动作处理后的数据
};

/**
 * 创建一个安全的动作处理器，该处理器会首先使用指定的Zod模式对输入数据进行验证，验证失败则返回错误信息，
 * 验证成功则调用处理函数进行进一步的处理。
 *
 * @template TInput 输入数据的类型
 * @template TOutput 输出数据的类型
 * @param scheme Zod模式对象，用于验证输入数据
 * @param handler 验证成功后调用的处理函数，接受验证后的数据，返回动作状态对象
 * @returns 返回一个异步函数，该函数接受输入数据，返回一个动作状态对象的Promise
 */
export const createSafeAction = <TInput, TOutput>(
    scheme: z.Schema<TInput>,
    handler: (validateData: TInput) => Promise<ActionState<TInput, TOutput>>
) => {
    return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
        const validationResult = scheme.safeParse(data);
        // 验证失败，返回字段级别的错误信息
        if (!validationResult.success) {
            return {
                fieldErrors: validationResult.error.flatten()
                    .fieldErrors as FieldErrors<TInput>,
            };
        }
        // 验证成功，调用处理函数并返回结果
        return handler(validationResult.data);
    };
};
