"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "mr";

export interface Translations {
  // Navigation & Sidebar
  appName: string;
  appSubtitle: string;
  navMain: string;
  navMyExchange: string;
  navPersonal: string;
  dashboard: string;
  exploreSkills: string;
  smartMatches: string;
  resourceExchange: string;
  myOffers: string;
  myNeeds: string;
  collaborations: string;
  messages: string;
  savedListings: string;
  myProfile: string;
  reviewsReputation: string;
  settings: string;
  logOut: string;
  logIn: string;
  signUp: string;
  collapse: string;
  expand: string;

  // Dashboard
  welcomeHeading: string;
  welcomeSub: string;
  findMatches: string;
  postOffer: string;
  postNeed: string;
  statActiveOffers: string;
  statOpenNeeds: string;
  statCollaborations: string;
  statPotentialMatches: string;
  recommendedForYou: string;
  recommendedDesc: string;
  viewAllMatches: string;
  recentActivity: string;
  quickActions: string;
  exchangeBannerHeading: string;
  exchangeBannerText: string;

  // Common UI
  searchPlaceholder: string;
  all: string;
  offers: string;
  needs: string;
  viewDetails: string;
  viewProfile: string;
  proposeExchange: string;
  messageOwner: string;
  save: string;
  cancel: string;
  submit: string;
  edit: string;
  delete: string;
  status: string;
  active: string;
  completed: string;
  pending: string;
  declined: string;
  emptyState: string;
  back: string;
  send: string;
  filter: string;
  category: string;
  location: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "SkillSwap Rural",
    appSubtitle: "Rural Entrepreneur Exchange",
    navMain: "MAIN",
    navMyExchange: "MY EXCHANGE",
    navPersonal: "PERSONAL",
    dashboard: "Dashboard",
    exploreSkills: "Explore Skills",
    smartMatches: "Smart Matches",
    resourceExchange: "Resource Exchange",
    myOffers: "My Offers",
    myNeeds: "My Needs",
    collaborations: "Collaborations",
    messages: "Messages",
    savedListings: "Saved Listings",
    myProfile: "My Profile",
    reviewsReputation: "Reviews & Reputation",
    settings: "Settings",
    logOut: "Log out",
    logIn: "Log in",
    signUp: "Sign up free",
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",

    welcomeHeading: "Your next great exchange starts here.",
    welcomeSub: "Find someone who needs what you offer and has what you need.",
    findMatches: "Find Matches",
    postOffer: "Post an Offer",
    postNeed: "Post a Need",
    statActiveOffers: "Active Offers",
    statOpenNeeds: "Open Needs",
    statCollaborations: "Collaborations",
    statPotentialMatches: "Potential Matches",
    recommendedForYou: "Recommended for You",
    recommendedDesc: "Entrepreneurs whose needs and offers complement yours.",
    viewAllMatches: "View All Matches",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    exchangeBannerHeading: "The Power of Direct Skill Exchange",
    exchangeBannerText: "Rural entrepreneurs exchange skills and resources without cash. Raj provides organic produce; Priya provides packaging design. Both businesses thrive together.",

    searchPlaceholder: "Search skills, people, or resources...",
    all: "All",
    offers: "Offers",
    needs: "Needs",
    viewDetails: "View Details",
    viewProfile: "View Profile",
    proposeExchange: "Propose Exchange",
    messageOwner: "Message",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    edit: "Edit",
    delete: "Delete",
    status: "Status",
    active: "Active",
    completed: "Completed",
    pending: "Pending",
    declined: "Declined",
    emptyState: "No items found",
    back: "Back",
    send: "Send",
    filter: "Filter",
    category: "Category",
    location: "Location",
  },
  hi: {
    appName: "स्किलस्वैप रूरल",
    appSubtitle: "ग्रामीण उद्यमी कौशल व संसाधन विनिमय",
    navMain: "मुख्य",
    navMyExchange: "मेरा विनिमय",
    navPersonal: "व्यक्तिगत",
    dashboard: "डैशबोर्ड",
    exploreSkills: "कौशल खोजें",
    smartMatches: "स्मार्ट मैच",
    resourceExchange: "संसाधन विनिमय",
    myOffers: "मेरे प्रस्ताव",
    myNeeds: "मेरी आवश्यकताएं",
    collaborations: "सहयोग",
    messages: "संदेश",
    savedListings: "सहेजी गई सूचियां",
    myProfile: "मेरी प्रोफाइल",
    reviewsReputation: "समीक्षा और प्रतिष्ठा",
    settings: "सेटिंग्स",
    logOut: "लॉग आउट",
    logIn: "लॉग इन",
    signUp: "निःशुल्क जुड़ें",
    collapse: "साइडबार संक्षिप्त करें",
    expand: "साइडबार विस्तार करें",

    welcomeHeading: "आपका अगला बेहतरीन विनिमय यहीं से शुरू होता है।",
    welcomeSub: "ऐसे साथी खोजें जिन्हें आपके हुनर की जरूरत है और जिनके पास आपकी जरूरत का हुनर है।",
    findMatches: "मैच खोजें",
    postOffer: "प्रस्ताव पोस्ट करें",
    postNeed: "आवश्यकता पोस्ट करें",
    statActiveOffers: "सक्रिय प्रस्ताव",
    statOpenNeeds: "खुली आवश्यकताएं",
    statCollaborations: "सहयोग",
    statPotentialMatches: "संभावित मैच",
    recommendedForYou: "आपके लिए अनुशंसित",
    recommendedDesc: "ऐसे उद्यमी जिनके हुनर और आवश्यकताएं आपके पूरक हैं।",
    viewAllMatches: "सभी मैच देखें",
    recentActivity: "हाल की गतिविधि",
    quickActions: "त्वरित कार्य",
    exchangeBannerHeading: "प्रत्यक्ष कौशल विनिमय की शक्ति",
    exchangeBannerText: "ग्रामीण उद्यमी बिना नकद के कौशल और संसाधनों का आदान-प्रदान करते हैं। राज जैविक उपज देते हैं; प्रिया पैकेजिंग डिज़ाइन करती हैं। दोनों व्यवसाय साथ बढ़ते हैं।",

    searchPlaceholder: "कौशल, लोग या संसाधन खोजें...",
    all: "सभी",
    offers: "प्रस्ताव",
    needs: "आवश्यकताएं",
    viewDetails: "विवरण देखें",
    viewProfile: "प्रोफ़ाइल देखें",
    proposeExchange: "विनिमय का प्रस्ताव दें",
    messageOwner: "संदेश भेजें",
    save: "सहेजें",
    cancel: "रद्द करें",
    submit: "जमा करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    status: "स्थिति",
    active: "सक्रिय",
    completed: "पूर्ण",
    pending: "लंबित",
    declined: "अस्वीकृत",
    emptyState: "कोई जानकारी नहीं मिली",
    back: "वापस",
    send: "भेजें",
    filter: "फ़िल्टर",
    category: "श्रेणी",
    location: "स्थान",
  },
  mr: {
    appName: "स्किलस्वॅप रुरल",
    appSubtitle: "ग्रामीण उद्योजक कौशल्य व साधनसंपत्ती देवाणघेवाण",
    navMain: "मुख्य",
    navMyExchange: "माझी देवाणघेवाण",
    navPersonal: "वैयक्तिक",
    dashboard: "डॅशबोर्ड",
    exploreSkills: "कौशल्ये शोधा",
    smartMatches: "स्मार्ट मॅचेस",
    resourceExchange: "संसाधन देवाणघेवाण",
    myOffers: "माझ्या ऑफर्स",
    myNeeds: "माझ्या गरजा",
    collaborations: "सहकार्य",
    messages: "संदेश",
    savedListings: "जतन केलेल्या सूची",
    myProfile: "माझे प्रोफाइल",
    reviewsReputation: "अभिप्राय आणि प्रतिष्ठा",
    settings: "सेटिंग्ज",
    logOut: "लॉग आउट",
    logIn: "लॉग इन",
    signUp: "मोफत सामील व्हा",
    collapse: "साइडबार लहान करा",
    expand: "साइडबार मोठा करा",

    welcomeHeading: "तुमची पुढची उत्तम देवाणघेवाण येथून सुरू होते.",
    welcomeSub: "ज्यांना तुमच्या कौशल्याची गरज आहे आणि ज्यांच्याकडे तुमची गरज पूर्ण करण्याची क्षमता आहे अशा व्यक्ती शोधा.",
    findMatches: "मॅचेस शोधा",
    postOffer: "ऑफर पोस्ट करा",
    postNeed: "गरज पोस्ट करा",
    statActiveOffers: "सक्रिय ऑफर्स",
    statOpenNeeds: "खुली गरजा",
    statCollaborations: "सहकार्य",
    statPotentialMatches: "संभाव्य मॅचेस",
    recommendedForYou: "तुमच्यासाठी शिफारस केलेले",
    recommendedDesc: "असे उद्योजक ज्यांच्या गरजा आणि ऑफर्स तुमच्याशी सुसंगत आहेत.",
    viewAllMatches: "सर्व मॅचेस पहा",
    recentActivity: "अलीकडील हालचाली",
    quickActions: "जलद कृती",
    exchangeBannerHeading: "थेट कौशल्य देवाणघेवाणीची ताकद",
    exchangeBannerText: "ग्रामीण उद्योजक पैशांशिवाय कौशल्ये आणि संसाधनांची देवाणघेवाण करतात. राहुल सेंद्रिय भाजीपाला देतात; प्रिया पॅकेजिंग डिझाइन करतात. दोन्ही व्यवसाय एकत्र वाढतात.",

    searchPlaceholder: "कौशल्ये, लोक किंवा संसाधने शोधा...",
    all: "सर्व",
    offers: "ऑफर्स",
    needs: "गरजा",
    viewDetails: "तपशील पहा",
    viewProfile: "प्रोफाइल पहा",
    proposeExchange: "देवाणघेवाण प्रस्ताव द्या",
    messageOwner: "संदेश पाठवा",
    save: "जतन करा",
    cancel: "रद्द करा",
    submit: "सबमिट करा",
    edit: "संपादित करा",
    delete: "हटवा",
    status: "स्थिती",
    active: "सक्रिय",
    completed: "पूर्ण",
    pending: "प्रलंबित",
    declined: "नाकारले",
    emptyState: "काहीही आढळले नाही",
    back: "मागे",
    send: "पाठवा",
    filter: "फिल्टर",
    category: "श्रेणी",
    location: "स्थान",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export function I18nProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLangState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const saved = localStorage.getItem("skillswap_lang") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
      setLangState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = initialLanguage;
    }
  }, [initialLanguage]);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem("skillswap_lang", lang);
    document.cookie = `skillswap_lang=${lang}; path=/; max-age=31536000`;
    document.documentElement.lang = lang;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language] || translations.en,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
