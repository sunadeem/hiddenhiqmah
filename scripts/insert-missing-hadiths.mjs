import fs from "fs";
import path from "path";

// Missing hadiths fetched from sunnah.com
const MISSING_HADITHS = [
  {
    collection: "bukhari",
    bookId: 25,
    hadith: {
      id: 1623,
      arabic: "حَدَّثَنَا قُتَيْبَةُ بْنُ سَعِيدٍ، حَدَّثَنَا سُفْيَانُ، عَنْ عَمْرٍو، سَأَلْنَا ابْنَ عُمَرَ ـ رضى الله عنهما ـ أَيَقَعُ الرَّجُلُ عَلَى امْرَأَتِهِ فِي الْعُمْرَةِ قَبْلَ أَنْ يَطُوفَ بَيْنَ الصَّفَا وَالْمَرْوَةِ قَالَ قَدِمَ رَسُولُ اللَّهِ صلى الله عليه وسلم فَطَافَ بِالْبَيْتِ سَبْعًا، ثُمَّ صَلَّى خَلْفَ الْمَقَامِ رَكْعَتَيْنِ، وَطَافَ بَيْنَ الصَّفَا وَالْمَرْوَةِ، وَقَالَ لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ قَالَ وَسَأَلْتُ جَابِرَ بْنَ عَبْدِ اللَّهِ ـ رضى الله عنهما ـ فَقَالَ لاَ يَقْرَبِ امْرَأَتَهُ حَتَّى يَطُوفَ بَيْنَ الصَّفَا وَالْمَرْوَةِ",
      english: "We asked Ibn `Umar: 'May a man have sexual relations with his wife during the Umra before performing Tawaf between Safa and Marwa?' He said, 'Allah's Messenger (ﷺ) arrived (in Mecca) and circumambulated the Ka`ba seven times, then offered two rak`at behind Maqam Ibrahim (the station of Abraham), then performed Tawaf between Safa and Marwa.' Ibn `Umar added, 'Verily! In Allah's Apostle you have a good example.' And I asked Jabir bin `Abdullah (the same question), and he replied, 'You should not go near your wives (have sexual relations) till you have finished Tawaf between Safa and Marwa.'",
      reference: "25:108",
    },
  },
  {
    collection: "bukhari",
    bookId: 30,
    hadith: {
      id: 1991,
      arabic: "حَدَّثَنَا عَبْدُ اللَّهِ بْنُ يُوسُفَ، أَخْبَرَنَا مَالِكٌ، عَنْ أَبِي الزِّنَادِ، عَنِ الأَعْرَجِ، عَنْ أَبِي هُرَيْرَةَ ـ رضى الله عنه ـ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم نَهَى عَنْ صَوْمِ يَوْمِ الْفِطْرِ وَالنَّحْرِ، وَعَنِ الصَّمَّاءِ، وَأَنْ يَحْتَبِيَ الرَّجُلُ فِي ثَوْبٍ وَاحِدٍ‏.‏ وَعَنْ صَلاَةٍ، بَعْدَ الصُّبْحِ وَالْعَصْرِ‏.‏",
      english: "The Prophet (ﷺ) forbade the fasting of 'Id-ul-Fitr and 'Id-ul-Adha (two feast days) and also the wearing of As-Samma' (a single garment covering the whole body), and sitting with one's leg drawn up while being wrapped in one garment. He also forbade the prayers after the Fajr (morning) and the 'Asr (afternoon) prayers.",
      reference: "30:98",
    },
  },
  {
    collection: "bukhari",
    bookId: 54,
    hadith: {
      id: 2731,
      arabic: "حَدَّثَنِي عَبْدُ اللَّهِ بْنُ مُحَمَّدٍ، حَدَّثَنَا عَبْدُ الرَّزَّاقِ، أَخْبَرَنَا مَعْمَرٌ، قَالَ أَخْبَرَنِي الزُّهْرِيُّ، قَالَ أَخْبَرَنِي عُرْوَةُ بْنُ الزُّبَيْرِ، عَنِ الْمِسْوَرِ بْنِ مَخْرَمَةَ، وَمَرْوَانَ، يُصَدِّقُ كُلُّ وَاحِدٍ مِنْهُمَا حَدِيثَ صَاحِبِهِ قَالَ خَرَجَ رَسُولُ اللَّهِ صلى الله عليه وسلم زَمَنَ الْحُدَيْبِيَةِ، حَتَّى كَانُوا بِبَعْضِ الطَّرِيقِ قَالَ النَّبِيُّ صلى الله عليه وسلم ‏إِنَّ خَالِدَ بْنَ الْوَلِيدِ بِالْغَمِيمِ فِي خَيْلٍ لِقُرَيْشٍ طَلِيعَةً فَخُذُوا ذَاتَ الْيَمِينِ‏ فَوَاللَّهِ مَا شَعَرَ بِهِمْ خَالِدٌ حَتَّى إِذَا هُمْ بِقَتَرَةِ الْجَيْشِ، فَانْطَلَقَ يَرْكُضُ نَذِيرًا لِقُرَيْشٍ، وَسَارَ النَّبِيُّ صلى الله عليه وسلم حَتَّى إِذَا كَانَ بِالثَّنِيَّةِ الَّتِي يُهْبَطُ عَلَيْهِمْ مِنْهَا، بَرَكَتْ بِهِ رَاحِلَتُهُ‏ فَقَالَ النَّاسُ حَلْ حَلْ‏ فَأَلَحَّتْ، فَقَالُوا خَلأَتِ الْقَصْوَاءُ، خَلأَتِ الْقَصْوَاءُ‏ فَقَالَ النَّبِيُّ صلى الله عليه وسلم ‏مَا خَلأَتِ الْقَصْوَاءُ، وَمَا ذَاكَ لَهَا بِخُلُقٍ، وَلَكِنْ حَبَسَهَا حَابِسُ الْفِيلِ‏ ثُمَّ قَالَ ‏وَالَّذِي نَفْسِي بِيَدِهِ لاَ يَسْأَلُونِي خُطَّةً يُعَظِّمُونَ فِيهَا حُرُمَاتِ اللَّهِ إِلاَّ أَعْطَيْتُهُمْ إِيَّاهَا‏ ثُمَّ زَجَرَهَا فَوَثَبَتْ",
      english: "Narrated Al-Miswar bin Makhrama and Marwan: Allah's Messenger (ﷺ) set out at the time of Al-Hudaibiya (treaty), and when they proceeded for a distance, he said, 'Khalid bin Al-Walid leading the cavalry of Quraish constituting the front of the army, is at a place called Al-Ghamim, so take the way on the right.' By Allah, Khalid did not perceive the arrival of the Muslims till the dust arising from the march of the Muslim army reached him, and then he turned back hurriedly to inform Quraish. The Prophet (ﷺ) went on advancing till he reached the Thaniya (i.e. a mountainous way) through which one would go to them (i.e. people of Quraish). The she-camel of the Prophet (ﷺ) sat down. The people tried their best to cause the she-camel to get up but in vain, so they said, 'Al-Qaswa' has become stubborn!' The Prophet (ﷺ) said, 'Al-Qaswa' has not become stubborn, for stubbornness is not her habit, but she was stopped by Him Who stopped the elephant.' Then he said, 'By the Name of Him in Whose Hands my soul is, if they ask me anything which will respect the ordinances of Allah, I will grant it to them.' The Prophet (ﷺ) then rebuked the she-camel and she got up.",
      reference: "54:19",
    },
  },
  {
    collection: "bukhari",
    bookId: 56,
    hadith: {
      id: 3035,
      arabic: "حَدَّثَنِي مُحَمَّدُ بْنُ عَبْدِ اللَّهِ بْنِ نُمَيْرٍ، حَدَّثَنَا ابْنُ إِدْرِيسَ، عَنْ إِسْمَاعِيلَ، عَنْ قَيْسٍ، عَنْ جَرِيرٍ ـ رضى الله عنه ـ قَالَ مَا حَجَبَنِي النَّبِيُّ صلى الله عليه وسلم مُنْذُ أَسْلَمْتُ، وَلاَ رَآنِي إِلاَّ تَبَسَّمَ فِي وَجْهِي‏.‏ وَلَقَدْ شَكَوْتُ إِلَيْهِ إِنِّي لاَ أَثْبُتُ عَلَى الْخَيْلِ‏.‏ فَضَرَبَ بِيَدِهِ فِي صَدْرِي وَقَالَ ‏اللَّهُمَّ ثَبِّتْهُ وَاجْعَلْهُ هَادِيًا مَهْدِيًّا‏",
      english: "Narrated Jarir: Allah's Messenger (ﷺ) did not screen himself from me since my embracing Islam, and whenever he saw me he would receive me with a smile. Once I told him that I could not sit firm on horses. He struck me on the chest with his hand and said, 'O Allah! Make him firm and make him a guiding and a rightly guided man.'",
      reference: "56:242",
    },
  },
  {
    collection: "bukhari",
    bookId: 64,
    hadith: {
      id: 4043,
      arabic: "حَدَّثَنَا عُبَيْدُ اللَّهِ بْنُ مُوسَى، عَنْ إِسْرَائِيلَ، عَنْ أَبِي إِسْحَاقَ، عَنِ الْبَرَاءِ ـ رضى الله عنه ـ قَالَ لَقِينَا الْمُشْرِكِينَ يَوْمَئِذٍ، وَأَجْلَسَ النَّبِيُّ صلى الله عليه وسلم جَيْشًا مِنَ الرُّمَاةِ، وَأَمَّرَ عَلَيْهِمْ عَبْدَ اللَّهِ وَقَالَ ‏لاَ تَبْرَحُوا، إِنْ رَأَيْتُمُونَا ظَهَرْنَا عَلَيْهِمْ فَلاَ تَبْرَحُوا وَإِنْ رَأَيْتُمُوهُمْ ظَهَرُوا عَلَيْنَا فَلاَ تُعِينُونَا‏",
      english: "Narrated Al-Bara: We faced the pagans on that day (of the battle of Uhud) and the Prophet (ﷺ) placed a batch of archers (at a special place) and appointed Abdullah (bin Jubair) as their commander and said, 'Do not leave this place; if you should see us conquering the enemy, do not leave this place, and if you should see them conquering us, do not (come to) help us.'",
      reference: "64:90",
    },
  },
  {
    collection: "bukhari",
    bookId: 65,
    hadith: {
      id: 4879,
      arabic: "إِنَّ فِي الْجَنَّةِ خَيْمَةً مِنْ لُؤْلُؤَةٍ مُجَوَّفَةٍ، عَرْضُهَا سِتُّونَ مِيلاً، فِي كُلِّ زَاوِيَةٍ مِنْهَا أَهْلٌ، مَا يَرَوْنَ الآخَرِينَ يَطُوفُ عَلَيْهِمُ الْمُؤْمِنُونَ وَجَنَّتَانِ مِنْ فِضَّةٍ، آنِيَتُهُمَا وَمَا فِيهِمَا، وَجَنَّتَانِ مِنْ كَذَا آنِيَتُهُمَا، وَمَا فِيهِمَا، وَمَا بَيْنَ الْقَوْمِ وَبَيْنَ أَنْ يَنْظُرُوا إِلَى رَبِّهِمْ إِلاَّ رِدَاءُ الْكِبْرِ عَلَى وَجْهِهِ فِي جَنَّةِ عَدْنٍ",
      english: "In Paradise there is a pavilion made of a single hollow pearl sixty miles wide, in each corner of which there are wives who will not see those in the other corners; and the believers will visit and enjoy them. And there are two gardens, the utensils and contents of which are made of silver; and two other gardens, the utensils and contents of which are made of so-and-so (i.e. gold) and nothing will prevent the people staying in the Garden of Eden from seeing their Lord except the curtain of Majesty over His Face.",
      reference: "65:400",
    },
  },
  {
    collection: "bukhari",
    bookId: 75,
    hadith: {
      id: 5641,
      arabic: "حَدَّثَنَا أَبُو الْيَمَانِ الْحَكَمُ بْنُ نَافِعٍ، أَخْبَرَنَا شُعَيْبٌ، عَنِ الزُّهْرِيِّ، قَالَ أَخْبَرَنِي عُرْوَةُ بْنُ الزُّبَيْرِ، أَنَّ عَائِشَةَ ـ رضى الله عنها ـ زَوْجَ النَّبِيِّ صلى الله عليه وسلم قَالَتْ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم ‏مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلاَ وَصَبٍ وَلاَ هَمٍّ وَلاَ حُزْنٍ وَلاَ أَذًى وَلاَ غَمٍّ حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلاَّ كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ‏",
      english: "No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, but that Allah expiates some of his sins for that.",
      reference: "75:2",
    },
  },
  {
    collection: "muslim",
    bookId: 15,
    hadith: {
      id: 1350,
      arabic: "حَدَّثَنَا يَحْيَى بْنُ يَحْيَى، قَالَ قَرَأْتُ عَلَى مَالِكٍ، عَنْ نَافِعٍ، عَنِ ابْنِ عُمَرَ، أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ ‏مَنْ أَتَى هَذَا الْبَيْتَ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَمَا وَلَدَتْهُ أُمُّهُ‏",
      english: "He who came to this House (Ka'ba) (with the intention of performing Pilgrimage), and neither spoke indecently nor did he act wickedly, would return (free from sin) as on the (very first day) his mother bore him.",
      reference: "15:495",
    },
  },
];

for (const entry of MISSING_HADITHS) {
  const bookPath = path.join("src/data/hadith", entry.collection, `${entry.bookId}.json`);

  if (!fs.existsSync(bookPath)) {
    console.log(`SKIP: ${bookPath} not found`);
    continue;
  }

  const hadiths = JSON.parse(fs.readFileSync(bookPath, "utf-8"));

  // Check if already exists
  if (hadiths.find(h => h.id === entry.hadith.id)) {
    console.log(`SKIP: ${entry.collection} ${entry.hadith.id} already exists`);
    continue;
  }

  // Insert in sorted position
  hadiths.push(entry.hadith);
  hadiths.sort((a, b) => a.id - b.id);

  fs.writeFileSync(bookPath, JSON.stringify(hadiths));
  console.log(`ADDED: ${entry.collection} ${entry.hadith.id} → book ${entry.bookId} (ref ${entry.hadith.reference})`);

  // Update metadata
  const metaPath = path.join("src/data/hadith", entry.collection, "metadata.json");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

  const bookMeta = meta.books.find(b => b.id === entry.bookId);
  if (bookMeta) {
    bookMeta.count = hadiths.length;
    bookMeta.startHadith = hadiths[0].id;
    bookMeta.endHadith = hadiths[hadiths.length - 1].id;
    meta.totalHadiths = meta.books.reduce((sum, b) => sum + b.count, 0);
    fs.writeFileSync(metaPath, JSON.stringify(meta));
    console.log(`  Updated metadata: book ${entry.bookId} now has ${bookMeta.count} hadiths`);
  }
}

console.log("\nDone! Now re-run convert-hadith-refs.mjs to convert the new entries.");
