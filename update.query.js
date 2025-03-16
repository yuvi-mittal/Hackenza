const Query = require('../models/Query');
const ClinicianNotification = require('../models/ClinicianNotification');
const PatientNotification = require('../models/PatientNotification');
const io = require('../server'); // Import WebSocket instance

async function updateQueryStatus(queryId, newStatus) {
    const query = await Query.findById(queryId);
    if (!query) throw new Error("Query not found");

    query.status = newStatus;
    await query.save();

    if (newStatus === "AI_RESPONSE_GENERATED") {
        // Notify Clinician
        const clinicianNotification = new ClinicianNotification({
            clinicianId: query.clinicianId,
            queryId,
            message: "A new AI response is awaiting your verification."
        });
        await clinicianNotification.save();

        io.to(`clinician-${query.clinicianId}`).emit('notification', {
            queryId,
            message: clinicianNotification.message
        });

    } else if (newStatus === "VERIFIED") {
        // Notify Patient
        const patientNotification = new PatientNotification({
            patientId: query.patientId,
            queryId,
            message: "Your query has been reviewed by the clinician. Check the response."
        });
        await patientNotification.save();

        io.to(`patient-${query.patientId}`).emit('notification', {
            queryId,
            message: patientNotification.message
        });
    }
}
