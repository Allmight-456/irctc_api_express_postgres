const prisma = require('../../prisma/client');

const getAvailableTrains = async (source, destination) => {
    try {
        const trains = await prisma.train.findMany({
            where: {
                AND: [
                    { source: { equals: source, mode: 'insensitive' } },
                    { destination: { equals: destination, mode: 'insensitive' } },
                    { seats: { gt: 0 } }
                ]
            },
            select: {
                id: true,
                name: true,
                seats: true,
                fare: true,
                trainNumber: true
            }
        });

        return trains.map(train => ({
            ...train,
            availableSeats: train.seats
        }));
    } catch (error) {
        console.error('Error in getAvailableTrains:', error);
        throw error;
    }
};

module.exports = {
    getAvailableTrains
};