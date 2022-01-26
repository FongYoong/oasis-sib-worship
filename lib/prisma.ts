import { PrismaClient } from '@prisma/client'

//let prisma : PrismaClient
declare let prisma: PrismaClient;
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient
}

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
} else {
    if (!globalThis.prisma) {
        global.prisma = new PrismaClient()
    }
    prisma = global.prisma
}

export default prisma