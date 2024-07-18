const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    await prisma.relative.createMany({
        data: [
            { userId: 1, name: 'John Doe', dob: '1980-01-01', address: '123 Main St, City, Country', phone: '+1234567890' },
            { userId: 1, name: 'Jane Doe', dob: '1982-05-15', address: '456 Elm St, City, Country', phone: '+1987654321' },
        ],
    })

    await prisma.payment.createMany({
        data: [
            { userId: 1, date: '2023-07-01', recipient: 'Electric Company', phone: '+1122334455', details: 'Monthly electricity bill' },
            { userId: 1, date: '2023-07-05', recipient: 'Water Services', phone: '+1555666777', details: 'Quarterly water bill' },
        ],
    })

    console.log('Database seeded')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })