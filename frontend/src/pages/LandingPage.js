import React, { useState } from 'react';
import { BookOpen, Users, Smartphone, MapPin, CheckCircle, Menu, X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatbotIntelligent from '../components/ChatbotIntelligent';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- NAVIGATION --- */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-700 p-2 rounded-lg">
                <span className="text-yellow-400 font-black text-xl italic">AP</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-blue-900 uppercase">
                Algérie Poste <span className="text-blue-600 font-light text-sm block">Apprentissage</span>
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#" className="hover:text-blue-700 transition">Accueil</a>
              <a href="#programmes" className="hover:text-blue-700 transition">Programmes</a>
              <a href="#stats" className="hover:text-blue-700 transition">Impact</a>
              
              {/* Bouton Connexion */}
              <button 
                onClick={handleLogin}
                className="bg-blue-700 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-800 transition shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <LogIn size={18} />
                Espace Apprenti
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t py-4 px-4">
            <div className="flex flex-col space-y-4">
              <a href="#" className="hover:text-blue-700 transition py-2">Accueil</a>
              <a href="#programmes" className="hover:text-blue-700 transition py-2">Programmes</a>
              <a href="#stats" className="hover:text-blue-700 transition py-2">Impact</a>
              <button 
                onClick={handleLogin}
                className="bg-blue-700 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-800 transition flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Espace Apprenti
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative bg-blue-700 py-20 lg:py-32 overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-yellow-400 rounded-full opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold uppercase mb-6 inline-block">
                Inscriptions Ouvertes 2026
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                Devenez l'acteur de la <span className="text-yellow-400">Poste de demain</span>
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-lg">
                Rejoignez nos centres de formation et développez vos compétences dans les métiers postaux, financiers et numériques à travers les 58 wilayas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2">
                  Postuler maintenant <CheckCircle size={20} />
                </button>
                <button className="border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition">
                  Consulter le guide
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800" 
                  alt="Apprentis au travail" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- STATS SECTION --- */}
      <section id="stats" className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-black text-blue-700">58</p>
            <p className="text-slate-500 font-medium uppercase text-sm">Wilayas</p>
          </div>
          <div>
            <p className="text-4xl font-black text-blue-700">120+</p>
            <p className="text-slate-500 font-medium uppercase text-sm">Formateurs</p>
          </div>
          <div>
            <p className="text-4xl font-black text-blue-700">15k</p>
            <p className="text-slate-500 font-medium uppercase text-sm">Diplômés</p>
          </div>
          <div>
            <p className="text-4xl font-black text-blue-700">92%</p>
            <p className="text-slate-500 font-medium uppercase text-sm">Insertion</p>
          </div>
        </div>
      </section>

      {/* --- PROGRAMMES --- */}
      <section id="programmes" className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Nos Domaines d'Expertise</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Une formation pratique alliée à une expérience terrain unique au sein du premier réseau de proximité en Algérie.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: <BookOpen className="text-blue-700" size={32} />, 
              title: "Services Postaux", 
              desc: "Gestion des flux de courriers, logistique et accueil client." 
            },
            { 
              icon: <Smartphone className="text-blue-700" size={32} />, 
              title: "Monétique & IT", 
              desc: "Maintenance des automates et support des services numériques (BaridiMob)." 
            },
            { 
              icon: <Users className="text-blue-700" size={32} />, 
              title: "Gestion Financière", 
              desc: "Apprentissage des opérations CCP et de l'épargne postale." 
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-600 mb-6">{feature.desc}</p>
              <a href="#" className="text-blue-700 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                En savoir plus ➔
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION AVEC BOUTON CONNEXION --- */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Prêt à lancer votre carrière ?</h2>
          <p className="text-blue-100 mb-10 text-lg">
            Inscrivez-vous sur notre portail pour être informé des prochains concours de recrutement et d'apprentissage.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={handleLogin}
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Accéder à mon espace
            </button>
            <button className="border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition">
              En savoir plus
            </button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 pt-8 border-t border-blue-600">
            <div className="flex items-center gap-2 text-blue-100">
              <MapPin size={18} className="text-yellow-400" /> Alger, Bir Mourad Raïs
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <span className="text-yellow-400">@</span> formation@poste.dz
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-6 text-center text-slate-600 text-sm border-t border-slate-800">
        <p>© 2026 Algérie Poste. Direction de la Formation et de la Communication.</p>
      </footer>

      {/* --- CHATBOT INTELLIGENT --- */}
      {/* Le chatbot apparaît en bas à droite sur toutes les pages */}
      <ChatbotIntelligent userId={null} userRole={null} />
    </div>
  );
};

export default LandingPage;