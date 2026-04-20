import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePrescriptionPDF = ({ clinic, patient, symptoms, diagnosis, medicines, vitals, labReferrals, date }) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(clinic?.name || 'SmartClinic', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(clinic?.address || '', 14, 26);
    doc.text(`Phone: ${clinic?.phone || ''}`, 14, 31);
    doc.text(`Date: ${date || new Date().toLocaleDateString('en-IN')}`, 196, 18, { align: 'right' });
    doc.text(`Doctor: ${clinic?.doctor || 'Dr. Payal Patel'}`, 196, 26, { align: 'right' });

    // Patient Info Box
    doc.setTextColor(30, 41, 59);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 42, 182, 22, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient: ${patient?.name || ''}`, 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${patient?.id || ''}  |  Age: ${patient?.age || ''}  |  Gender: ${patient?.gender || ''}`, 20, 58);

    // Vitals Section
    let y = 72;
    if (vitals && (vitals.bp || vitals.temp || vitals.pulse || vitals.spo2 || vitals.weight)) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('Vitals:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        y += 7;
        const vitalParts = [];
        if (vitals.bp) vitalParts.push(`BP: ${vitals.bp}`);
        if (vitals.temp) vitalParts.push(`Temp: ${vitals.temp}`);
        if (vitals.pulse) vitalParts.push(`Pulse: ${vitals.pulse}`);
        if (vitals.spo2) vitalParts.push(`SpO₂: ${vitals.spo2}`);
        if (vitals.weight) vitalParts.push(`Weight: ${vitals.weight}`);
        doc.text(vitalParts.join('  |  '), 14, y);
        y += 10;
    }

    // Rx Symbol
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('℞', 14, y);

    // Symptoms
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('Chief Complaints:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    y += 7;
    doc.text(symptoms || 'Not specified', 14, y);

    // Diagnosis
    y += 12;
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    y += 7;
    doc.text(diagnosis || 'Not specified', 14, y);

    // Medicines Table
    y += 15;
    if (medicines && medicines.length > 0) {
        doc.autoTable({
            startY: y,
            head: [['#', 'Medicine', 'Dosage', 'Frequency', 'Duration']],
            body: medicines.map((med, i) => [
                i + 1,
                med.name,
                med.dosage || '-',
                med.frequency || '-',
                med.duration || '-'
            ]),
            styles: { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 }
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // Lab Referrals
    if (labReferrals && labReferrals.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('Lab / Radiology Referrals:', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        y += 7;
        labReferrals.forEach((lab, i) => {
            doc.text(`${i + 1}. ${lab}`, 20, y);
            y += 6;
        });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 30, 196, pageHeight - 30);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('This is a computer-generated prescription. No signature required.', 105, pageHeight - 22, { align: 'center' });
    doc.text(`Powered by SmartClinic • ${clinic?.name || ''} • ${clinic?.phone || ''}`, 105, pageHeight - 16, { align: 'center' });

    return doc;
};

export const downloadPrescription = (data) => {
    const doc = generatePrescriptionPDF(data);
    doc.save(`Prescription_${data.patient?.name?.replace(/\s/g, '_') || 'patient'}_${Date.now()}.pdf`);
};

// ─── Referral Slip PDF ───
export const generateReferralSlip = ({ clinic, patient, diagnosis, tests, date }) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(14, 165, 233); // secondary blue
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LAB / RADIOLOGY REFERRAL', 14, 18);
    doc.setFontSize(10);
    doc.text(clinic?.name || 'SmartClinic', 14, 28);
    doc.text(`Date: ${date || new Date().toLocaleDateString('en-IN')}`, 196, 18, { align: 'right' });
    doc.text(`Referring Doctor: ${clinic?.doctor || ''}`, 196, 28, { align: 'right' });

    // Patient Info
    doc.setTextColor(30, 41, 59);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 42, 182, 22, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient: ${patient?.name || ''}`, 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${patient?.id || ''}  |  Age: ${patient?.age || ''}  |  Gender: ${patient?.gender || ''}`, 20, 58);

    // Diagnosis
    let y = 75;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Clinical Diagnosis:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    y += 7;
    doc.text(diagnosis || 'As discussed', 14, y);

    // Tests Table
    y += 15;
    if (tests && tests.length > 0) {
        doc.autoTable({
            startY: y,
            head: [['#', 'Test / Investigation']],
            body: tests.map((t, i) => [i + 1, t]),
            styles: { fontSize: 10, cellPadding: 5 },
            headStyles: { fillColor: [14, 165, 233] },
            alternateRowStyles: { fillColor: [240, 249, 255] },
            margin: { left: 14, right: 14 },
        });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 35, 196, pageHeight - 35);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Please carry this slip when visiting the lab/radiology center.', 105, pageHeight - 27, { align: 'center' });
    doc.text(`${clinic?.name || 'SmartClinic'} • ${clinic?.address || ''} • ${clinic?.phone || ''}`, 105, pageHeight - 20, { align: 'center' });

    return doc;
};

export const downloadReferralSlip = (data) => {
    const doc = generateReferralSlip(data);
    doc.save(`Referral_${data.patient?.name?.replace(/\s/g, '_') || 'patient'}_${Date.now()}.pdf`);
};

export const generateInvoicePDF = ({ clinic, patient, items, invoiceId, date }) => {
    const doc = new jsPDF();

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 14, 18);
    doc.setFontSize(10);
    doc.text(`${clinic?.name || 'SmartClinic'}`, 14, 28);
    doc.text(`#${invoiceId || 'INV-0000'}`, 196, 18, { align: 'right' });
    doc.text(`Date: ${date || new Date().toLocaleDateString('en-IN')}`, 196, 28, { align: 'right' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patient?.name || 'Patient'}`, 14, 55);
    doc.text(`Phone: ${patient?.mobile || ''}`, 14, 62);

    if (items && items.length > 0) {
        const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        doc.autoTable({
            startY: 72,
            head: [['#', 'Description', 'Amount (₹)']],
            body: [
                ...items.map((item, i) => [i + 1, item.description, `₹${item.amount}`]),
                ['', { content: 'TOTAL', styles: { fontStyle: 'bold' } }, { content: `₹${total}`, styles: { fontStyle: 'bold' } }]
            ],
            styles: { fontSize: 10, cellPadding: 5 },
            headStyles: { fillColor: [79, 70, 229] },
            margin: { left: 14, right: 14 }
        });
    }

    return doc;
};
