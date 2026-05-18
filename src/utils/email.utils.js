import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_development');

export const sendVerificationEmail = async (email, name, code) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Zyro <hola@zyro-app.com>',
            to: [email],
            subject: 'Tu código de seguridad de Zyro',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; text-align: center;">
                    <h1 style="color: #4f46e5; font-size: 28px; font-weight: 900; margin-bottom: 24px;">Verifica tu cuenta</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">Hola ${name}, usa el siguiente código de seguridad para activar tu cuenta en Zyro:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 24px; border-radius: 16px; margin-bottom: 32px;">
                        <span style="font-family: monospace; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #111827;">${code}</span>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 32px;">Este código caducará pronto. Si no has solicitado este código, puedes ignorar este mensaje con seguridad.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                    <p style="color: #9ca3af; font-size: 12px;">© 2026 Zyro. Todos los derechos reservados.</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error de Resend SDK:', error);
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error('Error inesperado enviando email:', err);
        throw err;
    }
};
