import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

const DAY_IN_MS = 84_400_000;

/**
 * 检查当前组织是否有有效的订阅。
 * 该函数首先从认证信息中获取组织ID，然后查询数据库以确定是否存在与该组织ID相关联的订阅记录。
 * 如果存在有效的订阅记录，且该订阅尚未过期，则函数返回 true；否则返回 false。
 *
 * @returns {Promise<boolean>} 返回一个承诺，如果组织有有效订阅则为 true，否则为 false。
 */
export const checkSubscription = async () => {
    // 从认证信息中提取组织ID
    const { orgId } = auth();

    // 如果没有组织ID，则直接返回 false
    if (!orgId) {
        return false;
    }

    // 从数据库中查询组织的订阅信息
    const orgSubscription = await db.orgSubscription.findUnique({
        where: {
            orgId,
        },
        select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripePriceId: true,
            stripeCustomerId: true,
        },
    });

    // 如果没有找到组织的订阅信息，则返回 false
    if (!orgSubscription) {
        return false;
    }

    // 判断订阅是否有效：必须有订阅价格ID且订阅的当前周期结束时间在当前时间之后
    const isValid =
        orgSubscription.stripePriceId &&
        orgSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
            Date.now();

    // 返回订阅是否有效的布尔值
    return !!isValid;
};
