import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'mt' | 'fr' | 'es' | 'it' | 'de' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.browse': 'Browse',
    'nav.messages': 'Messages',
    'nav.favorites': 'Favorites',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.listRoom': 'List Room',
    'nav.myListings': 'My Listings',
    'nav.appointments': 'Appointments',
    'nav.myProfile': 'My Profile',
    'nav.signOut': 'Sign Out',
    'nav.adminPanel': 'Admin Panel',
    'nav.listARoom': 'List a Room',
    'nav.signIn': 'Sign In',
    'nav.getStarted': 'Get Started',
    
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.filters': 'Filters',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.loading': 'Loading...',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    
    // Home
    'home.hero.title': 'Find Your Perfect Room & Flatmate in Malta',
    'home.hero.subtitle': 'AI-powered matching for seamless shared living',
    'home.hero.cta': 'Start Your Search',
    'home.hero.badge': 'AI-Powered Compatibility Matching',
    'home.hero.searchPlaceholder': 'Enter location or neighborhood...',
    'home.hero.stats.listings': 'Active Listings',
    'home.hero.stats.success': 'Match Success',
    'home.hero.stats.roommates': 'Happy Roommates',
    'home.howItWorks.title': 'How It Works',
    'home.howItWorks.subtitle': 'Finding compatible roommates has never been easier',
    'home.howItWorks.step1.title': 'Browse Rooms',
    'home.howItWorks.step1.desc': 'Search verified listings with detailed flatmate profiles',
    'home.howItWorks.step2.title': 'AI Matching',
    'home.howItWorks.step2.desc': 'AI analyzes lifestyle and preferences to find your best matches',
    'home.howItWorks.step3.title': 'Connect & Move In',
    'home.howItWorks.step3.desc': 'Message roommates, schedule viewings, and find your home',
    'home.featured.title': 'Featured Rooms',
    'home.featured.subtitle': 'Highly compatible matches based on your preferences',
    'home.featured.viewAll': 'View All Listings',
    'home.featured.loading': 'Loading rooms...',
    'home.featured.noRooms': 'No rooms available at the moment',
    'home.cta.title': 'Ready to Find Your Perfect Match?',
    'home.cta.subtitle': 'Join thousands of people finding compatible roommates every day',
    'home.cta.listRoom': 'List Your Room',
    'home.cta.findRoom': 'Find a Room',
    'home.trust.title': 'Safe & Secure Platform',
    'home.trust.subtitle': 'Your safety is our top priority',
    'home.trust.payments': 'Secure Payments',
    'home.trust.paymentsDesc': 'Encrypted via Stripe',
    'home.trust.support': '24/7 Support',
    'home.trust.supportDesc': 'Always here to help',
    'home.trust.reviews': 'Verified Reviews',
    'home.trust.reviewsDesc': 'Real user reviews',
    
    // Browse
    'browse.title': 'Find Your Perfect Room',
    'browse.filters': 'Filters',
    'browse.results': 'results',
    'browse.noResults': 'No listings found',
    
    // Room Details
    'room.price': 'Price',
    'room.available': 'Available',
    'room.type': 'Room Type',
    'room.size': 'Size',
    'room.amenities': 'Amenities',
    'room.description': 'Description',
    'room.contact': 'Contact Owner',
    'room.save': 'Save',
    'room.share': 'Share',
    
    // Footer
    'footer.about': 'About QuickRoom8',
    'footer.contact': 'Contact Us',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.browse': 'Browse',
    'footer.listRoom': 'List Room',
    'footer.safety': 'Safety',
    'footer.copyright': '© 2025 QuickRoom8',
  },
  mt: {
    // Navigation
    'nav.home': 'Dar',
    'nav.browse': 'Fittex',
    'nav.messages': 'Messaġġi',
    'nav.favorites': 'Favoriti',
    'nav.profile': 'Profil',
    'nav.admin': 'Admin',
    'nav.listRoom': 'Elenkazzjoni',
    'nav.myListings': 'L-Elenki Tiegħi',
    'nav.appointments': 'Appuntamenti',
    'nav.myProfile': 'Il-Profil Tiegħi',
    'nav.signOut': 'Oħroġ',
    'nav.adminPanel': 'Pannell tal-Amministratur',
    'nav.listARoom': 'Elenkazzjoni ta\' Kamra',
    'nav.signIn': 'Idħol',
    'nav.getStarted': 'Ibda',
    
    // Common
    'common.search': 'Fittex',
    'common.filter': 'Filtru',
    'common.filters': 'Filtri',
    'common.save': 'Ħażna',
    'common.cancel': 'Ikkanċella',
    'common.delete': 'Ħassar',
    'common.edit': 'Editja',
    'common.view': 'Ara',
    'common.close': 'Agħlaq',
    'common.submit': 'Ibgħat',
    'common.loading': 'Qed jitgħabba...',
    
    // Auth
    'auth.login': 'Idħol',
    'auth.signup': 'Irreġistra',
    'auth.logout': 'Oħroġ',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Insejt il-Password?',
    
    // Home
    'home.hero.title': 'Sib il-Kamra u l-Flatmate Perfetti Tiegħek f\'Malta',
    'home.hero.subtitle': 'Matching imħaddem bl-AI għal ħajja kondiviża',
    'home.hero.cta': 'Ibda t-Tfittxija Tiegħek',
    'home.hero.badge': 'Matching tal-Kompatibilità bl-AI',
    'home.hero.searchPlaceholder': 'Daħħal il-post jew il-viċinat...',
    'home.hero.stats.listings': 'Elenki Attivi',
    'home.hero.stats.success': 'Suċċess tal-Matching',
    'home.hero.stats.roommates': 'Roommates Kuntenti',
    'home.howItWorks.title': 'Kif Jaħdem',
    'home.howItWorks.subtitle': 'Li ssib roommates kompatibbli qatt ma kien aktar faċli',
    'home.howItWorks.step1.title': 'Fittex Kmamar',
    'home.howItWorks.step1.desc': 'Fittex elenki verifikati b\'profili dettaljati tal-flatmates',
    'home.howItWorks.step2.title': 'Matching bl-AI',
    'home.howItWorks.step2.desc': 'L-AI tanalizza l-istil ta\' ħajja u l-preferenzi biex issib l-aħjar matches',
    'home.howItWorks.step3.title': 'Ikkonnettja u Imxi',
    'home.howItWorks.step3.desc': 'Messaġġja roommates, skedula viewings, u sib id-dar tiegħek',
    'home.featured.title': 'Kmamar Iffitturjati',
    'home.featured.subtitle': 'Matches kompatibbli ħafna bbażati fuq il-preferenzi tiegħek',
    'home.featured.viewAll': 'Ara l-Elenki Kollha',
    'home.featured.loading': 'Qed jitgħabbew il-kmamar...',
    'home.featured.noRooms': 'Ebda kamra disponibbli fil-mument',
    'home.cta.title': 'Lest biex Issib il-Match Perfett Tiegħek?',
    'home.cta.subtitle': 'Ingħaqad ma\' eluf ta\' nies li qed isibu roommates kompatibbli kuljum',
    'home.cta.listRoom': 'Elenkazzjoni tal-Kamra Tiegħek',
    'home.cta.findRoom': 'Sib Kamra',
    'home.trust.title': 'Pjattaforma Sigura u Protetta',
    'home.trust.subtitle': 'Is-sigurtà tiegħek hija l-prijorità tagħna',
    'home.trust.payments': 'Ħlasijiet Siguri',
    'home.trust.paymentsDesc': 'Encrypted permezz ta\' Stripe',
    'home.trust.support': 'Appoġġ 24/7',
    'home.trust.supportDesc': 'Dejjem hawn biex ngħinuk',
    'home.trust.reviews': 'Reviews Verifikati',
    'home.trust.reviewsDesc': 'Reviews reali mill-utenti',
    
    // Browse
    'browse.title': 'Sib il-Kamra Perfetta Tiegħek',
    'browse.filters': 'Filtri',
    'browse.results': 'riżultati',
    'browse.noResults': 'Ebda elenkazzjoni ma nstabet',
    
    // Room Details
    'room.price': 'Prezz',
    'room.available': 'Disponibbli',
    'room.type': 'Tip ta\' Kamra',
    'room.size': 'Daqs',
    'room.amenities': 'Faċilitajiet',
    'room.description': 'Deskrizzjoni',
    'room.contact': 'Ikkuntattja lis-Sid',
    'room.save': 'Ħażna',
    'room.share': 'Aqsam',
    
    // Footer
    'footer.about': 'Dwar QuickRoom8',
    'footer.contact': 'Ikkuntattjana',
    'footer.terms': 'Termini tas-Servizz',
    'footer.privacy': 'Politika tal-Privatezza',
    'footer.browse': 'Fittex',
    'footer.listRoom': 'Elenkazzjoni',
    'footer.safety': 'Sigurtà',
    'footer.copyright': '© 2025 QuickRoom8',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.browse': 'Parcourir',
    'nav.messages': 'Messages',
    'nav.favorites': 'Favoris',
    'nav.profile': 'Profil',
    'nav.admin': 'Admin',
    'nav.listRoom': 'Publier',
    'nav.myListings': 'Mes Annonces',
    'nav.appointments': 'Rendez-vous',
    'nav.myProfile': 'Mon Profil',
    'nav.signOut': 'Se Déconnecter',
    'nav.adminPanel': 'Panneau Admin',
    'nav.listARoom': 'Publier une Chambre',
    'nav.signIn': 'Se Connecter',
    'nav.getStarted': 'Commencer',
    
    // Common
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.filters': 'Filtres',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.close': 'Fermer',
    'common.submit': 'Soumettre',
    'common.loading': 'Chargement...',
    
    // Auth
    'auth.login': 'Connexion',
    'auth.signup': 'S\'inscrire',
    'auth.logout': 'Déconnexion',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié?',
    
    // Home
    'home.hero.title': 'Trouvez Votre Chambre et Colocataire Parfaits à Malte',
    'home.hero.subtitle': 'Matching alimenté par l\'IA pour une colocation harmonieuse',
    'home.hero.cta': 'Commencer Votre Recherche',
    'home.hero.badge': 'Matching de Compatibilité par IA',
    'home.hero.searchPlaceholder': 'Entrez l\'emplacement ou le quartier...',
    'home.hero.stats.listings': 'Annonces Actives',
    'home.hero.stats.success': 'Succès de Matching',
    'home.hero.stats.roommates': 'Colocataires Heureux',
    'home.howItWorks.title': 'Comment Ça Marche',
    'home.howItWorks.subtitle': 'Trouver des colocataires compatibles n\'a jamais été aussi facile',
    'home.howItWorks.step1.title': 'Parcourir les Chambres',
    'home.howItWorks.step1.desc': 'Recherchez des annonces vérifiées avec des profils détaillés de colocataires',
    'home.howItWorks.step2.title': 'Matching par IA',
    'home.howItWorks.step2.desc': 'L\'IA analyse le mode de vie et les préférences pour trouver vos meilleurs matchs',
    'home.howItWorks.step3.title': 'Connectez-vous et Emménagez',
    'home.howItWorks.step3.desc': 'Envoyez des messages aux colocataires, planifiez des visites et trouvez votre maison',
    'home.featured.title': 'Chambres en Vedette',
    'home.featured.subtitle': 'Matchs hautement compatibles basés sur vos préférences',
    'home.featured.viewAll': 'Voir Toutes les Annonces',
    'home.featured.loading': 'Chargement des chambres...',
    'home.featured.noRooms': 'Aucune chambre disponible pour le moment',
    'home.cta.title': 'Prêt à Trouver Votre Match Parfait?',
    'home.cta.subtitle': 'Rejoignez des milliers de personnes qui trouvent des colocataires compatibles chaque jour',
    'home.cta.listRoom': 'Publier Votre Chambre',
    'home.cta.findRoom': 'Trouver une Chambre',
    'home.trust.title': 'Plateforme Sûre et Sécurisée',
    'home.trust.subtitle': 'Votre sécurité est notre priorité absolue',
    'home.trust.payments': 'Paiements Sécurisés',
    'home.trust.paymentsDesc': 'Crypté via Stripe',
    'home.trust.support': 'Support 24/7',
    'home.trust.supportDesc': 'Toujours là pour vous aider',
    'home.trust.reviews': 'Avis Vérifiés',
    'home.trust.reviewsDesc': 'Avis réels des utilisateurs',
    
    // Browse
    'browse.title': 'Trouvez Votre Chambre Parfaite',
    'browse.filters': 'Filtres',
    'browse.results': 'résultats',
    'browse.noResults': 'Aucune annonce trouvée',
    
    // Room Details
    'room.price': 'Prix',
    'room.available': 'Disponible',
    'room.type': 'Type de Chambre',
    'room.size': 'Taille',
    'room.amenities': 'Équipements',
    'room.description': 'Description',
    'room.contact': 'Contacter le Propriétaire',
    'room.save': 'Sauvegarder',
    'room.share': 'Partager',
    
    // Footer
    'footer.about': 'À Propos de QuickRoom8',
    'footer.contact': 'Contactez-nous',
    'footer.terms': 'Conditions d\'Utilisation',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.browse': 'Parcourir',
    'footer.listRoom': 'Publier',
    'footer.safety': 'Sécurité',
    'footer.copyright': '© 2025 QuickRoom8',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.browse': 'Explorar',
    'nav.messages': 'Mensajes',
    'nav.favorites': 'Favoritos',
    'nav.profile': 'Perfil',
    'nav.admin': 'Admin',
    'nav.listRoom': 'Publicar',
    'nav.myListings': 'Mis Anuncios',
    'nav.appointments': 'Citas',
    'nav.myProfile': 'Mi Perfil',
    'nav.signOut': 'Cerrar Sesión',
    'nav.adminPanel': 'Panel de Admin',
    'nav.listARoom': 'Publicar una Habitación',
    'nav.signIn': 'Iniciar Sesión',
    'nav.getStarted': 'Comenzar',
    
    // Common
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.filters': 'Filtros',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.close': 'Cerrar',
    'common.submit': 'Enviar',
    'common.loading': 'Cargando...',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.signup': 'Registrarse',
    'auth.logout': 'Cerrar Sesión',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    
    // Home
    'home.hero.title': 'Encuentra Tu Habitación y Compañero Perfecto en Malta',
    'home.hero.subtitle': 'Matching con IA para una convivencia perfecta',
    'home.hero.cta': 'Comenzar Tu Búsqueda',
    'home.hero.badge': 'Matching de Compatibilidad con IA',
    'home.hero.searchPlaceholder': 'Ingresa ubicación o vecindario...',
    'home.hero.stats.listings': 'Anuncios Activos',
    'home.hero.stats.success': 'Éxito de Matching',
    'home.hero.stats.roommates': 'Compañeros Felices',
    'home.howItWorks.title': 'Cómo Funciona',
    'home.howItWorks.subtitle': 'Encontrar compañeros compatibles nunca ha sido tan fácil',
    'home.howItWorks.step1.title': 'Explorar Habitaciones',
    'home.howItWorks.step1.desc': 'Busca anuncios verificados con perfiles detallados de compañeros',
    'home.howItWorks.step2.title': 'Matching con IA',
    'home.howItWorks.step2.desc': 'La IA analiza el estilo de vida y las preferencias para encontrar tus mejores coincidencias',
    'home.howItWorks.step3.title': 'Conecta y Múdate',
    'home.howItWorks.step3.desc': 'Envía mensajes a compañeros, programa visitas y encuentra tu hogar',
    'home.featured.title': 'Habitaciones Destacadas',
    'home.featured.subtitle': 'Coincidencias altamente compatibles basadas en tus preferencias',
    'home.featured.viewAll': 'Ver Todos los Anuncios',
    'home.featured.loading': 'Cargando habitaciones...',
    'home.featured.noRooms': 'No hay habitaciones disponibles en este momento',
    'home.cta.title': '¿Listo para Encontrar Tu Match Perfecto?',
    'home.cta.subtitle': 'Únete a miles de personas que encuentran compañeros compatibles todos los días',
    'home.cta.listRoom': 'Publicar Tu Habitación',
    'home.cta.findRoom': 'Encontrar una Habitación',
    'home.trust.title': 'Plataforma Segura y Protegida',
    'home.trust.subtitle': 'Tu seguridad es nuestra prioridad',
    'home.trust.payments': 'Pagos Seguros',
    'home.trust.paymentsDesc': 'Encriptado vía Stripe',
    'home.trust.support': 'Soporte 24/7',
    'home.trust.supportDesc': 'Siempre aquí para ayudar',
    'home.trust.reviews': 'Reseñas Verificadas',
    'home.trust.reviewsDesc': 'Reseñas reales de usuarios',
    
    // Browse
    'browse.title': 'Encuentra Tu Habitación Perfecta',
    'browse.filters': 'Filtros',
    'browse.results': 'resultados',
    'browse.noResults': 'No se encontraron anuncios',
    
    // Room Details
    'room.price': 'Precio',
    'room.available': 'Disponible',
    'room.type': 'Tipo de Habitación',
    'room.size': 'Tamaño',
    'room.amenities': 'Comodidades',
    'room.description': 'Descripción',
    'room.contact': 'Contactar Propietario',
    'room.save': 'Guardar',
    'room.share': 'Compartir',
    
    // Footer
    'footer.about': 'Acerca de QuickRoom8',
    'footer.contact': 'Contáctanos',
    'footer.terms': 'Términos de Servicio',
    'footer.privacy': 'Política de Privacidad',
    'footer.browse': 'Explorar',
    'footer.listRoom': 'Publicar',
    'footer.safety': 'Seguridad',
    'footer.copyright': '© 2025 QuickRoom8',
  },
  it: {
    // Navigation
    'nav.home': 'Home',
    'nav.browse': 'Esplora',
    'nav.messages': 'Messaggi',
    'nav.favorites': 'Preferiti',
    'nav.profile': 'Profilo',
    'nav.admin': 'Admin',
    'nav.listRoom': 'Pubblica',
    'nav.myListings': 'I Miei Annunci',
    'nav.appointments': 'Appuntamenti',
    'nav.myProfile': 'Il Mio Profilo',
    'nav.signOut': 'Esci',
    'nav.adminPanel': 'Pannello Admin',
    'nav.listARoom': 'Pubblica una Camera',
    'nav.signIn': 'Accedi',
    'nav.getStarted': 'Inizia',
    
    // Common
    'common.search': 'Cerca',
    'common.filter': 'Filtra',
    'common.filters': 'Filtri',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.edit': 'Modifica',
    'common.view': 'Visualizza',
    'common.close': 'Chiudi',
    'common.submit': 'Invia',
    'common.loading': 'Caricamento...',
    
    // Auth
    'auth.login': 'Accedi',
    'auth.signup': 'Registrati',
    'auth.logout': 'Esci',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Password dimenticata?',
    
    // Home
    'home.hero.title': 'Trova la Tua Camera e Coinquilino Perfetti a Malta',
    'home.hero.subtitle': 'Matching con AI per una convivenza armoniosa',
    'home.hero.cta': 'Inizia la Tua Ricerca',
    'home.hero.badge': 'Matching di Compatibilità con AI',
    'home.hero.searchPlaceholder': 'Inserisci posizione o quartiere...',
    'home.hero.stats.listings': 'Annunci Attivi',
    'home.hero.stats.success': 'Successo di Matching',
    'home.hero.stats.roommates': 'Coinquilini Felici',
    'home.howItWorks.title': 'Come Funziona',
    'home.howItWorks.subtitle': 'Trovare coinquilini compatibili non è mai stato così facile',
    'home.howItWorks.step1.title': 'Esplora Camere',
    'home.howItWorks.step1.desc': 'Cerca annunci verificati con profili dettagliati dei coinquilini',
    'home.howItWorks.step2.title': 'Matching con AI',
    'home.howItWorks.step2.desc': 'L\'AI analizza lo stile di vita e le preferenze per trovare i tuoi migliori match',
    'home.howItWorks.step3.title': 'Connetti e Trasferisciti',
    'home.howItWorks.step3.desc': 'Invia messaggi ai coinquilini, programma visite e trova la tua casa',
    'home.featured.title': 'Camere in Evidenza',
    'home.featured.subtitle': 'Match altamente compatibili basati sulle tue preferenze',
    'home.featured.viewAll': 'Vedi Tutti gli Annunci',
    'home.featured.loading': 'Caricamento camere...',
    'home.featured.noRooms': 'Nessuna camera disponibile al momento',
    'home.cta.title': 'Pronto a Trovare il Tuo Match Perfetto?',
    'home.cta.subtitle': 'Unisciti a migliaia di persone che trovano coinquilini compatibili ogni giorno',
    'home.cta.listRoom': 'Pubblica la Tua Camera',
    'home.cta.findRoom': 'Trova una Camera',
    'home.trust.title': 'Piattaforma Sicura e Protetta',
    'home.trust.subtitle': 'La tua sicurezza è la nostra priorità',
    'home.trust.payments': 'Pagamenti Sicuri',
    'home.trust.paymentsDesc': 'Crittografato tramite Stripe',
    'home.trust.support': 'Supporto 24/7',
    'home.trust.supportDesc': 'Sempre qui per aiutarti',
    'home.trust.reviews': 'Recensioni Verificate',
    'home.trust.reviewsDesc': 'Recensioni reali degli utenti',
    
    // Browse
    'browse.title': 'Trova la Tua Camera Perfetta',
    'browse.filters': 'Filtri',
    'browse.results': 'risultati',
    'browse.noResults': 'Nessun annuncio trovato',
    
    // Room Details
    'room.price': 'Prezzo',
    'room.available': 'Disponibile',
    'room.type': 'Tipo di Camera',
    'room.size': 'Dimensione',
    'room.amenities': 'Servizi',
    'room.description': 'Descrizione',
    'room.contact': 'Contatta il Proprietario',
    'room.save': 'Salva',
    'room.share': 'Condividi',
    
    // Footer
    'footer.about': 'Chi Siamo - QuickRoom8',
    'footer.contact': 'Contattaci',
    'footer.terms': 'Termini di Servizio',
    'footer.privacy': 'Privacy Policy',
    'footer.browse': 'Esplora',
    'footer.listRoom': 'Pubblica',
    'footer.safety': 'Sicurezza',
    'footer.copyright': '© 2025 QuickRoom8',
  },
  de: {
    // Navigation
    'nav.home': 'Start',
    'nav.browse': 'Durchsuchen',
    'nav.messages': 'Nachrichten',
    'nav.favorites': 'Favoriten',
    'nav.profile': 'Profil',
    'nav.admin': 'Admin',
    'nav.listRoom': 'Inserieren',
    'nav.myListings': 'Meine Anzeigen',
    'nav.appointments': 'Termine',
    'nav.myProfile': 'Mein Profil',
    'nav.signOut': 'Abmelden',
    'nav.adminPanel': 'Admin-Panel',
    'nav.listARoom': 'Zimmer Inserieren',
    'nav.signIn': 'Anmelden',
    'nav.getStarted': 'Loslegen',
    
    // Common
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.filters': 'Filter',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.view': 'Ansehen',
    'common.close': 'Schließen',
    'common.submit': 'Absenden',
    'common.loading': 'Lädt...',
    
    // Auth
    'auth.login': 'Anmelden',
    'auth.signup': 'Registrieren',
    'auth.logout': 'Abmelden',
    'auth.email': 'Email',
    'auth.password': 'Passwort',
    'auth.forgotPassword': 'Passwort vergessen?',
    
    // Home
    'home.hero.title': 'Finde Dein Perfektes Zimmer & Mitbewohner in Malta',
    'home.hero.subtitle': 'KI-gestütztes Matching für harmonisches Zusammenleben',
    'home.hero.cta': 'Starte Deine Suche',
    'home.hero.badge': 'KI-gestütztes Kompatibilitäts-Matching',
    'home.hero.searchPlaceholder': 'Standort oder Nachbarschaft eingeben...',
    'home.hero.stats.listings': 'Aktive Anzeigen',
    'home.hero.stats.success': 'Matching-Erfolg',
    'home.hero.stats.roommates': 'Glückliche Mitbewohner',
    'home.howItWorks.title': 'Wie Es Funktioniert',
    'home.howItWorks.subtitle': 'Kompatible Mitbewohner zu finden war noch nie so einfach',
    'home.howItWorks.step1.title': 'Zimmer Durchsuchen',
    'home.howItWorks.step1.desc': 'Suche verifizierte Anzeigen mit detaillierten Mitbewohner-Profilen',
    'home.howItWorks.step2.title': 'KI-Matching',
    'home.howItWorks.step2.desc': 'KI analysiert Lebensstil und Präferenzen, um deine besten Matches zu finden',
    'home.howItWorks.step3.title': 'Verbinden & Einziehen',
    'home.howItWorks.step3.desc': 'Schreibe Mitbewohnern, plane Besichtigungen und finde dein Zuhause',
    'home.featured.title': 'Ausgewählte Zimmer',
    'home.featured.subtitle': 'Hochkompatible Matches basierend auf deinen Präferenzen',
    'home.featured.viewAll': 'Alle Anzeigen Ansehen',
    'home.featured.loading': 'Lade Zimmer...',
    'home.featured.noRooms': 'Momentan keine Zimmer verfügbar',
    'home.cta.title': 'Bereit, Deinen Perfekten Match zu Finden?',
    'home.cta.subtitle': 'Schließe dich tausenden Menschen an, die täglich kompatible Mitbewohner finden',
    'home.cta.listRoom': 'Dein Zimmer Inserieren',
    'home.cta.findRoom': 'Zimmer Finden',
    'home.trust.title': 'Sichere & Geschützte Plattform',
    'home.trust.subtitle': 'Deine Sicherheit ist unsere Priorität',
    'home.trust.payments': 'Sichere Zahlungen',
    'home.trust.paymentsDesc': 'Verschlüsselt via Stripe',
    'home.trust.support': '24/7 Support',
    'home.trust.supportDesc': 'Immer für dich da',
    'home.trust.reviews': 'Verifizierte Bewertungen',
    'home.trust.reviewsDesc': 'Echte Nutzerbewertungen',
    
    // Browse
    'browse.title': 'Finde Dein Perfektes Zimmer',
    'browse.filters': 'Filter',
    'browse.results': 'Ergebnisse',
    'browse.noResults': 'Keine Anzeigen gefunden',
    
    // Room Details
    'room.price': 'Preis',
    'room.available': 'Verfügbar',
    'room.type': 'Zimmertyp',
    'room.size': 'Größe',
    'room.amenities': 'Ausstattung',
    'room.description': 'Beschreibung',
    'room.contact': 'Eigentümer Kontaktieren',
    'room.save': 'Speichern',
    'room.share': 'Teilen',
    
    // Footer
    'footer.about': 'Über QuickRoom8',
    'footer.contact': 'Kontaktiere Uns',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.privacy': 'Datenschutz',
    'footer.browse': 'Durchsuchen',
    'footer.listRoom': 'Inserieren',
    'footer.safety': 'Sicherheit',
    'footer.copyright': '© 2025 QuickRoom8',
  },
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.browse': 'Обзор',
    'nav.messages': 'Сообщения',
    'nav.favorites': 'Избранное',
    'nav.profile': 'Профиль',
    'nav.admin': 'Админ',
    'nav.listRoom': 'Разместить',
    'nav.myListings': 'Мои Объявления',
    'nav.appointments': 'Встречи',
    'nav.myProfile': 'Мой Профиль',
    'nav.signOut': 'Выйти',
    'nav.adminPanel': 'Панель Админа',
    'nav.listARoom': 'Разместить Комнату',
    'nav.signIn': 'Войти',
    'nav.getStarted': 'Начать',
    
    // Common
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.filters': 'Фильтры',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.view': 'Просмотр',
    'common.close': 'Закрыть',
    'common.submit': 'Отправить',
    'common.loading': 'Загрузка...',
    
    // Auth
    'auth.login': 'Войти',
    'auth.signup': 'Регистрация',
    'auth.logout': 'Выйти',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.forgotPassword': 'Забыли пароль?',
    
    // Home
    'home.hero.title': 'Найдите Идеальную Комнату и Соседа на Мальте',
    'home.hero.subtitle': 'ИИ-подбор для гармоничного совместного проживания',
    'home.hero.cta': 'Начать Поиск',
    'home.hero.badge': 'Подбор Совместимости с ИИ',
    'home.hero.searchPlaceholder': 'Введите местоположение или район...',
    'home.hero.stats.listings': 'Активные Объявления',
    'home.hero.stats.success': 'Успех Подбора',
    'home.hero.stats.roommates': 'Довольные Соседи',
    'home.howItWorks.title': 'Как Это Работает',
    'home.howItWorks.subtitle': 'Найти совместимых соседей никогда не было так просто',
    'home.howItWorks.step1.title': 'Просмотр Комнат',
    'home.howItWorks.step1.desc': 'Ищите проверенные объявления с детальными профилями соседей',
    'home.howItWorks.step2.title': 'Подбор с ИИ',
    'home.howItWorks.step2.desc': 'ИИ анализирует образ жизни и предпочтения для поиска лучших совпадений',
    'home.howItWorks.step3.title': 'Свяжитесь и Въезжайте',
    'home.howItWorks.step3.desc': 'Пишите соседям, планируйте просмотры и находите свой дом',
    'home.featured.title': 'Избранные Комнаты',
    'home.featured.subtitle': 'Высоко совместимые совпадения на основе ваших предпочтений',
    'home.featured.viewAll': 'Посмотреть Все Объявления',
    'home.featured.loading': 'Загрузка комнат...',
    'home.featured.noRooms': 'В данный момент нет доступных комнат',
    'home.cta.title': 'Готовы Найти Своё Идеальное Совпадение?',
    'home.cta.subtitle': 'Присоединяйтесь к тысячам людей, которые ежедневно находят совместимых соседей',
    'home.cta.listRoom': 'Разместить Вашу Комнату',
    'home.cta.findRoom': 'Найти Комнату',
    'home.trust.title': 'Безопасная и Защищённая Платформа',
    'home.trust.subtitle': 'Ваша безопасность - наш приоритет',
    'home.trust.payments': 'Безопасные Платежи',
    'home.trust.paymentsDesc': 'Зашифровано через Stripe',
    'home.trust.support': 'Поддержка 24/7',
    'home.trust.supportDesc': 'Всегда здесь, чтобы помочь',
    'home.trust.reviews': 'Проверенные Отзывы',
    'home.trust.reviewsDesc': 'Реальные отзывы пользователей',
    
    // Browse
    'browse.title': 'Найдите Вашу Идеальную Комнату',
    'browse.filters': 'Фильтры',
    'browse.results': 'результатов',
    'browse.noResults': 'Объявления не найдены',
    
    // Room Details
    'room.price': 'Цена',
    'room.available': 'Доступно',
    'room.type': 'Тип Комнаты',
    'room.size': 'Размер',
    'room.amenities': 'Удобства',
    'room.description': 'Описание',
    'room.contact': 'Связаться с Владельцем',
    'room.save': 'Сохранить',
    'room.share': 'Поделиться',
    
    // Footer
    'footer.about': 'О QuickRoom8',
    'footer.contact': 'Свяжитесь с Нами',
    'footer.terms': 'Условия Использования',
    'footer.privacy': 'Политика Конфиденциальности',
    'footer.browse': 'Обзор',
    'footer.listRoom': 'Разместить',
    'footer.safety': 'Безопасность',
    'footer.copyright': '© 2025 QuickRoom8',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inizializza con default 'en' - localStorage viene letto solo dopo il mount
  const [language, setLanguageState] = useState<Language>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  // Leggi localStorage SOLO dopo il mount (client-side)
  // This is a known hydration pattern - setState in effect is intentional here
  useEffect(() => {
    const saved = localStorage.getItem('language');
    const validLanguages: Language[] = ['en', 'mt', 'fr', 'es', 'it', 'de', 'ru'];
    if (saved && validLanguages.includes(saved as Language)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved as Language);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  // Salva in localStorage quando cambia la lingua (solo se hydrated)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('language', language);
    }
  }, [language, isHydrated]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
