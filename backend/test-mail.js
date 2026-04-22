const nodemailer = require('nodemailer');
require('dotenv').config();

async function test() {
  console.log('📧 Test envoi email via Gmail...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_USER, // Envoi à vous-même
      subject: '✅ Test Gmail - Plateforme Formation',
      html: '<h1>Félicitations !</h1><p>Votre configuration Gmail fonctionne parfaitement.</p><p>Email envoyé depuis Node.js avec mot de passe d\'application.</p>'
    });
    
    console.log('✅ Email envoyé avec succès !');
    console.log('📬 Vérifiez votre boîte mail (et le dossier SPAM)');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

test();