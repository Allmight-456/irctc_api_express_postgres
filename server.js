require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./app/routes');
const prisma = require('./prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

async function startServer() {
    try {
        await prisma.$connect();
        console.log('Database connection successful');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

startServer();

// Cleanup on server shutdown
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});