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

export const sendContactFormEmail = async (name, email, subject, message) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Zyro Contacto <contacto@zyro-app.com>',
            to: ['ikcolu@jviladoms.cat'],
            subject: `Contacto Zyro: ${subject}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px;">
                    <h1 style="color: #4f46e5; font-size: 24px; font-weight: 900; margin-bottom: 24px; text-align: center;">Nuevo mensaje de contacto</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 20px;">Has recibido un nuevo mensaje a través del formulario de contacto de Zyro:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 24px; border-radius: 16px; margin-bottom: 24px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #4b5563;"><strong>Nombre:</strong> ${name}</p>
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #4b5563;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #4b5563;"><strong>Asunto:</strong> ${subject}</p>
                        <p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Mensaje:</strong></p>
                        <p style="margin: 8px 0 0 0; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; font-style: italic; color: #111827; line-height: 20px;">
                            ${message.replace(/\n/g, '<br />')}
                        </p>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 Zyro. Todos los derechos reservados.</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error de Resend SDK (Contacto):', error);
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error('Error inesperado enviando email de contacto:', err);
        throw err;
    }
};

export const sendPasswordResetEmail = async (email, name, resetLink) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Zyro <hola@zyro-app.com>',
            to: [email],
            subject: 'Recuperación de contraseña en Zyro',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; text-align: center;">
                    <h1 style="color: #4f46e5; font-size: 28px; font-weight: 900; margin-bottom: 24px;">Recupera tu contraseña</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">Hola ${name}, has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>
                    
                    <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin-bottom: 32px;">Cambiar contraseña</a>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">Este enlace es válido por 15 minutos. Si no has solicitado esto, ignora este correo.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                    <p style="color: #9ca3af; font-size: 12px;">© 2026 Zyro. Todos los derechos reservados.</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error de Resend SDK (Reset Password):', error);
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error('Error inesperado enviando email de recuperación:', err);
        throw err;
    }
};
