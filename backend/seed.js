// seed.js

// Import necessary libraries
const { faker } = require('@faker-js/faker');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables from .env file

// Main function to seed the database
const seedDatabase = async () => {
    let connection;
    try {
        // --- 1. CONNECT TO DATABASE ---
        // Create a connection using the credentials from your .env file
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Successfully connected to the database.');
        
        // --- 2. CLEAR EXISTING DATA (Optional, but recommended for clean slate) ---
        // This prevents errors if you run the seed script multiple times.
        // It's set to ignore foreign key checks during the truncation.
        console.log('Clearing existing customer and account data...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0;');
        await connection.execute('TRUNCATE TABLE transactions;');
        await connection.execute('TRUNCATE TABLE accounts;');
        await connection.execute('TRUNCATE TABLE users;');
        await connection.execute('TRUNCATE TABLE customers;');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Previous data cleared.');


        // --- 3. GENERATE AND INSERT 500 CUSTOMERS ---
        console.log('Starting to seed 500 new customers...');
        const totalCustomers = 500;
        const plainPassword = 'password123'; // All customers will have the same initial password

        for (let i = 0; i < totalCustomers; i++) {
            // Generate fake customer data
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = faker.internet.email({ firstName, lastName, provider: 'fakermail.com' });
            const username = faker.internet.userName({ firstName, lastName }).toLowerCase() + Math.floor(Math.random() * 100);

            // Hash the password using bcryptjs, just like in your real application
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(plainPassword, salt);
            
            // Start a transaction to ensure all related inserts succeed or none do
            await connection.beginTransaction();

            try {
                // Insert into 'customers' table
                const [customerResult] = await connection.execute(
                    'INSERT INTO customers (first_name, last_name, email, phone_number, address, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        firstName,
                        lastName,
                        email,
                        faker.phone.number(),
                        faker.location.streetAddress({ useFullAddress: true }),
                        faker.date.birthdate({ min: 18, max: 65, mode: 'age' })
                    ]
                );
                const newCustomerId = customerResult.insertId;

                // Insert into 'users' table, linking to the new customer
                await connection.execute(
                    'INSERT INTO users (customer_id, username, password_hash, user_type) VALUES (?, ?, ?, ?)',
                    [newCustomerId, username, passwordHash, 'customer']
                );
                
                // Insert a 'Checking' account for the new customer
                await connection.execute(
                    'INSERT INTO accounts (customer_id, account_number, account_type, balance) VALUES (?, ?, ?, ?)',
                    [
                        newCustomerId,
                        faker.finance.accountNumber(10), // Generate a 10-digit account number
                        'Checking',
                        faker.finance.amount({ min: 500, max: 20000, dec: 2 }) // Give them a starting balance
                    ]
                );
                
                // If all inserts are successful, commit the transaction
                await connection.commit();
                
                 // Log progress every 50 customers
                if ((i + 1) % 50 === 0) {
                    console.log(`- Seeded ${i + 1}/${totalCustomers} customers.`);
                }

            } catch (innerError) {
                // If any insert fails, roll back the transaction
                await connection.rollback();
                console.error(`Failed to insert customer ${i + 1}. Rolled back transaction.`, innerError);
            }
        }
        
        console.log('\n✅ Seeding complete!');
        console.log(`Successfully added ${totalCustomers} customers to the database.`);
        console.log('You can now log in with any of the generated usernames.');
        console.log('The password for all customers is: password123');

    } catch (error) {
        console.error('An error occurred during the seeding process:', error);
    } finally {
        // --- 4. CLOSE THE DATABASE CONNECTION ---
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
};

// Execute the main seeding function
seedDatabase();