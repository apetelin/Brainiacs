const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const relatives = [
        {
            userId: 1,
            name: 'John Doe',
            dob: '1980-01-01',
            address: '123 Main St, City, Country',
            phone: '+1234567890',
            relationship: 'Son'
        },
        {
            userId: 1,
            name: 'Jane Doe',
            dob: '1982-05-15',
            address: '456 Elm St, City, Country',
            phone: '+1987654321',
            relationship: 'Daughter'
        },
    ]

    for (const relative of relatives) {
        await prisma.relative.upsert({
            where: {
                userId_name_dob: {
                    userId: relative.userId,
                    name: relative.name,
                    dob: relative.dob,
                }
            },
            update: relative,
            create: relative,
        })
    }

    const payments = [
        { userId: 1, date: '2023-07-01', recipient: 'Electric Company', phone: '+1122334455', details: 'Monthly electricity bill' },
        { userId: 1, date: '2023-07-05', recipient: 'Water Services', phone: '+1555666777', details: 'Quarterly water bill' },
    ]

    for (const payment of payments) {
        await prisma.payment.upsert({
            where: {
                userId_date_recipient: {
                    userId: payment.userId,
                    date: payment.date,
                    recipient: payment.recipient,
                }
            },
            update: payment,
            create: payment,
        })
    }

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