// Lightweight WhatsApp alert service.
// This file only defines the contract from the frontend to your backend / provider.
// Implement the actual WhatsApp sending logic on the server-side that receives this payload.

const WHATSAPP_QUEUE_ENDPOINT = '/api/whatsapp/queue-alert';

export const canSendWhatsApp = (mobile) => {
    if (!mobile) return false;
    const digits = mobile.replace(/\D/g, '');
    // Basic sanity check – tweak for your clinic’s rules
    return digits.length >= 10;
};

/**
 * Send a queue-related WhatsApp alert.
 *
 * Example payload your backend can expect:
 * {
 *   mobile: "+919876543210",
 *   token: "T-008",
 *   status: "Waiting" | "Consulting" | "Completed",
 *   clinicName: "SmartClinic",
 *   position: 3, // people ahead in the queue
 * }
 */
export async function sendQueueWhatsAppAlert(payload) {
    const { mobile } = payload || {};
    if (!canSendWhatsApp(mobile)) {
        return { ok: false, reason: 'invalid_mobile' };
    }

    try {
        // Call your backend / serverless function that integrates
        // with Meta WhatsApp Cloud API / Twilio / other provider.
        const res = await fetch(WHATSAPP_QUEUE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error('WhatsApp alert failed', res.status, await res.text().catch(() => ''));
            return { ok: false, reason: 'http_error', status: res.status };
        }

        return { ok: true };
    } catch (err) {
        console.error('WhatsApp alert error', err);
        return { ok: false, reason: 'network_error' };
    }
}

