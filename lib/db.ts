import { PrismaClient } from '@prisma/client'

//用于储存prismaClient实例.
declare global {
    var prisma: PrismaClient | undefined
}

//它会尝试从 globalThis 对象中获取 prisma 变量的值，如果不存在，则创建一个新的 PrismaClient 实例。
export const db = globalThis.prisma || new PrismaClient()

//判断当前环境是否为生产环境，如果不是，则将 db 赋值给 globalThis.prisma，这样可以在整个应用中直接使用 globalThis.prisma 来访问 PrismaClient 实例，方便调试和开发。
if (process.env.NODE_ENV !="production") {
    globalThis.prisma = db
}