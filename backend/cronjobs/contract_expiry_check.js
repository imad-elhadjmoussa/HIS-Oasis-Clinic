// backend/cronjobs/contract_expiry_check.js

const db = require('./../db/connection');
const cron = require('node-cron');

// Main logic to check and update expired contracts
async function checkExpiredContracts() {
    try {
        const updateQuery = `
            UPDATE Contract
            INNER JOIN (
                SELECT DISTINCT AgreementDetails.contract_id
                FROM AgreementDetails
                WHERE AgreementDetails.end_date <= CURDATE()
                AND AgreementDetails.head = 'yes'
            ) expired_contracts ON Contract.id = expired_contracts.contract_id
            SET Contract.status = 'Expired'
            WHERE Contract.is_general = 'no'
            AND Contract.status != 'Expired'
        `;

        await new Promise((resolve, reject) => {
            db.query(updateQuery, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

    } catch (error) {
        console.error('Error during contract expiration check:', error);
    }
}

// Run immediately (for testing)
async function runNow() {
    await checkExpiredContracts();
    process.exit(0);
}

// Set up scheduled cron job
function setupCronJob() {
    cron.schedule('0 0 * * *', async () => {
        await checkExpiredContracts();
    }, {
        scheduled: true,
        timezone: "Europe/Paris"
    });
}

// Graceful shutdown handlers
function setupShutdownHooks() {
    process.on('SIGINT', () => {
        db.end(() => {
            process.exit(0);
        });
    });

    process.on('SIGTERM', () => {
        db.end(() => {
            process.exit(0);
        });
    });
}

// Only auto-run if this file is the entry point
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--now') || args.includes('-n')) {
        runNow();
    } else {
        setupCronJob();
        setupShutdownHooks();
    }
}

// Export for use in app.js
module.exports = {
    checkExpiredContracts,
    setupCronJob,
};
