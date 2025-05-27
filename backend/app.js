const express = require('express');
const cors = require('cors');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');

const db = require('./db/connection');

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:5173', // your Vue app's origin
    credentials: true
}));

app.use(session({
    secret: 'your_secret',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({}, db),
    cookie: {
        httpOnly: true,
        secure: false, // true if using HTTPS
        maxAge: 3600000
    }
}));
app.use('/uploads', express.static('uploads'));

// Import the contract expiration check module
const contractExpiryChecker = require('./cronjobs/contract_expiry_check');
const avenantActivationChecker = require('./cronjobs/avenant_activation_check');

// Start the daily cron job when the server starts
contractExpiryChecker.setupCronJob();
avenantActivationChecker.setupCronJob();

// Routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const roleRoutes = require('./routes/role.route');
const patientRoutes = require('./routes/patient.route');
const medicalRecordsRoutes = require('./routes/medical_records.route');
const companyRoutes = require("./routes/company.route");
const contractRoutes = require("./routes/contract.route")
const specialtyRoutes = require('./routes/specialty.route');
const medicalRecordPrestationRoutes = require('./routes/medical_record-prestation.route');
const prestationRoutes = require('./routes/prestation.route');
const doctorRoutes = require('./routes/doctor.route');
const paiementRoutes = require('./routes/paiement.routes');
const waitingRoomRoutes = require('./routes/waiting_room.route');
const modalityRoutes = require('./routes/modality.route');

// cashier routes
const cashierFicheRoutes = require('./routes/Cashier/fiche.routes');
const cashierPrestationRoutes = require('./routes/cashier/prestation.routes');
const cashierPaiementRoutes = require('./routes/cashier/paiement.routes');


//Convenction routes
// Routes
const convenctionCompanyRoutes = require('./routes/convention_routs/company.route'); 
app.use('/api/convention/companies', convenctionCompanyRoutes); 


const convenctionContractRoutes = require('./routes/convention_routs/contract.route');
app.use('/api/convention/contracts', convenctionContractRoutes);

const convenctionAgreementRoutes = require('./routes/convention_routs/agreement.route');
app.use('/api/convention/agreements', convenctionAgreementRoutes);

const convenctionAgreementDetailsRoutes = require('./routes/convention_routs/agreementdetails.route');
app.use('/api/convention/agreementdetails', convenctionAgreementDetailsRoutes);

const convenctionContactRoutes = require('./routes/convention_routs/contact.route');
app.use('/api/convention/contacts', convenctionContactRoutes);

const convenctionAnnexRoutes = require('./routes/convention_routs/annex.route');
app.use('/api/convention/annexes', convenctionAnnexRoutes);

const convenctionSpecialtyRoutes = require('./routes/convention_routs/specialty.route');
app.use('/api/convention/specialties', convenctionSpecialtyRoutes);

const convenctionPriceRoutes = require('./routes/convention_routs/prestationprice.route');
app.use('/api/convention/prestationprices', convenctionPriceRoutes);

const convenctionPrestationListRoutes = require('./routes/convention_routs/prestationlist.router');
app.use('/api/convention/prestationlists', convenctionPrestationListRoutes);

const convenctionAvenantRoutes = require('./routes/convention_routs/avenant.route'); 
app.use('/api/convention/avenants', convenctionAvenantRoutes); 

const convenctionDashboardRoutes = require('./routes/convention_routs/dashboard.route');
app.use('/api/convention/dashboard', convenctionDashboardRoutes);




const testRoutes = require('./routes/test.route');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use("/api/companies", companyRoutes)
app.use("/api/contracts", contractRoutes)
app.use('/api/specialties', specialtyRoutes);
app.use('/api/medical-record-prestations', medicalRecordPrestationRoutes);
app.use('/api/prestations', prestationRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/waiting-rooms', waitingRoomRoutes);
app.use('/api/modalities', modalityRoutes);

// Cashier routes
app.use('/api/cashier/fiches', cashierFicheRoutes)
app.use('/api/cashier/prestations', cashierPrestationRoutes)
app.use('/api/cashier/paiements', cashierPaiementRoutes)

app.use('/api', testRoutes);


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));