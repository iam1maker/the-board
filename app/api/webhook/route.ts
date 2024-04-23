import { Stripe } from "stripe";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { stripe } from "@/lib/stripe";

/**
 * 处理Stripe Webhook POST请求的异步函数。
 * 
 * @param req - 包含请求数据的Request对象。
 * @returns 返回一个NextResponse对象，表示对请求的响应。在处理成功时，返回状态码200的响应；在处理出错时，返回状态码400的响应。
 */
export async function POST(req: Request) {
    // 从请求体中获取消息体内容
    const body = await req.text()
    // 从请求头中获取Stripe签名
    const signature = headers().get("Stripe-Signature") as string

    let event: Stripe.Event;

    try {
        // 根据消息体内容、签名和Webhook密钥构造Stripe事件对象
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!, // 环境变量中的Stripe Webhook密钥
        )
    } catch (error) {
        // 如果构造事件对象失败，则返回错误响应
        return new NextResponse("Webhook error", { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // 检查事件类型，并根据不同的事件类型执行相应的逻辑
    if (event.type === "checkout.session.completed") {
        // 如果是结账会话完成事件，则检索相关的订阅信息
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        // 检查是否提供了必要的orgId元数据
        if (!session?.metadata?.orgId) {
            return new NextResponse("org ID is required", { status: 400 })
        }

        // 在数据库中创建组织订阅记录
        await db.orgSubscription.create({
            data: {
                orgId: session?.metadata?.orgId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        });
    }

    if (event.type === "invoice.payment_succeeded") {
        // 如果是发票支付成功事件，则更新相应的订阅信息
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        // 在数据库中更新组织订阅记录
        await db.orgSubscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        });
    }

    // 返回成功的响应
    return new NextResponse(null, { status: 200 });
}