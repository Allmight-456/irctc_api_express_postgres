# IRCTC API with Prisma and Express

A RESTful API for train booking system using Express.js and Prisma ORM.

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/Allmight-456/irctc_api_express_postgres.git
cd irctc_api_express_postgres
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```properties
DATABASE_URL="your-prisma-accelerate-connection-string"
SECRET_KEY="your-jwt-secret-key"
API_KEY="your-admin-api-key"
```

### 3. Prisma Setup
```bash
# Install Prisma dependencies
npm install prisma @prisma/client@latest @prisma/extension-accelerate

# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Start Prisma Studio (database GUI)
npx prisma studio
```

### 4. Start the Server
```bash
node server.js
```

## API Endpoints

### User Management
- Register: `POST /api/users/register`
- Login: `POST /api/users/login`

### Train Management
- Add Train (Admin): `POST /api/trains`
- View All Trains: `GET /api/trains`
- Check Availability: `GET /api/trains/availability`

### Booking Management
- Create Booking: `POST /api/bookings`
- View Booking: `GET /api/bookings/:id`

## Sample Requests

### Register User
```http
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

### Login
```http
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

### Add Train (Admin)
```http
POST http://localhost:3000/api/trains
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "trainNumber": "12345",
    "name": "Rajdhani Express",
    "source": "Delhi",
    "destination": "Mumbai",
    "seats": 100,
    "fare": 1500.00
}
```

### Book Seats
```http
POST http://localhost:3000/api/bookings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "trainId": 1,
    "seats": 2
}
```


## Race Condition Handling

### Booking Transactions
The project uses Prisma's transactions to handle concurrent bookings and prevent race conditions:

```javascript
const booking = await prisma.$transaction(async (prisma) => {
    // 1. Check seat availability in a transaction
    const train = await prisma.train.findUnique({
        where: { id: trainId }
    });

    if (!train || train.seats < requestedSeats) {
        throw new Error('Insufficient seats');
    }

    // 2. Create booking and update seats atomically
    const newBooking = await prisma.booking.create({
        data: {
            userId,
            trainId,
            seats: requestedSeats,
            status: 'CONFIRMED'
        }
    });

    // 3. Update train seats
    await prisma.train.update({
        where: { id: trainId },
        data: { seats: train.seats - requestedSeats }
    });

    return newBooking;
});
```

### Transaction Benefits
- **Atomicity**: Either the entire booking process succeeds or fails
- **Isolation**: Concurrent bookings don't interfere with each other
- **Consistency**: Seat count remains accurate even with simultaneous bookings
- **Deadlock Prevention**: Prisma handles transaction conflicts automatically

### Race Condition Examples Prevented:
1. Two users booking last seat simultaneously
2. Overbooking beyond available seats
3. Inconsistent seat counts due to concurrent updates

// ...existing code...
## Project Structure
```
irctc-api/
├── app/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── prisma/
│   └── schema.prisma
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Important Notes
- Prisma Studio runs on port 5555
- API server runs on port 3000
- Keep your JWT tokens secure
- Never commit `.env` file
