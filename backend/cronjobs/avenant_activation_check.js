// backend/cronjobs/avenant_activation_check.js
// Activates Avenants whose activate_at date has passed

const db = require('../db/connection');
const cron = require('node-cron');

// Main function to check and activate avenants
async function checkAvenantActivations() {
    try {
        const updateQuery = `
            UPDATE Avenant
            SET status = 'Active'
            WHERE activate_at <= CURDATE()
            AND activate_at IS NOT NULL
            AND status = 'Pending'
        `;

        await new Promise((resolve, reject) => {
            db.query(updateQuery, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

    } catch (error) {
        console.error('Error during avenant activation check:', error);
    }
}

// Function to set up the cron job (daily at 00:00 AM)
function setupCronJob() {
    cron.schedule('0 0 * * *', async () => {
        await checkAvenantActivations();
    }, {
        scheduled: true,
        timezone: "Europe/Paris"
    });
}

// Optional: Run immediately (e.g., for testing)
async function runNow() {
    await checkAvenantActivations();
}

module.exports = {
    setupCronJob,
    runNow,
    checkAvenantActivations
};
