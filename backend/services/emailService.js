// backend/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configuration par défaut (sera remplacée dynamiquement)
    this.defaultTransporter = null;
  }

  // Créer un transporteur pour un email spécifique
  createTransporter(email, password) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
    });
  }

  // Envoyer un email avec un expéditeur spécifique
  async sendEmail(fromEmail, fromPassword, to, subject, html) {
    try {
      const transporter = this.createTransporter(fromEmail, fromPassword);
      
      const mailOptions = {
        from: `"Plateforme Formation" <${fromEmail}>`,
        to,
        subject,
        html,
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email envoyé de ${fromEmail} à ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeValidationEmail(fromEmail, fromPassword, user, temporaryPassword) {
    const validationLink = `http://localhost:5000/api/auth/validate-account?email=${encodeURIComponent(user.email)}&token=${user.validationToken}`;
    
    const subject = '🎉 Bienvenue - Validez votre compte';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .password-box { background: #f0f0f0; font-family: monospace; font-size: 20px; padding: 12px; text-align: center; border-radius: 6px; margin: 15px 0; font-weight: bold; }
          .validation-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Bienvenue ${user.prenom} ${user.nom} !</h2>
          </div>
          <div class="content">
            <p>Un compte a été créé pour vous sur la plateforme de formation.</p>
            <div class="credentials">
              <p><strong>📧 Email :</strong> ${user.email}</p>
              <p><strong>🆔 Matricule :</strong> ${user.matricule}</p>
              <p><strong>👤 Rôle :</strong> ${user.role === 'admin' ? 'Administrateur' : user.role === 'formateur' ? 'Formateur' : 'Apprenant'}</p>
              <p><strong>🔑 Mot de passe temporaire :</strong></p>
              <div class="password-box">${temporaryPassword}</div>
            </div>
            <div class="warning">
              <strong>⚠️ IMPORTANT :</strong> Pour activer votre compte, vous devez valider votre inscription.
            </div>
            <div style="text-align: center;">
              <a href="${validationLink}" class="validation-btn">✅ Valider mon inscription</a>
            </div>
            <p>Pour toute question, contactez l'administrateur.</p>
          </div>
          <div class="footer">
            <p>© 2024 Plateforme de Formation</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return await this.sendEmail(fromEmail, fromPassword, user.email, subject, html);
  }
}

module.exports = new EmailService();