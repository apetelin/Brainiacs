const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const relatives = [
        {
            userId: 1,
            name: 'John Doe',
            dob: '1950-01-01',
            address: '123 Main St, City, Country',
            phone: '+1234567890',
            relationship: 'Son'
        },
        {
            userId: 1,
            name: 'Jane Doe',
            dob: '1952-05-15',
            address: '456 Elm St, City, Country',
            phone: '+1987654321',
            relationship: 'Daughter'
        },
        {
            userId: 1,
            name: 'Mary Doe',
            dob: '1975-08-20',
            address: '789 Oak St, City, Country',
            phone: '+1122334455',
            relationship: 'Daughter'
        },
        {
            userId: 1,
            name: 'Eric Doe',
            dob: '1998-03-10',
            address: '101 Pine St, City, Country',
            phone: '+1555666777',
            relationship: 'Grandson'
        },
        {
            userId: 1,
            name: 'Sarah Doe',
            dob: '2000-11-05',
            address: '202 Maple St, City, Country',
            phone: '+1777888999',
            relationship: 'Granddaughter'
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

    // Generate a large number of payments more suitable for an elderly woman
    const startDate = new Date('2023-01-01')
    const endDate = new Date('2023-12-31')
    const paymentRecipients = [
        'Electric Company',
        'Water Services',
        'Telephone Company',
        'Gas Company',
        'Grocery Store',
        'Medicare Supplement Insurance',
        'Prescription Medication',
        'Property Tax',
        'Home Insurance',
        'Cable TV Provider',
        'Charitable Donation',
        'Senior Center Membership',
        'Medical Specialist',
        'Home Cleaning Service',
        'Gardening Service'
    ]

    const payments = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const numPayments = Math.floor(Math.random() * 3) // 0 to 2 payments per day
        for (let i = 0; i < numPayments; i++) {
            const recipient = paymentRecipients[Math.floor(Math.random() * paymentRecipients.length)]
            payments.push({
                userId: 1,
                date: d.toISOString().split('T')[0],
                recipient: recipient,
                phone: '+1' + Math.floor(1000000000 + Math.random() * 9000000000),
                details: `Payment to ${recipient}`,
                amount: +(Math.random() * 200 + 10).toFixed(2) // Random amount between 10 and 210
            })
        }
    }

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

    console.log(`Database seeded with ${relatives.length} relatives and ${payments.length} payments`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })