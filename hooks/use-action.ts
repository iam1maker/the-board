import { useState, useCallback } from "react";
import { ActionState, FieldErrors } from "@/lib/create-safe-action";

/**
 * 定义一个执行动作的类型，接收输入参数并返回一个Promise，Promise解析为动作状态。
 * @template TInput 输入类型。
 * @template TOutput 输出类型。
 * @param {TInput} data 输入数据。
 * @returns {Promise<ActionState<TInput, TOutput>>} 动作的状态，包含输入、输出和错误信息。
 */
type Action<TInput, TOutput> = (
    data: TInput
) => Promise<ActionState<TInput, TOutput>>;

/**
 * 定义使用动作时的选项接口，可选的成功、错误和完成回调。
 * @template TOutput 输出类型。
 */
interface UseActionOptions<TOutput> {
    onSuccess?: (data: TOutput) => void; // 成功时的回调函数。
    onError?: (error: string) => void; // 错误时的回调函数。
    onComplete?: () => void; // 完成时的回调函数，无论成功还是失败都会调用。
}

/**
 * 一个高阶函数，用于封装动作的执行逻辑，并提供状态管理（错误、加载状态、数据）。
 * @template TInput 输入类型。
 * @template TOutput 输出类型。
 * @param {Action<TInput, TOutput>} action 将要执行的动作。
 * @param {UseActionOptions<TOutput>} options 使用动作时的选项，包含回调函数。
 * @returns 返回一个对象，包含执行动作的方法和动作的状态。
 */
export const useAction = <TInput, TOutput>(
    action: Action<TInput, TOutput>,
    options: UseActionOptions<TOutput> = {}
) => {
    // 状态管理：字段错误、一般错误、数据和加载状态。
    const [fieldErrors, setFieldErrors] = useState<
        FieldErrors<TInput> | undefined
    >(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [data, setData] = useState<TOutput | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 使用 useCallback 函数优化，确保 action 执行时依赖项不变。
    const execute = useCallback(
        async (input: TInput) => {
            setIsLoading(true); // 设置加载状态为true。

            try {
                const result = await action(input); // 执行动作。
                if (!result) {
                    return; // 如果没有结果，则直接返回。
                }

                setFieldErrors(result.fieldErrors); // 设置字段错误。

                // 处理动作返回的错误。
                if (result.error) {
                    setError(result.error);
                    options.onError?.(result.error);
                }

                // 处理动作返回的数据。
                if (result.data) {
                    setData(result.data);
                    options.onSuccess?.(result.data);
                }
            } finally {
                setIsLoading(false); // 无论成功还是失败，最终都设置加载状态为false。
                options.onComplete?.(); // 调用完成回调。
            }
        },
        [action, options]
    );
    return { execute, fieldErrors, error, data, isLoading };
};
