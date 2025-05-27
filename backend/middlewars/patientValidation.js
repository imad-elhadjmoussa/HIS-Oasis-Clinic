// utils/patientValidator.js
const { body, validationResult } = require('express-validator');
const moment = require('moment');

// Middleware to handle validation results
const handleFirstValidationError = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Get just the first error
        const firstError = errors.array()[0];

        return res.status(400).json({
            success: false,
            message: firstError.msg, // Just the message of the first error
            field: firstError.param  // Optional: include the field name
        });
    }
    next();
};
const validatePatient = [
    // National ID validation (18 digits)
    body('national_id_number')
        .notEmpty().withMessage('National ID is required')
        .isLength({ min: 18, max: 18 }).withMessage('National ID must be exactly 18 digits')
        .isNumeric().withMessage('National ID must contain only numbers'),

    // First name validation
    body('first_name')
        .notEmpty().withMessage('First name is required')
        .matches(/^[a-zA-Z\u00C0-\u017F\s]+$/).withMessage('First name can only contain letters and spaces'),

    // Last name validation
    body('last_name')
        .notEmpty().withMessage('Last name is required')
        .matches(/^[a-zA-Z\u00C0-\u017F\s]+$/).withMessage('Last name can only contain letters and spaces'),

    // Date of birth validation
    body('date_of_birth')
        .notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
            const dob = moment(value);
            const today = moment();
            const minDate = moment().subtract(120, 'years');
            const maxDate = moment().subtract(1, 'year');

            if (dob.isAfter(today)) {
                throw new Error('Date of birth cannot be in the future');
            }
            if (dob.isBefore(minDate)) {
                throw new Error('Patient age cannot exceed 120 years');
            }
            if (dob.isAfter(maxDate)) {
                throw new Error('Patient must be at least 1 year old');
            }
            return true;
        }),

    // Phone validation (Algerian format)
    body('phone_number')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^(0)(5|6|7)[0-9]{8}$/).withMessage('Please enter a valid Algerian phone number (e.g., 05XX XXX XXX)'),

    // Email validation
    body('email')
        .optional()
        .isEmail().withMessage('Please enter a valid email address'),

    // Gender validation
    body('gender')
        .optional()
        .isIn(['male', 'female']).withMessage('Invalid gender value'),

    // Blood type validation
    body('blood_type')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),


    handleFirstValidationError

];




module.exports = { validatePatient };