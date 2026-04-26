const nodemailer = require("nodemailer");

// ===== CHOISIS TA CONFIG (décommente celle que tu veux tester) =====

// OPTION 1 : GMAIL (Envoi réel)
const config = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "mounaxnadjat@gmail.com",
    pass: "lqpegtotpfihlzjd", // ← ton mot de passe actuel
  },
};

// OPTION 2 : MAILTRAP (Test - pas d'envoi réel)
// const config = {
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   secure: false,
//   auth: {
//     user: "7710e7b2cb4e3e",
//     pass: "05b296b70fdc20"
//   }
// };

// ==========================================

console.log("🔌 Test de connexion avec:", config.host);

const transporter = nodemailer.createTransport(config);

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ ÉCHEC CONNEXION SMTP:");
    console.log("   Message:", error.message);
    console.log("   Code:", error.code);
    return;
  }

  console.log("✅ CONNEXION SMTP OK");
  console.log("📧 Envoi d'un email test...");

  transporter.sendMail(
    {
      from: '"Test Plateforme" <test@plateforme.com>',
      to: "aissanifatiha24@gmail.com", // ← change par ton email pour tester
      subject: "Test technique - Diagnostic",
      text: "Si tu reçois cet email, la config SMTP fonctionne !",
      html: "<b>Si tu reçois cet email, la config SMTP fonctionne !</b>",
    },
    (err, info) => {
      if (err) {
        console.log("❌ ÉCHEC ENVOI:");
        console.log("   Message:", err.message);
        console.log("   Code:", err.code);
      } else {
        console.log("✅ ENVOI RÉUSSI !");
        console.log("   Message ID:", info.messageId);
        console.log("   Réponse:", info.response);

        if (config.host.includes("mailtrap")) {
          console.log(
            "\n📌 IMPORTANT: Avec Mailtrap, l'email n'est PAS envoyé vraiment.",
          );
          console.log(
            "   Va voir sur https://mailtrap.io pour voir l'email capturé.",
          );
        } else {
          console.log(
            "\n📌 Vérifie la boîte de réception (et les spams) de aissanifatiha24@gmail.com",
          );
        }
      }
    },
  );
});
