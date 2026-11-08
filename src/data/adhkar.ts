export interface Supplication {
  id: string;
  category:
    | "Home"
    | "Masjid"
    | "Salah"
    | "Morning & Evening"
    | "Sleep & Awakening"
    | "Distress & Forgiveness"
    | "Daily Life";
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  targetCount: number;
  reference: string;
  fadilah?: string; // Virtue / reward
  contextNotes?: string;
}

export const AUTHENTIC_ADHKAR: Supplication[] = [
  // --- HOME ---
  {
    id: "home-exit-1",
    category: "Home",
    title: "When Leaving the House",
    arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillāh, tawakkaltu 'alallāh, wa lā ḥawla wa lā quwwata illā billāh.",
    translation:
      "In the name of Allah, I place my trust in Allah; there is no might nor power except with Allah.",
    targetCount: 1,
    reference: "Abu Dawud (5095), at-Tirmidhi (3426) · Graded Sahih",
    fadilah:
      "The angels declare: 'You are guided, defended, and protected', and Shaytan turns away from you.",
    contextNotes: "Recite when stepping outside the doorway of your home.",
  },
  {
    id: "home-exit-2",
    category: "Home",
    title: "Seeking Protection Upon Leaving",
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ",
    transliteration:
      "Allāhumma innī a'ūdhu bika an aḍilla aw uḍall, aw azilla aw uzall, aw aẓlima aw uẓlam, aw ajhala aw yujhala 'alayy.",
    translation:
      "O Allah, I seek refuge with You lest I stray or be led astray, slip or be made to slip, oppress or be oppressed, or act ignorantly or be acted against with ignorance.",
    targetCount: 1,
    reference: "Sunan Abi Dawud (5094), at-Tirmidhi (3427) · Sahih",
    fadilah: "Preserves moral uprightness and divine shelter against harm in public.",
  },
  {
    id: "home-enter",
    category: "Home",
    title: "When Entering the House",
    arabic:
      "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    transliteration:
      "Bismillāhi walajnā, wa bismillāhi kharajnā, wa 'alā rabbinā tawakkalnā.",
    translation:
      "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.",
    targetCount: 1,
    reference: "Sunan Abi Dawud (5096) · Sahih",
    fadilah: "Follow with the greeting of Salam (As-Salamu 'Alaykum) to bring blessing upon the household.",
    contextNotes: "Recite as you step into your home with your right foot.",
  },

  // --- MASJID ---
  {
    id: "masjid-enter",
    category: "Masjid",
    title: "Upon Entering the Masjid",
    arabic:
      "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration:
      "Bismillāh, waṣ-ṣalātu was-salāmu 'alā rasūlillāh, Allāhummaf-taḥ lī abwāba raḥmatik.",
    translation:
      "In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open for me the gates of Your mercy.",
    targetCount: 1,
    reference: "Sahih Muslim (713), Sunan Ibn Majah (771)",
    fadilah: "Enters under the immediate canopy of divine acceptance and mercy.",
    contextNotes: "Enter stepping with the right foot first.",
  },
  {
    id: "masjid-exit",
    category: "Masjid",
    title: "Upon Leaving the Masjid",
    arabic:
      "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration:
      "Bismillāh, waṣ-ṣalātu was-salāmu 'alā rasūlillāh, Allāhumma innī as'aluka min faḍlik, Allāhummā-'ṣimnī minash-shayṭānir-rajīm.",
    translation:
      "In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, I ask You from Your bounty. O Allah, shield me from the outcast Shaytan.",
    targetCount: 1,
    reference: "Sahih Muslim (713), Ibn Majah (773) · Sahih",
    fadilah: "Guarantees divine protection from temptations when returning to worldly activities.",
    contextNotes: "Step out with the left foot first.",
  },
  {
    id: "masjid-walking",
    category: "Masjid",
    title: "Walking to the Masjid (Dua an-Nur)",
    arabic:
      "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَفِي سَمْعِي نُورًا، وَفِي بَصَرِي نُورًا، وَمِنْ فَوْقِي نُورًا، وَمِنْ تَحْتِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ شِمَالِي نُورًا",
    transliteration:
      "Allāhummaj-'al fī qalbī nūrā, wa fī lisānī nūrā, wa fī sam'ī nūrā, wa fī baṣarī nūrā, wa min fawqī nūrā, wa min taḥtī nūrā, wa 'an yamīnī nūrā, wa 'an shimālī nūrā.",
    translation:
      "O Allah, place light in my heart, light in my tongue, light in my hearing, light in my sight, light above me, light below me, light to my right, and light to my left.",
    targetCount: 1,
    reference: "Sahih al-Bukhari (6316), Sahih Muslim (763)",
    fadilah: "Illuminates every aspect of perception, speech, and movement.",
  },

  // --- SALAH (AFTER PRAYER) ---
  {
    id: "salah-istighfar",
    category: "Salah",
    title: "Immediately After Tasleem",
    arabic: "أَسْتَغْفِرُ اللَّهَ (٣×)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration:
      "Astaghfirullāh (3x). Allāhumma antas-salām wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām.",
    translation:
      "I ask Allah for forgiveness (3x). O Allah, You are Peace and from You comes peace; blessed are You, O Possessor of majesty and honor.",
    targetCount: 1,
    reference: "Sahih Muslim (591)",
    fadilah: "Mends whatever deficiencies occurred during the prayer.",
  },
  {
    id: "salah-tasbeeh",
    category: "Salah",
    title: "Tasbeeh of Fatima (After Every Fard Prayer)",
    arabic: "سُبْحَانَ اللَّهِ (٣٣×) • الْحَمْدُ لِلَّهِ (٣٣×) • اللَّهُ أَكْبَرُ (٣٣×) • لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "Subḥānallāh (33x), Alḥamdulillāh (33x), Allāhu Akbar (33x), Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli shay'in qadīr (1x).",
    translation:
      "Glory be to Allah (33x), Praise be to Allah (33x), Allah is the Greatest (33x), There is no deity worthy of worship except Allah alone without partner (1x).",
    targetCount: 33,
    reference: "Sahih Muslim (597)",
    fadilah: "Sins will be forgiven even if they were as vast as the foam of the sea.",
  },
  {
    id: "salah-kursi",
    category: "Salah",
    title: "Ayat al-Kursi (After Every Fard Prayer)",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration:
      "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khudhuhū sinatuw-wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ, man dhal-ladhī yashfa'u 'indahū illā bi-idhnih, ya'lamu mā bayna aydīhim wa mā khalfahum, wa lā yuḥīṭūna bi-shay'im-min 'ilmihī illā bimā shā', wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya'ūduhū ḥifẓuhumā, wa huwal-'aliyyul-'aẓīm.",
    translation:
      "Allah — there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth...",
    targetCount: 1,
    reference: "An-Nasa'i (Al-Kubra 9928) · Authenticated by Ibn Hajar & al-Albani",
    fadilah:
      "The Prophet (ﷺ) said: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.'",
  },

  // --- MORNING & EVENING ---
  {
    id: "sayyid-al-istighfar",
    category: "Morning & Evening",
    title: "Sayyid al-Istighfar (The Master Supplication for Forgiveness)",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allāhumma anta Rabbī lā ilāha illā ant, khalaqtanī wa anā 'abduk, wa anā 'alā 'ahdika wa wa'dika mastaṭa't, a'ūdhu bika min sharri mā ṣana't, abū'u laka bi-ni'matika 'alayy, wa abū'u bi-dhambī faghfir lī fa-innahū lā yaghfirudh-dhunūba illā ant.",
    translation:
      "O Allah, You are my Lord; there is none worthy of worship but You. You created me and I am Your slave. I abide by Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge before You Your blessing upon me, and I confess my sins to You, so forgive me, for none forgives sins except You.",
    targetCount: 1,
    reference: "Sahih al-Bukhari (6306)",
    fadilah:
      "Whoever recites it with conviction in the evening and dies that night, or in the morning and dies that day, enters Paradise.",
  },
  {
    id: "morning-bismillah",
    category: "Morning & Evening",
    title: "Shield Against All Harm",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration:
      "Bismillāhil-ladhī lā yaḍurru ma'as-mihī shay'un fil-arḍi wa lā fis-samā'i wa huwas-samī'ul-'alīm.",
    translation:
      "In the name of Allah, with whose name nothing on earth or in the sky can cause harm, and He is the All-Hearing, the All-Knowing.",
    targetCount: 3,
    reference: "Abu Dawud (5088), at-Tirmidhi (3388) · Hasan Sahih",
    fadilah: "Recited three times morning and evening: no harm shall touch the believer.",
  },
  {
    id: "morning-raditu",
    category: "Morning & Evening",
    title: "Affirmation of Faith",
    arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    transliteration:
      "Raḍītu billāhi Rabban, wa bil-Islāmi dīnan, wa bi-Muḥammadin ṣallallāhu 'alayhi wa sallama Nabiyyā.",
    translation:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (ﷺ) as my Prophet.",
    targetCount: 3,
    reference: "Abu Dawud (5072), at-Tirmidhi (3389) · Sahih",
    fadilah: "It is an obligation upon Allah to please the reciter on the Day of Resurrection.",
  },

  // --- DISTRESS & FORGIVENESS ---
  {
    id: "yunus-distress",
    category: "Distress & Forgiveness",
    title: "Dua of Prophet Yunus (In Any Hardship)",
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn.",
    translation:
      "There is no deity except You; exalted are You! Indeed, I have been among the wrongdoers.",
    targetCount: 1,
    reference: "Surah Al-Anbiya 21:87 · Jami` at-Tirmidhi (3505) Sahih",
    fadilah:
      "The Prophet (ﷺ) said: 'No Muslim supplication is made with this in any distress except that Allah answers him.'",
  },
  {
    id: "anxiety-hamm",
    category: "Distress & Forgiveness",
    title: "Against Anxiety and Heavy Sorrow",
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    transliteration:
      "Allāhumma innī a'ūdhu bika minal-hammi wal-ḥazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa ḍala'id-dayni wa ghalabatir-rijāl.",
    translation:
      "O Allah, I seek refuge in You from grief and sorrow, from incapacity and laziness, from miserliness and cowardice, from being heavily indebted and from the overpowerment of men.",
    targetCount: 1,
    reference: "Sahih al-Bukhari (6363)",
    fadilah: "Dispels the cloud of depression, paralysis, debt, and societal oppression.",
  },

  // --- SLEEP & AWAKENING ---
  {
    id: "sleep-bismika",
    category: "Sleep & Awakening",
    title: "Before Sleeping",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismikallāhumma amūtu wa aḥyā.",
    translation: "In Your name, O Allah, I die and I live.",
    targetCount: 1,
    reference: "Sahih al-Bukhari (6324)",
    fadilah: "Dedicates sleep as an act of worship and surrenders the soul into Allah's hand.",
  },
  {
    id: "waking-up",
    category: "Sleep & Awakening",
    title: "Upon Waking Up",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alḥamdulillāhil-ladhī aḥyānā ba'da mā amātanā wa ilayhin-nushūr.",
    translation:
      "All praise is for Allah who restored us to life after causing us to die, and unto Him is the resurrection.",
    targetCount: 1,
    reference: "Sahih al-Bukhari (6312)",
    fadilah: "Begins the new day with active gratitude for the gift of life and consciousness.",
  },

  // --- DAILY LIFE ---
  {
    id: "travel-dua",
    category: "Daily Life",
    title: "When Embarking on Travel",
    arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
    transliteration:
      "Subḥānal-ladhī sakh-khara lanā hādhā wa mā kunnā lahū muqrinīn, wa innā ilā Rabbinā la-munqalibūn.",
    translation:
      "Glory to Him who has subjected this to us, and we could never have achieved it by ourselves, and indeed to our Lord we will return.",
    targetCount: 1,
    reference: "Sahih Muslim (1342)",
    fadilah: "Puts the vehicle, flight, or conveyance under divine guardianship during travel.",
  },
  {
    id: "eating-bismillah",
    category: "Daily Life",
    title: "Before Eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillāh.",
    translation: "In the name of Allah.",
    targetCount: 1,
    reference: "Sahih al-Bukhari (5376), Sahih Muslim (2017)",
    fadilah: "Prevents Shaytan from sharing in the nourishment and invites Barakah (blessing).",
  },
];
