export type Locale = "en" | "ar" | "fr";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
};

const translations = {
  en: {
    nav: {
      library: "Library",
      dashboard: "Dashboard",
      leaderboard: "Leaderboard",
      ramadan: "Ramadan",
      profile: "Profile",
      signIn: "Sign In",
      language: "Language",
    },
    auth: {
      title: "Welcome back",
      subtitle: "Sign in to continue your reading journey.",
      email: "Email",
      password: "Password",
      button: "Sign in",
      demo: "Use your email to continue.",
    },
  },
  ar: {
    nav: {
      library: "المكتبة",
      dashboard: "لوحة التحكم",
      leaderboard: "لوحة المتصدرين",
      ramadan: "رمضان",
      profile: "الملف الشخصي",
      signIn: "تسجيل الدخول",
      language: "اللغة",
    },
    auth: {
      title: "مرحبًا بعودتك",
      subtitle: "سجّل الدخول لمتابعة رحلتك في القراءة.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      button: "تسجيل الدخول",
      demo: "استخدم بريدك للمتابعة.",
    },
  },
  fr: {
    nav: {
      library: "Bibliothèque",
      dashboard: "Tableau de bord",
      leaderboard: "Classement",
      ramadan: "Ramadan",
      profile: "Profil",
      signIn: "Se connecter",
      language: "Langue",
    },
    auth: {
      title: "Bon retour",
      subtitle: "Connectez-vous pour continuer votre lecture.",
      email: "E-mail",
      password: "Mot de passe",
      button: "Se connecter",
      demo: "Utilisez votre e-mail pour continuer.",
    },
  },
} as const;

export function getLocale() {
  return (localStorage.getItem("rawdat-locale") as Locale) || "en";
}

export function setLocale(locale: Locale) {
  localStorage.setItem("rawdat-locale", locale);
  window.dispatchEvent(new Event("rawdat-locale-change"));
}

export function t(locale: Locale) {
  return translations[locale];
}
