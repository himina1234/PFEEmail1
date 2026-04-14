import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Smartphone, MapPin, CheckCircle, Menu, X, LogIn, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatbotIntelligent from '../components/ChatbotIntelligent';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Effet de scroll pour la navigation
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- NAVIGATION MODERNE --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
   <div className="flex items-center gap-3 group cursor-pointer">
  <img 
    src="../image/imag4.jpg"  // Chemin vers votre logo
    alt="Algérie Poste Logo" 
    className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300"  // Changé de h-12 à h-16
  />
  <div className="flex flex-col">
    <span className="font-black text-2xl tracking-tighter text-blue-950 leading-none">ALGÉRIE POSTE</span>  {/* Changé de text-xl à text-2xl */}
   <span className="text-xs uppercase tracking-[0.2em] font-bold text-yellow-400">
  Learning
</span>
  </div>
</div>
          
          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-8 text-sm font-semibold text-slate-600">
              <a href="#" className="hover:text-blue-700 transition-colors">Accueil</a>
              <a href="#programmes" className="hover:text-blue-700 transition-colors">Programmes</a>
              <a href="#stats" className="hover:text-blue-700 transition-colors">Impact</a>
            </div>
            <button 
              onClick={handleLogin}
              className="bg-slate-950 text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95"
            >
              <LogIn size={16} /> Espace Apprenti
            </button>
          </div>

          <button className="md:hidden p-2 text-blue-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-yellow-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">Inscriptions Ouvertes 2026</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-[1.1]">
                Façonnez l'avenir <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500">postal de l'Algérie</span>
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Une plateforme d'apprentissage nouvelle génération pour maîtriser les métiers de la logistique, de la monétique et de la relation client.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-2xl shadow-blue-200 flex items-center gap-3 group">
                  Démarrer ma carrière <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white border-2 border-slate-100 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                  Voir le catalogue
                </button>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500">
                  <span className="text-slate-900 font-bold">+15,000</span> apprentis déjà formés
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] border-8 border-white">
                <img 
                  src="../image/imag3.jpg" 
                  alt="Éducation" 
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden sm:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-400 p-3 rounded-xl">
                    <Star className="text-white fill-white" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Taux de réussite</p>
                    <p className="text-2xl font-black text-slate-900">98.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- STATS SECTION --- */}
      <section id="stats" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Wilayas', val: '58' },
              { label: 'Formateurs', val: '120+' },
              { label: 'Diplômés', val: '15k' },
              { label: 'Insertion', val: '92%' }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-5xl font-black text-blue-700 mb-2 group-hover:scale-110 transition-transform">{stat.val}</p>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROGRAMMES --- */}
      <section id="programmes" className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-slate-950 mb-4 italic">Nos pôles d'excellence</h2>
            <p className="text-slate-500 text-lg">Des cursus conçus avec des experts métiers pour une employabilité immédiate.</p>
          </div>
          <a href="#" className="text-blue-700 font-bold flex items-center gap-2 group">
            Tout découvrir <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: <BookOpen className="text-blue-600" size={28} />, 
              title: "Services Postaux", 
              color: "bg-blue-50",
              desc: "Logistique moderne, gestion des flux et excellence opérationnelle du courrier." 
            },
            { 
              icon: <Smartphone className="text-purple-600" size={28} />, 
              title: "Monétique & IT", 
              color: "bg-purple-50",
              desc: "Maintenance système, gestion BaridiMob et sécurité des transactions numériques." 
            },
            { 
              icon: <Users className="text-emerald-600" size={28} />, 
              title: "Banque Postale", 
              color: "bg-emerald-50",
              desc: "Gestion de l'épargne, services CCP et conseil financier de proximité." 
            }
          ].map((feature, idx) => (
            <div key={idx} className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500">
              <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-8">{feature.desc}</p>
              <div className="h-1 w-12 bg-slate-100 group-hover:w-full group-hover:bg-blue-600 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto bg-slate-950 rounded-[3rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-700/10 skew-x-12 translate-x-20"></div>
          <div className="relative z-10 px-8 py-20 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
              Prêt à écrire votre <span className="text-blue-500">propre histoire</span> à Algérie Poste ?
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={handleLogin}
                className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all flex items-center gap-3"
              >
                Accéder à mon espace <LogIn size={20} />
              </button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-10 text-slate-500 font-medium">
              <span className="flex items-center gap-2"><MapPin size={16} /> Siège Social, Alger</span>
              <span className="flex items-center gap-2 text-blue-400 italic">formation@poste.dz</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center">
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          © 2026 Algérie Poste • <span className="text-slate-900">Direction de la Transformation Digitale</span>
        </p>
      </footer>

      <ChatbotIntelligent userId={null} userRole={null} />

      {/* Style CSS personnalisé pour l'animation de flottement */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default LandingPage;