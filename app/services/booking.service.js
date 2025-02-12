const prisma = require('../../prisma/client');

const bookSeat = async (userId, trainId, seats) => {
    try {
        const train = await prisma.train.findUnique({
            where: { id: trainId }
        });

        if (!train || train.seats < seats) {
            return [false, 'No seats available'];
        }

        const booking = await prisma.$transaction(async (prisma) => {
            // Create booking
            const newBooking = await prisma.booking.create({
                data: {
                    userId,
                    trainId,
                    seats,
                    status: 'CONFIRMED'
                }
            });

            // Update train seats
            await prisma.train.update({
                where: { id: trainId },
                data: { seats: train.seats - seats }
            });

            return newBooking;
        });

        return [true, 'Booking successful'];
    } catch (error) {
        console.error('Error in bookSeat:', error);
        throw error;
    }
};

module.exports = { bookSeat };