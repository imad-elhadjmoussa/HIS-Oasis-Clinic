const dashboardModel = require('../../models/convention_models/dashboard.model');

// Get all dashboard data
const getDashboardData = async (req, res) => {
    try {
        // Get all dashboard metrics in parallel for better performance
        const [
            contractStats,
            recentContracts,
            topCompanies,
            specialtyStats,
            monthlyContractData,
            totalCompanies
        ] = await Promise.all([
            dashboardModel.getContractStats(),
            dashboardModel.getRecentContracts(),
            dashboardModel.getTopCompanies(),
            dashboardModel.getSpecialtyStats(),
            dashboardModel.getMonthlyContractData(),
            dashboardModel.getTotalCompanies()
        ]);

        // Structure the response data
        const dashboardData = {
            totalCompanies: totalCompanies.total,
            activeContracts: contractStats.active || 0,
            pendingContracts: contractStats.pending || 0,
            expiredContracts: contractStats.expired || 0,
            recentContracts,
            topCompanies,
            specialtyStats,
            monthlyContractData
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get contract statistics
const getContractStats = async (req, res) => {
    try {
        const stats = await dashboardModel.getContractStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching contract stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get recent contracts
const getRecentContracts = async (req, res) => {
    const { limit = 10 } = req.query;
    try {
        const contracts = await dashboardModel.getRecentContracts(parseInt(limit));
        res.json(contracts);
    } catch (error) {
        console.error('Error fetching recent contracts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get top companies by contract count
const getTopCompanies = async (req, res) => {
    const { limit = 10 } = req.query;
    try {
        const companies = await dashboardModel.getTopCompanies(parseInt(limit));
        res.json(companies);
    } catch (error) {
        console.error('Error fetching top companies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get specialty statistics
const getSpecialtyStats = async (req, res) => {
    try {
        const stats = await dashboardModel.getSpecialtyStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching specialty stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get monthly contract creation data
const getMonthlyContractData = async (req, res) => {
    const { months = 12 } = req.query;
    try {
        const data = await dashboardModel.getMonthlyContractData(parseInt(months));
        res.json(data);
    } catch (error) {
        console.error('Error fetching monthly contract data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get contracts expiring soon
const getExpiringContracts = async (req, res) => {
    const { days = 30 } = req.query;
    try {
        const contracts = await dashboardModel.getExpiringContracts(parseInt(days));
        res.json(contracts);
    } catch (error) {
        console.error('Error fetching expiring contracts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get active avenants count
const getActiveAvenantsCount = async (req, res) => {
    try {
        const count = await dashboardModel.getActiveAvenantsCount();
        res.json(count);
    } catch (error) {
        console.error('Error fetching active avenants count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get prestation price analytics
const getPrestationPriceAnalytics = async (req, res) => {
    try {
        const analytics = await dashboardModel.getPrestationPriceAnalytics();
        res.json(analytics);
    } catch (error) {
        console.error('Error fetching prestation price analytics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getDashboardData,
    getContractStats,
    getRecentContracts,
    getTopCompanies,
    getSpecialtyStats,
    getMonthlyContractData,
    getExpiringContracts,
    getActiveAvenantsCount,
    getPrestationPriceAnalytics
};