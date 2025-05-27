const doctorModel = require('../models/doctor.model');

const getDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.getDoctors();
        res.status(200).json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getDoctorById = async (req, res) => {
    try {
        const doctor = await doctorModel.getDoctorById(req.params.id);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        res.status(200).json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const createDoctor = async (req, res) => {
    try {
        const newDoctor = await doctorModel.createDoctor(req.body);
        res.status(201).json({ doctor: newDoctor, message: "Doctor created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const updateDoctor = async (req, res) => {
    try {
        const updatedDoctor = await doctorModel.updateDoctor(req.params.id, req.body);
        if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found" });
        res.status(200).json({ doctor: updatedDoctor, message: "Doctor updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const success = await doctorModel.deleteDoctor(req.params.id);
        if (!success) return res.status(404).json({ message: "Doctor not found" });
        res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

module.exports = {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
};
