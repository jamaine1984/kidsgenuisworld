import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Languages, Star, Volume2, Heart } from 'lucide-react';
import { LanguageWord } from '../types';
import { speakAsync, speakCorrect, speakWrong, playSuccess, playWrongBuzzer } from '../services/audioService';
import { pickDailyItem, shuffleDailyItems } from '../services/dailyRotation';
import { EarlySpeechLesson } from './language/EarlySpeechLesson';

interface LanguageRoomProps {
  level: number;
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  onAttempt?: (meta: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }, correct: boolean) => void;
}

// Grade-paced language vocabulary. Translations are romanized/ASCII so cached narration and UI labels stay stable.
export const VOCABULARY: { [key: string]: LanguageWord[] } = {
  spanish: [
    { gradeLevel: 1, english: 'Hello', translation: 'Hola', pronunciation: 'OH-lah', language: 'spanish', category: 'greetings' },
    { gradeLevel: 1, english: 'Goodbye', translation: 'Adios', pronunciation: 'ah-dee-OHS', language: 'spanish', category: 'greetings' },
    { gradeLevel: 1, english: 'Please', translation: 'Por favor', pronunciation: 'por fah-VOR', language: 'spanish', category: 'greetings' },
    { gradeLevel: 1, english: 'Thank you', translation: 'Gracias', pronunciation: 'GRAH-see-ahs', language: 'spanish', category: 'greetings' },
    { gradeLevel: 2, english: 'One', translation: 'Uno', pronunciation: 'OO-noh', language: 'spanish', category: 'numbers' },
    { gradeLevel: 2, english: 'Two', translation: 'Dos', pronunciation: 'dohs', language: 'spanish', category: 'numbers' },
    { gradeLevel: 2, english: 'Three', translation: 'Tres', pronunciation: 'trehs', language: 'spanish', category: 'numbers' },
    { gradeLevel: 2, english: 'Red', translation: 'Rojo', pronunciation: 'ROH-hoh', language: 'spanish', category: 'colors' },
    { gradeLevel: 3, english: 'Blue', translation: 'Azul', pronunciation: 'ah-SOOL', language: 'spanish', category: 'colors' },
    { gradeLevel: 3, english: 'Green', translation: 'Verde', pronunciation: 'BEHR-deh', language: 'spanish', category: 'colors' },
    { gradeLevel: 3, english: 'Dog', translation: 'Perro', pronunciation: 'PEH-rroh', language: 'spanish', category: 'animals' },
    { gradeLevel: 3, english: 'Cat', translation: 'Gato', pronunciation: 'GAH-toh', language: 'spanish', category: 'animals' },
    { gradeLevel: 4, english: 'Apple', translation: 'Manzana', pronunciation: 'mahn-SAH-nah', language: 'spanish', category: 'food' },
    { gradeLevel: 4, english: 'Water', translation: 'Agua', pronunciation: 'AH-gwah', language: 'spanish', category: 'food' },
    { gradeLevel: 4, english: 'School', translation: 'Escuela', pronunciation: 'ehs-KWEH-lah', language: 'spanish', category: 'school' },
    { gradeLevel: 4, english: 'Book', translation: 'Libro', pronunciation: 'LEE-broh', language: 'spanish', category: 'school' },
    { gradeLevel: 5, english: 'Mom', translation: 'Mama', pronunciation: 'mah-MAH', language: 'spanish', category: 'family' },
    { gradeLevel: 5, english: 'Dad', translation: 'Papa', pronunciation: 'pah-PAH', language: 'spanish', category: 'family' },
    { gradeLevel: 5, english: 'Friend', translation: 'Amigo', pronunciation: 'ah-MEE-goh', language: 'spanish', category: 'family' },
    { gradeLevel: 5, english: 'Park', translation: 'Parque', pronunciation: 'PAR-keh', language: 'spanish', category: 'places' },
    { gradeLevel: 6, english: 'Where is it?', translation: 'Donde esta?', pronunciation: 'DOHN-deh ehs-TAH', language: 'spanish', category: 'phrases' },
    { gradeLevel: 6, english: 'I like it', translation: 'Me gusta', pronunciation: 'meh GOOS-tah', language: 'spanish', category: 'phrases' },
    { gradeLevel: 7, english: 'I need help', translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah', language: 'spanish', category: 'phrases' },
    { gradeLevel: 7, english: 'See you tomorrow', translation: 'Hasta manana', pronunciation: 'AHS-tah mahn-YAH-nah', language: 'spanish', category: 'phrases' },
  ],
  french: [
    { gradeLevel: 1, english: 'Hello', translation: 'Bonjour', pronunciation: 'bon-ZHOOR', language: 'french', category: 'greetings' },
    { gradeLevel: 1, english: 'Goodbye', translation: 'Au revoir', pronunciation: 'oh reh-VWAHR', language: 'french', category: 'greetings' },
    { gradeLevel: 1, english: 'Please', translation: "S'il vous plait", pronunciation: 'seel voo PLEH', language: 'french', category: 'greetings' },
    { gradeLevel: 1, english: 'Thank you', translation: 'Merci', pronunciation: 'mehr-SEE', language: 'french', category: 'greetings' },
    { gradeLevel: 2, english: 'One', translation: 'Un', pronunciation: 'uhn', language: 'french', category: 'numbers' },
    { gradeLevel: 2, english: 'Two', translation: 'Deux', pronunciation: 'duh', language: 'french', category: 'numbers' },
    { gradeLevel: 2, english: 'Three', translation: 'Trois', pronunciation: 'trwah', language: 'french', category: 'numbers' },
    { gradeLevel: 2, english: 'Red', translation: 'Rouge', pronunciation: 'roozh', language: 'french', category: 'colors' },
    { gradeLevel: 3, english: 'Blue', translation: 'Bleu', pronunciation: 'bluh', language: 'french', category: 'colors' },
    { gradeLevel: 3, english: 'Green', translation: 'Vert', pronunciation: 'vehr', language: 'french', category: 'colors' },
    { gradeLevel: 3, english: 'Dog', translation: 'Chien', pronunciation: 'shee-EN', language: 'french', category: 'animals' },
    { gradeLevel: 3, english: 'Cat', translation: 'Chat', pronunciation: 'shah', language: 'french', category: 'animals' },
    { gradeLevel: 4, english: 'Apple', translation: 'Pomme', pronunciation: 'puhm', language: 'french', category: 'food' },
    { gradeLevel: 4, english: 'Water', translation: 'Eau', pronunciation: 'oh', language: 'french', category: 'food' },
    { gradeLevel: 4, english: 'School', translation: 'Ecole', pronunciation: 'ay-KOHL', language: 'french', category: 'school' },
    { gradeLevel: 4, english: 'Book', translation: 'Livre', pronunciation: 'leev-ruh', language: 'french', category: 'school' },
    { gradeLevel: 5, english: 'Mom', translation: 'Maman', pronunciation: 'mah-MAHN', language: 'french', category: 'family' },
    { gradeLevel: 5, english: 'Dad', translation: 'Papa', pronunciation: 'pah-PAH', language: 'french', category: 'family' },
    { gradeLevel: 5, english: 'Friend', translation: 'Ami', pronunciation: 'ah-MEE', language: 'french', category: 'family' },
    { gradeLevel: 5, english: 'Park', translation: 'Parc', pronunciation: 'park', language: 'french', category: 'places' },
    { gradeLevel: 6, english: 'Where is it?', translation: 'Ou est-ce?', pronunciation: 'oo ess', language: 'french', category: 'phrases' },
    { gradeLevel: 6, english: 'I like it', translation: "J'aime ca", pronunciation: 'zhem sah', language: 'french', category: 'phrases' },
    { gradeLevel: 7, english: 'I need help', translation: "J'ai besoin d'aide", pronunciation: 'zhay buh-ZWAN ded', language: 'french', category: 'phrases' },
    { gradeLevel: 7, english: 'See you tomorrow', translation: 'A demain', pronunciation: 'ah duh-MAN', language: 'french', category: 'phrases' },
  ],
  mandarin: [
    { gradeLevel: 1, english: 'Hello', translation: 'Ni hao', pronunciation: 'nee-HOW', language: 'mandarin', category: 'greetings' },
    { gradeLevel: 1, english: 'Goodbye', translation: 'Zai jian', pronunciation: 'zai-jyen', language: 'mandarin', category: 'greetings' },
    { gradeLevel: 1, english: 'Please', translation: 'Qing', pronunciation: 'ching', language: 'mandarin', category: 'greetings' },
    { gradeLevel: 1, english: 'Thank you', translation: 'Xie xie', pronunciation: 'syeh-syeh', language: 'mandarin', category: 'greetings' },
    { gradeLevel: 2, english: 'One', translation: 'Yi', pronunciation: 'ee', language: 'mandarin', category: 'numbers' },
    { gradeLevel: 2, english: 'Two', translation: 'Er', pronunciation: 'ar', language: 'mandarin', category: 'numbers' },
    { gradeLevel: 2, english: 'Three', translation: 'San', pronunciation: 'sahn', language: 'mandarin', category: 'numbers' },
    { gradeLevel: 2, english: 'Red', translation: 'Hong se', pronunciation: 'hong suh', language: 'mandarin', category: 'colors' },
    { gradeLevel: 3, english: 'Blue', translation: 'Lan se', pronunciation: 'lahn suh', language: 'mandarin', category: 'colors' },
    { gradeLevel: 3, english: 'Green', translation: 'Lu se', pronunciation: 'lyoo suh', language: 'mandarin', category: 'colors' },
    { gradeLevel: 3, english: 'Dog', translation: 'Gou', pronunciation: 'go', language: 'mandarin', category: 'animals' },
    { gradeLevel: 3, english: 'Cat', translation: 'Mao', pronunciation: 'mao', language: 'mandarin', category: 'animals' },
    { gradeLevel: 4, english: 'Apple', translation: 'Ping guo', pronunciation: 'ping gwoh', language: 'mandarin', category: 'food' },
    { gradeLevel: 4, english: 'Water', translation: 'Shui', pronunciation: 'shway', language: 'mandarin', category: 'food' },
    { gradeLevel: 4, english: 'School', translation: 'Xue xiao', pronunciation: 'shweh shyow', language: 'mandarin', category: 'school' },
    { gradeLevel: 4, english: 'Book', translation: 'Shu', pronunciation: 'shoo', language: 'mandarin', category: 'school' },
    { gradeLevel: 5, english: 'Mom', translation: 'Mama', pronunciation: 'mah-mah', language: 'mandarin', category: 'family' },
    { gradeLevel: 5, english: 'Dad', translation: 'Baba', pronunciation: 'bah-bah', language: 'mandarin', category: 'family' },
    { gradeLevel: 5, english: 'Friend', translation: 'Peng you', pronunciation: 'pung yo', language: 'mandarin', category: 'family' },
    { gradeLevel: 5, english: 'Park', translation: 'Gong yuan', pronunciation: 'gong ywen', language: 'mandarin', category: 'places' },
    { gradeLevel: 6, english: 'Where is it?', translation: 'Zai na li?', pronunciation: 'zai nah lee', language: 'mandarin', category: 'phrases' },
    { gradeLevel: 6, english: 'I like it', translation: 'Wo xihuan', pronunciation: 'woh shee-hwahn', language: 'mandarin', category: 'phrases' },
    { gradeLevel: 7, english: 'I need help', translation: 'Wo xuyao bangzhu', pronunciation: 'woh shoo-yow bahng-joo', language: 'mandarin', category: 'phrases' },
    { gradeLevel: 7, english: 'See you tomorrow', translation: 'Mingtian jian', pronunciation: 'ming-tyen jyen', language: 'mandarin', category: 'phrases' },
  ],
  japanese: [
    { gradeLevel: 1, english: 'Hello', translation: 'Konnichiwa', pronunciation: 'kohn-nee-chee-wah', language: 'japanese', category: 'greetings' },
    { gradeLevel: 1, english: 'Goodbye', translation: 'Sayonara', pronunciation: 'sah-yoh-nah-rah', language: 'japanese', category: 'greetings' },
    { gradeLevel: 1, english: 'Please', translation: 'Onegai', pronunciation: 'oh-neh-gai', language: 'japanese', category: 'greetings' },
    { gradeLevel: 1, english: 'Thank you', translation: 'Arigato', pronunciation: 'ah-ree-GAH-toh', language: 'japanese', category: 'greetings' },
    { gradeLevel: 2, english: 'One', translation: 'Ichi', pronunciation: 'ee-chee', language: 'japanese', category: 'numbers' },
    { gradeLevel: 2, english: 'Two', translation: 'Ni', pronunciation: 'nee', language: 'japanese', category: 'numbers' },
    { gradeLevel: 2, english: 'Three', translation: 'San', pronunciation: 'sahn', language: 'japanese', category: 'numbers' },
    { gradeLevel: 2, english: 'Red', translation: 'Aka', pronunciation: 'ah-kah', language: 'japanese', category: 'colors' },
    { gradeLevel: 3, english: 'Blue', translation: 'Ao', pronunciation: 'ah-oh', language: 'japanese', category: 'colors' },
    { gradeLevel: 3, english: 'Green', translation: 'Midori', pronunciation: 'mee-doh-ree', language: 'japanese', category: 'colors' },
    { gradeLevel: 3, english: 'Dog', translation: 'Inu', pronunciation: 'ee-noo', language: 'japanese', category: 'animals' },
    { gradeLevel: 3, english: 'Cat', translation: 'Neko', pronunciation: 'neh-koh', language: 'japanese', category: 'animals' },
    { gradeLevel: 4, english: 'Apple', translation: 'Ringo', pronunciation: 'reen-goh', language: 'japanese', category: 'food' },
    { gradeLevel: 4, english: 'Water', translation: 'Mizu', pronunciation: 'mee-zoo', language: 'japanese', category: 'food' },
    { gradeLevel: 4, english: 'School', translation: 'Gakko', pronunciation: 'gahk-koh', language: 'japanese', category: 'school' },
    { gradeLevel: 4, english: 'Book', translation: 'Hon', pronunciation: 'hohn', language: 'japanese', category: 'school' },
    { gradeLevel: 5, english: 'Mom', translation: 'Okaasan', pronunciation: 'oh-kah-sahn', language: 'japanese', category: 'family' },
    { gradeLevel: 5, english: 'Dad', translation: 'Otoosan', pronunciation: 'oh-toh-sahn', language: 'japanese', category: 'family' },
    { gradeLevel: 5, english: 'Friend', translation: 'Tomodachi', pronunciation: 'toh-moh-dah-chee', language: 'japanese', category: 'family' },
    { gradeLevel: 5, english: 'Park', translation: 'Koen', pronunciation: 'koh-en', language: 'japanese', category: 'places' },
    { gradeLevel: 6, english: 'Where is it?', translation: 'Doko desu ka?', pronunciation: 'doh-koh dess kah', language: 'japanese', category: 'phrases' },
    { gradeLevel: 6, english: 'I like it', translation: 'Suki desu', pronunciation: 'skee dess', language: 'japanese', category: 'phrases' },
    { gradeLevel: 7, english: 'I need help', translation: 'Tasukete kudasai', pronunciation: 'tah-soo-keh-teh koo-dah-sai', language: 'japanese', category: 'phrases' },
    { gradeLevel: 7, english: 'See you tomorrow', translation: 'Mata ashita', pronunciation: 'mah-tah ah-shee-tah', language: 'japanese', category: 'phrases' },
  ],
};

const EXTRA_LANGUAGE_WORDS: { [key: string]: LanguageWord[] } = {
  spanish: [
    { gradeLevel: 2, english: 'Four', translation: 'Cuatro', pronunciation: 'KWAH-troh', language: 'spanish', category: 'numbers' },
    { gradeLevel: 2, english: 'Yellow', translation: 'Amarillo', pronunciation: 'ah-mah-REE-yoh', language: 'spanish', category: 'colors' },
    { gradeLevel: 3, english: 'Bird', translation: 'Pajaro', pronunciation: 'PAH-hah-roh', language: 'spanish', category: 'animals' },
    { gradeLevel: 4, english: 'Pencil', translation: 'Lapiz', pronunciation: 'LAH-pees', language: 'spanish', category: 'school' },
    { gradeLevel: 4, english: 'Bread', translation: 'Pan', pronunciation: 'pahn', language: 'spanish', category: 'food' },
    { gradeLevel: 5, english: 'Sister', translation: 'Hermana', pronunciation: 'ehr-MAH-nah', language: 'spanish', category: 'family' },
    { gradeLevel: 6, english: 'I am learning', translation: 'Estoy aprendiendo', pronunciation: 'eh-STOY ah-pren-DYEN-doh', language: 'spanish', category: 'phrases' },
    { gradeLevel: 7, english: 'Can you repeat?', translation: 'Puedes repetir?', pronunciation: 'PWEH-des reh-peh-TEER', language: 'spanish', category: 'phrases' },
  ],
  french: [
    { gradeLevel: 2, english: 'Four', translation: 'Quatre', pronunciation: 'katr', language: 'french', category: 'numbers' },
    { gradeLevel: 2, english: 'Yellow', translation: 'Jaune', pronunciation: 'zhohn', language: 'french', category: 'colors' },
    { gradeLevel: 3, english: 'Bird', translation: 'Oiseau', pronunciation: 'wah-ZOH', language: 'french', category: 'animals' },
    { gradeLevel: 4, english: 'Pencil', translation: 'Crayon', pronunciation: 'kray-OHN', language: 'french', category: 'school' },
    { gradeLevel: 4, english: 'Bread', translation: 'Pain', pronunciation: 'pan', language: 'french', category: 'food' },
    { gradeLevel: 5, english: 'Sister', translation: 'Soeur', pronunciation: 'sur', language: 'french', category: 'family' },
    { gradeLevel: 6, english: 'I am learning', translation: "J'apprends", pronunciation: 'zhah-PRAHN', language: 'french', category: 'phrases' },
    { gradeLevel: 7, english: 'Can you repeat?', translation: 'Pouvez-vous repeter?', pronunciation: 'poo-vay voo reh-pay-TAY', language: 'french', category: 'phrases' },
  ],
  mandarin: [
    { gradeLevel: 2, english: 'Four', translation: 'Si', pronunciation: 'suh', language: 'mandarin', category: 'numbers' },
    { gradeLevel: 2, english: 'Yellow', translation: 'Huang se', pronunciation: 'hwahng suh', language: 'mandarin', category: 'colors' },
    { gradeLevel: 3, english: 'Bird', translation: 'Niao', pronunciation: 'nyow', language: 'mandarin', category: 'animals' },
    { gradeLevel: 4, english: 'Pencil', translation: 'Qian bi', pronunciation: 'chyen bee', language: 'mandarin', category: 'school' },
    { gradeLevel: 4, english: 'Bread', translation: 'Mian bao', pronunciation: 'myen bow', language: 'mandarin', category: 'food' },
    { gradeLevel: 5, english: 'Sister', translation: 'Jiejie', pronunciation: 'jyeh-jyeh', language: 'mandarin', category: 'family' },
    { gradeLevel: 6, english: 'I am learning', translation: 'Wo zai xuexi', pronunciation: 'woh zai shweh-shee', language: 'mandarin', category: 'phrases' },
    { gradeLevel: 7, english: 'Can you repeat?', translation: 'Qing zai shuo yi bian', pronunciation: 'ching zai shwoh ee byen', language: 'mandarin', category: 'phrases' },
  ],
  japanese: [
    { gradeLevel: 2, english: 'Four', translation: 'Yon', pronunciation: 'yohn', language: 'japanese', category: 'numbers' },
    { gradeLevel: 2, english: 'Yellow', translation: 'Kiiro', pronunciation: 'kee-ee-roh', language: 'japanese', category: 'colors' },
    { gradeLevel: 3, english: 'Bird', translation: 'Tori', pronunciation: 'toh-ree', language: 'japanese', category: 'animals' },
    { gradeLevel: 4, english: 'Pencil', translation: 'Enpitsu', pronunciation: 'en-peet-soo', language: 'japanese', category: 'school' },
    { gradeLevel: 4, english: 'Bread', translation: 'Pan', pronunciation: 'pahn', language: 'japanese', category: 'food' },
    { gradeLevel: 5, english: 'Sister', translation: 'Oneesan', pronunciation: 'oh-neh-sahn', language: 'japanese', category: 'family' },
    { gradeLevel: 6, english: 'I am learning', translation: 'Benkyou shiteimasu', pronunciation: 'ben-kyoh shee-teh-ee-mahs', language: 'japanese', category: 'phrases' },
    { gradeLevel: 7, english: 'Can you repeat?', translation: 'Mou ichido onegai', pronunciation: 'moh ee-chee-doh oh-neh-gai', language: 'japanese', category: 'phrases' },
  ],
};

const LANGUAGE_EXPANSION_CONCEPTS = [
  { gradeLevel: 1, english: 'Yes', category: 'greetings' as const, spanish: ['Si', 'see'], french: ['Oui', 'wee'], mandarin: ['Shi', 'shrr'], japanese: ['Hai', 'hai'] },
  { gradeLevel: 1, english: 'No', category: 'greetings' as const, spanish: ['No', 'noh'], french: ['Non', 'nohn'], mandarin: ['Bu', 'boo'], japanese: ['Iie', 'ee-eh'] },
  { gradeLevel: 2, english: 'Five', category: 'numbers' as const, spanish: ['Cinco', 'SEEN-koh'], french: ['Cinq', 'sank'], mandarin: ['Wu', 'woo'], japanese: ['Go', 'goh'] },
  { gradeLevel: 2, english: 'Black', category: 'colors' as const, spanish: ['Negro', 'NEH-groh'], french: ['Noir', 'nwahr'], mandarin: ['Hei se', 'hay suh'], japanese: ['Kuro', 'koo-roh'] },
  { gradeLevel: 2, english: 'White', category: 'colors' as const, spanish: ['Blanco', 'BLAHN-koh'], french: ['Blanc', 'blahn'], mandarin: ['Bai se', 'bye suh'], japanese: ['Shiro', 'shee-roh'] },
  { gradeLevel: 3, english: 'Fish', category: 'animals' as const, spanish: ['Pez', 'pehs'], french: ['Poisson', 'pwah-SOHN'], mandarin: ['Yu', 'yoo'], japanese: ['Sakana', 'sah-kah-nah'] },
  { gradeLevel: 3, english: 'Horse', category: 'animals' as const, spanish: ['Caballo', 'kah-BAH-yoh'], french: ['Cheval', 'shuh-VAHL'], mandarin: ['Ma', 'mah'], japanese: ['Uma', 'oo-mah'] },
  { gradeLevel: 4, english: 'Teacher', category: 'school' as const, spanish: ['Maestra', 'my-ES-trah'], french: ['Professeur', 'proh-feh-SUR'], mandarin: ['Lao shi', 'laow shrr'], japanese: ['Sensei', 'sen-say'] },
  { gradeLevel: 4, english: 'Table', category: 'school' as const, spanish: ['Mesa', 'MEH-sah'], french: ['Table', 'tahbl'], mandarin: ['Zhuo zi', 'jwoh dzuh'], japanese: ['Tsukue', 'tsoo-koo-eh'] },
  { gradeLevel: 4, english: 'Rice', category: 'food' as const, spanish: ['Arroz', 'ah-ROHS'], french: ['Riz', 'ree'], mandarin: ['Mi fan', 'mee fahn'], japanese: ['Gohan', 'goh-hahn'] },
  { gradeLevel: 5, english: 'Brother', category: 'family' as const, spanish: ['Hermano', 'ehr-MAH-noh'], french: ['Frere', 'frair'], mandarin: ['Gege', 'guh-guh'], japanese: ['Oniisan', 'oh-nee-sahn'] },
  { gradeLevel: 5, english: 'Grandma', category: 'family' as const, spanish: ['Abuela', 'ah-BWEH-lah'], french: ['Grand-mere', 'grahn-mair'], mandarin: ['Nainai', 'nye-nye'], japanese: ['Obaasan', 'oh-bah-sahn'] },
  { gradeLevel: 5, english: 'Library', category: 'places' as const, spanish: ['Biblioteca', 'bee-blee-oh-TEH-kah'], french: ['Bibliotheque', 'bee-blee-oh-TEK'], mandarin: ['Tu shu guan', 'too shoo gwahn'], japanese: ['Toshokan', 'toh-shoh-kahn'] },
  { gradeLevel: 5, english: 'Store', category: 'places' as const, spanish: ['Tienda', 'TYEN-dah'], french: ['Magasin', 'mah-gah-ZAN'], mandarin: ['Shang dian', 'shahng dyen'], japanese: ['Mise', 'mee-seh'] },
  { gradeLevel: 6, english: 'How are you?', category: 'phrases' as const, spanish: ['Como estas?', 'KOH-moh ehs-TAHS'], french: ['Comment ca va?', 'koh-mahn sah vah'], mandarin: ['Ni hao ma?', 'nee how mah'], japanese: ['Genki desu ka?', 'gen-kee dess kah'] },
  { gradeLevel: 6, english: 'I understand', category: 'phrases' as const, spanish: ['Entiendo', 'en-TYEN-doh'], french: ['Je comprends', 'zhuh kohm-PRAHN'], mandarin: ['Wo ming bai', 'woh ming bye'], japanese: ['Wakarimasu', 'wah-kah-ree-mahs'] },
  { gradeLevel: 6, english: 'I do not understand', category: 'phrases' as const, spanish: ['No entiendo', 'noh en-TYEN-doh'], french: ['Je ne comprends pas', 'zhuh nuh kohm-PRAHN pah'], mandarin: ['Wo bu ming bai', 'woh boo ming bye'], japanese: ['Wakarimasen', 'wah-kah-ree-mah-sen'] },
  { gradeLevel: 7, english: 'What is your name?', category: 'phrases' as const, spanish: ['Como te llamas?', 'KOH-moh teh YAH-mahs'], french: ['Comment tu tappelles?', 'koh-mahn too tah-pel'], mandarin: ['Ni jiao shenme?', 'nee jyow shen-muh'], japanese: ['Onamae wa?', 'oh-nah-my wah'] },
  { gradeLevel: 7, english: 'My name is...', category: 'phrases' as const, spanish: ['Me llamo...', 'meh YAH-moh'], french: ['Je mappelle...', 'zhuh mah-pel'], mandarin: ['Wo jiao...', 'woh jyow'], japanese: ['Watashi wa...', 'wah-tah-shee wah'] },
  { gradeLevel: 7, english: 'Nice to meet you', category: 'phrases' as const, spanish: ['Mucho gusto', 'MOO-choh GOOS-toh'], french: ['Enchante', 'ahn-shahn-TAY'], mandarin: ['Hen gao xing', 'hun gow shing'], japanese: ['Hajimemashite', 'hah-jee-meh-mah-shee-teh'] },
  { gradeLevel: 1, english: 'Good morning', category: 'greetings' as const, spanish: ['Buenos dias', 'BWEH-nohs DEE-ahs'], french: ['Bonjour', 'bon-ZHOOR'], mandarin: ['Zao shang hao', 'dzow shahng how'], japanese: ['Ohayo', 'oh-hah-yoh'] },
  { gradeLevel: 1, english: 'Good night', category: 'greetings' as const, spanish: ['Buenas noches', 'BWEH-nahs NOH-chehs'], french: ['Bonne nuit', 'bun nwee'], mandarin: ['Wan an', 'wahn ahn'], japanese: ['Oyasumi', 'oh-yah-soo-mee'] },
  { gradeLevel: 1, english: 'Excuse me', category: 'greetings' as const, spanish: ['Perdon', 'pehr-DOHN'], french: ['Pardon', 'par-DOHN'], mandarin: ['Qing wen', 'ching wun'], japanese: ['Sumimasen', 'soo-mee-mah-sen'] },
  { gradeLevel: 1, english: 'Sorry', category: 'greetings' as const, spanish: ['Lo siento', 'loh SYEN-toh'], french: ['Desole', 'day-zoh-LAY'], mandarin: ['Dui bu qi', 'dway boo chee'], japanese: ['Gomen nasai', 'goh-men nah-sai'] },
  { gradeLevel: 1, english: 'Welcome', category: 'greetings' as const, spanish: ['Bienvenido', 'byen-veh-NEE-doh'], french: ['Bienvenue', 'byen-veh-NOO'], mandarin: ['Huan ying', 'hwahn ying'], japanese: ['Yokoso', 'yoh-koh-soh'] },
  { gradeLevel: 1, english: 'Maybe', category: 'greetings' as const, spanish: ['Quizas', 'kee-SAHS'], french: ['Peut-etre', 'puh-tetr'], mandarin: ['Ye xu', 'yeh shoo'], japanese: ['Tabun', 'tah-boon'] },
  { gradeLevel: 1, english: 'Today', category: 'phrases' as const, spanish: ['Hoy', 'oy'], french: ["Aujourd'hui", 'oh-zhoor-DWEE'], mandarin: ['Jin tian', 'jin tyen'], japanese: ['Kyo', 'kyoh'] },
  { gradeLevel: 1, english: 'Tomorrow', category: 'phrases' as const, spanish: ['Manana', 'mahn-YAH-nah'], french: ['Demain', 'duh-MAN'], mandarin: ['Ming tian', 'ming tyen'], japanese: ['Ashita', 'ah-shee-tah'] },
  { gradeLevel: 1, english: 'Yesterday', category: 'phrases' as const, spanish: ['Ayer', 'ah-YEHR'], french: ['Hier', 'yehr'], mandarin: ['Zuo tian', 'dzwoh tyen'], japanese: ['Kino', 'kee-noh'] },
  { gradeLevel: 1, english: 'Morning', category: 'phrases' as const, spanish: ['Manana', 'mah-NYAH-nah'], french: ['Matin', 'mah-TAN'], mandarin: ['Zao shang', 'dzow shahng'], japanese: ['Asa', 'ah-sah'] },
  { gradeLevel: 1, english: 'Night', category: 'phrases' as const, spanish: ['Noche', 'NOH-cheh'], french: ['Nuit', 'nwee'], mandarin: ['Ye wan', 'yeh wahn'], japanese: ['Yoru', 'yoh-roo'] },
  { gradeLevel: 1, english: 'Happy', category: 'phrases' as const, spanish: ['Feliz', 'feh-LEES'], french: ['Heureux', 'uh-ruh'], mandarin: ['Gao xing', 'gow shing'], japanese: ['Ureshii', 'oo-reh-shee'] },
  { gradeLevel: 1, english: 'Sad', category: 'phrases' as const, spanish: ['Triste', 'TREES-teh'], french: ['Triste', 'treest'], mandarin: ['Nan guo', 'nahn gwoh'], japanese: ['Kanashii', 'kah-nah-shee'] },
  { gradeLevel: 1, english: 'Tired', category: 'phrases' as const, spanish: ['Cansado', 'kahn-SAH-doh'], french: ['Fatigue', 'fah-tee-GAY'], mandarin: ['Lei', 'lay'], japanese: ['Tsukareta', 'tsoo-kah-reh-tah'] },
  { gradeLevel: 1, english: 'Ready', category: 'phrases' as const, spanish: ['Listo', 'LEES-toh'], french: ['Pret', 'preh'], mandarin: ['Zhun bei hao', 'jwoon bay how'], japanese: ['Junbi dekita', 'joon-bee deh-kee-tah'] },
  { gradeLevel: 2, english: 'Six', category: 'numbers' as const, spanish: ['Seis', 'says'], french: ['Six', 'sees'], mandarin: ['Liu', 'lyoh'], japanese: ['Roku', 'roh-koo'] },
  { gradeLevel: 2, english: 'Seven', category: 'numbers' as const, spanish: ['Siete', 'SYEH-teh'], french: ['Sept', 'set'], mandarin: ['Qi', 'chee'], japanese: ['Nana', 'nah-nah'] },
  { gradeLevel: 2, english: 'Eight', category: 'numbers' as const, spanish: ['Ocho', 'OH-choh'], french: ['Huit', 'weet'], mandarin: ['Ba', 'bah'], japanese: ['Hachi', 'hah-chee'] },
  { gradeLevel: 2, english: 'Nine', category: 'numbers' as const, spanish: ['Nueve', 'NWEH-veh'], french: ['Neuf', 'nuhf'], mandarin: ['Jiu', 'jyoh'], japanese: ['Kyu', 'kyoo'] },
  { gradeLevel: 2, english: 'Ten', category: 'numbers' as const, spanish: ['Diez', 'dyehs'], french: ['Dix', 'dees'], mandarin: ['Shi', 'shrr'], japanese: ['Ju', 'joo'] },
  { gradeLevel: 2, english: 'Eleven', category: 'numbers' as const, spanish: ['Once', 'OHN-seh'], french: ['Onze', 'ohnz'], mandarin: ['Shi yi', 'shrr ee'], japanese: ['Ju ichi', 'joo ee-chee'] },
  { gradeLevel: 2, english: 'Twelve', category: 'numbers' as const, spanish: ['Doce', 'DOH-seh'], french: ['Douze', 'dooz'], mandarin: ['Shi er', 'shrr ar'], japanese: ['Ju ni', 'joo nee'] },
  { gradeLevel: 2, english: 'Orange', category: 'colors' as const, spanish: ['Naranja', 'nah-RAHN-hah'], french: ['Orange', 'oh-RAHNZH'], mandarin: ['Cheng se', 'chung suh'], japanese: ['Orenji', 'oh-ren-jee'] },
  { gradeLevel: 2, english: 'Purple', category: 'colors' as const, spanish: ['Morado', 'moh-RAH-doh'], french: ['Violet', 'vee-oh-LEH'], mandarin: ['Zi se', 'dzuh suh'], japanese: ['Murasaki', 'moo-rah-sah-kee'] },
  { gradeLevel: 2, english: 'Pink', category: 'colors' as const, spanish: ['Rosado', 'roh-SAH-doh'], french: ['Rose', 'rohz'], mandarin: ['Fen hong se', 'fun hong suh'], japanese: ['Pinku', 'peen-koo'] },
  { gradeLevel: 2, english: 'Brown', category: 'colors' as const, spanish: ['Marron', 'mah-RROHN'], french: ['Marron', 'mah-ROHN'], mandarin: ['Zong se', 'dzong suh'], japanese: ['Chairo', 'chai-roh'] },
  { gradeLevel: 2, english: 'Gray', category: 'colors' as const, spanish: ['Gris', 'grees'], french: ['Gris', 'gree'], mandarin: ['Hui se', 'hway suh'], japanese: ['Haiiro', 'hai-ee-roh'] },
  { gradeLevel: 2, english: 'Big', category: 'phrases' as const, spanish: ['Grande', 'GRAHN-deh'], french: ['Grand', 'grahn'], mandarin: ['Da', 'dah'], japanese: ['Ookii', 'oh-kee'] },
  { gradeLevel: 2, english: 'Small', category: 'phrases' as const, spanish: ['Pequeno', 'peh-KEH-nyoh'], french: ['Petit', 'puh-TEE'], mandarin: ['Xiao', 'shyow'], japanese: ['Chiisai', 'chee-sai'] },
  { gradeLevel: 2, english: 'Fast', category: 'phrases' as const, spanish: ['Rapido', 'RAH-pee-doh'], french: ['Rapide', 'rah-PEED'], mandarin: ['Kuai', 'kwai'], japanese: ['Hayai', 'hah-yai'] },
  { gradeLevel: 2, english: 'Slow', category: 'phrases' as const, spanish: ['Lento', 'LEN-toh'], french: ['Lent', 'lahn'], mandarin: ['Man', 'mahn'], japanese: ['Osoi', 'oh-soy'] },
  { gradeLevel: 2, english: 'Hot', category: 'phrases' as const, spanish: ['Caliente', 'kah-LYEN-teh'], french: ['Chaud', 'show'], mandarin: ['Re', 'ruh'], japanese: ['Atsui', 'ah-tsoo-ee'] },
  { gradeLevel: 2, english: 'Cold', category: 'phrases' as const, spanish: ['Frio', 'FREE-oh'], french: ['Froid', 'frwah'], mandarin: ['Leng', 'lung'], japanese: ['Samui', 'sah-moo-ee'] },
  { gradeLevel: 3, english: 'Cow', category: 'animals' as const, spanish: ['Vaca', 'BAH-kah'], french: ['Vache', 'vahsh'], mandarin: ['Niu', 'nyoh'], japanese: ['Ushi', 'oo-shee'] },
  { gradeLevel: 3, english: 'Pig', category: 'animals' as const, spanish: ['Cerdo', 'SEHR-doh'], french: ['Cochon', 'koh-SHOHN'], mandarin: ['Zhu', 'joo'], japanese: ['Buta', 'boo-tah'] },
  { gradeLevel: 3, english: 'Duck', category: 'animals' as const, spanish: ['Pato', 'PAH-toh'], french: ['Canard', 'kah-NAR'], mandarin: ['Ya', 'yah'], japanese: ['Ahiru', 'ah-hee-roo'] },
  { gradeLevel: 3, english: 'Rabbit', category: 'animals' as const, spanish: ['Conejo', 'koh-NEH-hoh'], french: ['Lapin', 'lah-PAN'], mandarin: ['Tu zi', 'too dzuh'], japanese: ['Usagi', 'oo-sah-gee'] },
  { gradeLevel: 3, english: 'Frog', category: 'animals' as const, spanish: ['Rana', 'RAH-nah'], french: ['Grenouille', 'gruh-NOOY'], mandarin: ['Qing wa', 'ching wah'], japanese: ['Kaeru', 'kah-eh-roo'] },
  { gradeLevel: 3, english: 'Bear', category: 'animals' as const, spanish: ['Oso', 'OH-soh'], french: ['Ours', 'oors'], mandarin: ['Xiong', 'shyong'], japanese: ['Kuma', 'koo-mah'] },
  { gradeLevel: 3, english: 'Lion', category: 'animals' as const, spanish: ['Leon', 'leh-OHN'], french: ['Lion', 'lee-OHN'], mandarin: ['Shi zi', 'shrr dzuh'], japanese: ['Raion', 'rai-on'] },
  { gradeLevel: 3, english: 'Monkey', category: 'animals' as const, spanish: ['Mono', 'MOH-noh'], french: ['Singe', 'sanj'], mandarin: ['Hou zi', 'hoh dzuh'], japanese: ['Saru', 'sah-roo'] },
  { gradeLevel: 3, english: 'Mouse', category: 'animals' as const, spanish: ['Raton', 'rah-TOHN'], french: ['Souris', 'soo-REE'], mandarin: ['Lao shu', 'laow shoo'], japanese: ['Nezumi', 'neh-zoo-mee'] },
  { gradeLevel: 3, english: 'Turtle', category: 'animals' as const, spanish: ['Tortuga', 'tor-TOO-gah'], french: ['Tortue', 'tor-TOO'], mandarin: ['Wu gui', 'woo gway'], japanese: ['Kame', 'kah-meh'] },
  { gradeLevel: 3, english: 'Tree', category: 'places' as const, spanish: ['Arbol', 'AR-bohl'], french: ['Arbre', 'arbr'], mandarin: ['Shu', 'shoo'], japanese: ['Ki', 'kee'] },
  { gradeLevel: 3, english: 'Flower', category: 'places' as const, spanish: ['Flor', 'flohr'], french: ['Fleur', 'flur'], mandarin: ['Hua', 'hwah'], japanese: ['Hana', 'hah-nah'] },
  { gradeLevel: 3, english: 'Sun', category: 'places' as const, spanish: ['Sol', 'sohl'], french: ['Soleil', 'soh-LAY'], mandarin: ['Tai yang', 'tie yahng'], japanese: ['Taiyo', 'tie-yoh'] },
  { gradeLevel: 3, english: 'Moon', category: 'places' as const, spanish: ['Luna', 'LOO-nah'], french: ['Lune', 'loon'], mandarin: ['Yue liang', 'yweh lyahng'], japanese: ['Tsuki', 'tsoo-kee'] },
  { gradeLevel: 3, english: 'Star', category: 'places' as const, spanish: ['Estrella', 'eh-STREH-yah'], french: ['Etoile', 'ay-TWAHL'], mandarin: ['Xing xing', 'shing shing'], japanese: ['Hoshi', 'hoh-shee'] },
  { gradeLevel: 4, english: 'Notebook', category: 'school' as const, spanish: ['Cuaderno', 'kwah-DEHR-noh'], french: ['Cahier', 'kah-YAY'], mandarin: ['Bi ji ben', 'bee jee bun'], japanese: ['Noto', 'noh-toh'] },
  { gradeLevel: 4, english: 'Paper', category: 'school' as const, spanish: ['Papel', 'pah-PEL'], french: ['Papier', 'pah-PYAY'], mandarin: ['Zhi', 'jrr'], japanese: ['Kami', 'kah-mee'] },
  { gradeLevel: 4, english: 'Desk', category: 'school' as const, spanish: ['Escritorio', 'ehs-kree-TOH-ryoh'], french: ['Bureau', 'boo-ROH'], mandarin: ['Shu zhuo', 'shoo jwoh'], japanese: ['Tsukue', 'tsoo-koo-eh'] },
  { gradeLevel: 4, english: 'Chair', category: 'school' as const, spanish: ['Silla', 'SEE-yah'], french: ['Chaise', 'shehz'], mandarin: ['Yi zi', 'ee dzuh'], japanese: ['Isu', 'ee-soo'] },
  { gradeLevel: 4, english: 'Door', category: 'school' as const, spanish: ['Puerta', 'PWEHR-tah'], french: ['Porte', 'port'], mandarin: ['Men', 'mun'], japanese: ['Doa', 'doh-ah'] },
  { gradeLevel: 4, english: 'Window', category: 'school' as const, spanish: ['Ventana', 'ven-TAH-nah'], french: ['Fenetre', 'fuh-NETR'], mandarin: ['Chuang hu', 'chwahng hoo'], japanese: ['Mado', 'mah-doh'] },
  { gradeLevel: 4, english: 'Backpack', category: 'school' as const, spanish: ['Mochila', 'moh-CHEE-lah'], french: ['Sac a dos', 'sahk ah doh'], mandarin: ['Shu bao', 'shoo bow'], japanese: ['Randoseru', 'rahn-doh-seh-roo'] },
  { gradeLevel: 4, english: 'Homework', category: 'school' as const, spanish: ['Tarea', 'tah-REH-ah'], french: ['Devoirs', 'duh-VWAHR'], mandarin: ['Zuo ye', 'dzwoh yeh'], japanese: ['Shukudai', 'shoo-koo-dai'] },
  { gradeLevel: 4, english: 'Question', category: 'school' as const, spanish: ['Pregunta', 'preh-GOON-tah'], french: ['Question', 'kes-tee-OHN'], mandarin: ['Wen ti', 'wun tee'], japanese: ['Shitsumon', 'sheet-soo-mon'] },
  { gradeLevel: 4, english: 'Answer', category: 'school' as const, spanish: ['Respuesta', 'rrehs-PWEHS-tah'], french: ['Reponse', 'ray-PONS'], mandarin: ['Da an', 'dah ahn'], japanese: ['Kotae', 'koh-tah-eh'] },
  { gradeLevel: 4, english: 'Read', category: 'school' as const, spanish: ['Leer', 'leh-EHR'], french: ['Lire', 'leer'], mandarin: ['Du', 'doo'], japanese: ['Yomu', 'yoh-moo'] },
  { gradeLevel: 4, english: 'Write', category: 'school' as const, spanish: ['Escribir', 'ehs-kree-BEER'], french: ['Ecrire', 'ay-KREER'], mandarin: ['Xie', 'shyeh'], japanese: ['Kaku', 'kah-koo'] },
  { gradeLevel: 4, english: 'Listen', category: 'school' as const, spanish: ['Escuchar', 'ehs-koo-CHAR'], french: ['Ecouter', 'ay-koo-TAY'], mandarin: ['Ting', 'ting'], japanese: ['Kiku', 'kee-koo'] },
  { gradeLevel: 4, english: 'Speak', category: 'school' as const, spanish: ['Hablar', 'ah-BLAR'], french: ['Parler', 'par-LAY'], mandarin: ['Shuo', 'shwoh'], japanese: ['Hanasu', 'hah-nah-soo'] },
  { gradeLevel: 4, english: 'Draw', category: 'school' as const, spanish: ['Dibujar', 'dee-boo-HAR'], french: ['Dessiner', 'deh-see-NAY'], mandarin: ['Hua', 'hwah'], japanese: ['Kaku', 'kah-koo'] },
  { gradeLevel: 5, english: 'Grandpa', category: 'family' as const, spanish: ['Abuelo', 'ah-BWEH-loh'], french: ['Grand-pere', 'grahn-pair'], mandarin: ['Yeye', 'yeh-yeh'], japanese: ['Ojiisan', 'oh-jee-sahn'] },
  { gradeLevel: 5, english: 'Baby', category: 'family' as const, spanish: ['Bebe', 'beh-BEH'], french: ['Bebe', 'bay-BAY'], mandarin: ['Bao bao', 'bow bow'], japanese: ['Akachan', 'ah-kah-chahn'] },
  { gradeLevel: 5, english: 'Family', category: 'family' as const, spanish: ['Familia', 'fah-MEE-lyah'], french: ['Famille', 'fah-MEE'], mandarin: ['Jia ren', 'jyah run'], japanese: ['Kazoku', 'kah-zoh-koo'] },
  { gradeLevel: 5, english: 'Teacher friend', category: 'family' as const, spanish: ['Amiga maestra', 'ah-MEE-gah my-ES-trah'], french: ['Amie professeur', 'ah-MEE proh-feh-SUR'], mandarin: ['Lao shi peng you', 'laow shrr pung yo'], japanese: ['Sensei no tomodachi', 'sen-say noh toh-moh-dah-chee'] },
  { gradeLevel: 5, english: 'Cousin', category: 'family' as const, spanish: ['Primo', 'PREE-moh'], french: ['Cousin', 'koo-ZAN'], mandarin: ['Biao xiong di', 'byow shyong dee'], japanese: ['Itoko', 'ee-toh-koh'] },
  { gradeLevel: 5, english: 'Aunt', category: 'family' as const, spanish: ['Tia', 'TEE-ah'], french: ['Tante', 'tahnt'], mandarin: ['A yi', 'ah yee'], japanese: ['Oba', 'oh-bah'] },
  { gradeLevel: 5, english: 'Uncle', category: 'family' as const, spanish: ['Tio', 'TEE-oh'], french: ['Oncle', 'ohnkl'], mandarin: ['Shu shu', 'shoo shoo'], japanese: ['Oji', 'oh-jee'] },
  { gradeLevel: 5, english: 'Home', category: 'places' as const, spanish: ['Casa', 'KAH-sah'], french: ['Maison', 'may-ZOHN'], mandarin: ['Jia', 'jyah'], japanese: ['Ie', 'ee-eh'] },
  { gradeLevel: 5, english: 'City', category: 'places' as const, spanish: ['Ciudad', 'syoo-DAHD'], french: ['Ville', 'veel'], mandarin: ['Cheng shi', 'chung shrr'], japanese: ['Machi', 'mah-chee'] },
  { gradeLevel: 5, english: 'Street', category: 'places' as const, spanish: ['Calle', 'KAH-yeh'], french: ['Rue', 'roo'], mandarin: ['Jie dao', 'jyeh dow'], japanese: ['Michi', 'mee-chee'] },
  { gradeLevel: 5, english: 'Museum', category: 'places' as const, spanish: ['Museo', 'moo-SEH-oh'], french: ['Musee', 'moo-ZAY'], mandarin: ['Bo wu guan', 'boh woo gwahn'], japanese: ['Hakubutsukan', 'hah-koo-boot-soo-kahn'] },
  { gradeLevel: 5, english: 'Hospital', category: 'places' as const, spanish: ['Hospital', 'ohs-pee-TAHL'], french: ['Hopital', 'oh-pee-TAHL'], mandarin: ['Yi yuan', 'ee ywen'], japanese: ['Byoin', 'byoh-een'] },
  { gradeLevel: 5, english: 'Restaurant', category: 'places' as const, spanish: ['Restaurante', 'rehs-tow-RAHN-teh'], french: ['Restaurant', 'res-toh-RAHN'], mandarin: ['Can ting', 'tsahn ting'], japanese: ['Resutoran', 'reh-soo-toh-rahn'] },
  { gradeLevel: 5, english: 'Playground', category: 'places' as const, spanish: ['Patio de juegos', 'PAH-tyoh deh HWEH-gohs'], french: ['Terrain de jeux', 'teh-RAN duh zhuh'], mandarin: ['You le chang', 'yo leh chahng'], japanese: ['Asobiba', 'ah-soh-bee-bah'] },
  { gradeLevel: 5, english: 'Beach', category: 'places' as const, spanish: ['Playa', 'PLAH-yah'], french: ['Plage', 'plahzh'], mandarin: ['Hai tan', 'high tahn'], japanese: ['Umi', 'oo-mee'] },
  { gradeLevel: 6, english: 'Apple juice', category: 'food' as const, spanish: ['Jugo de manzana', 'HOO-goh deh mahn-SAH-nah'], french: ['Jus de pomme', 'zhoo duh puhm'], mandarin: ['Ping guo zhi', 'ping gwoh jrr'], japanese: ['Ringo jusu', 'reen-goh joo-soo'] },
  { gradeLevel: 6, english: 'Milk', category: 'food' as const, spanish: ['Leche', 'LEH-cheh'], french: ['Lait', 'leh'], mandarin: ['Niu nai', 'nyoh nye'], japanese: ['Gyunyu', 'gyoo-nyoo'] },
  { gradeLevel: 6, english: 'Cheese', category: 'food' as const, spanish: ['Queso', 'KEH-soh'], french: ['Fromage', 'froh-MAZH'], mandarin: ['Nai lao', 'nye laow'], japanese: ['Chizu', 'chee-zoo'] },
  { gradeLevel: 6, english: 'Egg', category: 'food' as const, spanish: ['Huevo', 'WEH-voh'], french: ['Oeuf', 'uf'], mandarin: ['Ji dan', 'jee dahn'], japanese: ['Tamago', 'tah-mah-goh'] },
  { gradeLevel: 6, english: 'Soup', category: 'food' as const, spanish: ['Sopa', 'SOH-pah'], french: ['Soupe', 'soop'], mandarin: ['Tang', 'tahng'], japanese: ['Supu', 'soo-poo'] },
  { gradeLevel: 6, english: 'Chicken', category: 'food' as const, spanish: ['Pollo', 'POH-yoh'], french: ['Poulet', 'poo-LAY'], mandarin: ['Ji rou', 'jee roh'], japanese: ['Toriniku', 'toh-ree-nee-koo'] },
  { gradeLevel: 6, english: 'Fish food', category: 'food' as const, spanish: ['Pescado', 'pehs-KAH-doh'], french: ['Poisson', 'pwah-SOHN'], mandarin: ['Yu rou', 'yoo roh'], japanese: ['Sakana', 'sah-kah-nah'] },
  { gradeLevel: 6, english: 'Vegetable', category: 'food' as const, spanish: ['Verdura', 'vehr-DOO-rah'], french: ['Legume', 'lay-GOOM'], mandarin: ['Shu cai', 'shoo tsai'], japanese: ['Yasai', 'yah-sai'] },
  { gradeLevel: 6, english: 'Fruit', category: 'food' as const, spanish: ['Fruta', 'FROO-tah'], french: ['Fruit', 'frwee'], mandarin: ['Shui guo', 'shway gwoh'], japanese: ['Kudamono', 'koo-dah-moh-noh'] },
  { gradeLevel: 6, english: 'Breakfast', category: 'food' as const, spanish: ['Desayuno', 'deh-sah-YOO-noh'], french: ['Petit dejeuner', 'puh-TEE day-zhuh-NAY'], mandarin: ['Zao fan', 'dzow fahn'], japanese: ['Asagohan', 'ah-sah-goh-hahn'] },
  { gradeLevel: 6, english: 'Lunch', category: 'food' as const, spanish: ['Almuerzo', 'ahl-MWEHR-soh'], french: ['Dejeuner', 'day-zhuh-NAY'], mandarin: ['Wu fan', 'woo fahn'], japanese: ['Hirugohan', 'hee-roo-goh-hahn'] },
  { gradeLevel: 6, english: 'Dinner', category: 'food' as const, spanish: ['Cena', 'SEH-nah'], french: ['Diner', 'dee-NAY'], mandarin: ['Wan fan', 'wahn fahn'], japanese: ['Bangohan', 'bahn-goh-hahn'] },
  { gradeLevel: 6, english: 'Snack', category: 'food' as const, spanish: ['Merienda', 'meh-RYEN-dah'], french: ['Gouter', 'goo-TAY'], mandarin: ['Dian xin', 'dyen shin'], japanese: ['Oyatsu', 'oh-yah-tsoo'] },
  { gradeLevel: 6, english: 'I am hungry', category: 'phrases' as const, spanish: ['Tengo hambre', 'TEN-goh AHM-breh'], french: ["J'ai faim", 'zhay fan'], mandarin: ['Wo e le', 'woh uh luh'], japanese: ['Onaka ga suita', 'oh-nah-kah gah swee-tah'] },
  { gradeLevel: 6, english: 'I am thirsty', category: 'phrases' as const, spanish: ['Tengo sed', 'TEN-goh sed'], french: ["J'ai soif", 'zhay swaf'], mandarin: ['Wo ke le', 'woh kuh luh'], japanese: ['Nodo ga kawaita', 'noh-doh gah kah-wai-tah'] },
  { gradeLevel: 7, english: 'Can I try?', category: 'phrases' as const, spanish: ['Puedo intentar?', 'PWEH-doh een-ten-TAR'], french: ['Je peux essayer?', 'zhuh puh eh-say-YAY'], mandarin: ['Wo keyi shi shi ma?', 'woh kuh-yee shrr shrr mah'], japanese: ['Tameshite ii desu ka?', 'tah-meh-shee-teh ee dess kah'] },
  { gradeLevel: 7, english: 'Can I read?', category: 'phrases' as const, spanish: ['Puedo leer?', 'PWEH-doh leh-EHR'], french: ['Je peux lire?', 'zhuh puh leer'], mandarin: ['Wo keyi du ma?', 'woh kuh-yee doo mah'], japanese: ['Yonde ii desu ka?', 'yohn-deh ee dess kah'] },
  { gradeLevel: 7, english: 'Can I write?', category: 'phrases' as const, spanish: ['Puedo escribir?', 'PWEH-doh ehs-kree-BEER'], french: ['Je peux ecrire?', 'zhuh puh ay-KREER'], mandarin: ['Wo keyi xie ma?', 'woh kuh-yee shyeh mah'], japanese: ['Kaite ii desu ka?', 'kai-teh ee dess kah'] },
  { gradeLevel: 7, english: 'Can I listen?', category: 'phrases' as const, spanish: ['Puedo escuchar?', 'PWEH-doh ehs-koo-CHAR'], french: ['Je peux ecouter?', 'zhuh puh ay-koo-TAY'], mandarin: ['Wo keyi ting ma?', 'woh kuh-yee ting mah'], japanese: ['Kiite ii desu ka?', 'kee-teh ee dess kah'] },
  { gradeLevel: 7, english: 'Can I speak?', category: 'phrases' as const, spanish: ['Puedo hablar?', 'PWEH-doh ah-BLAR'], french: ['Je peux parler?', 'zhuh puh par-LAY'], mandarin: ['Wo keyi shuo ma?', 'woh kuh-yee shwoh mah'], japanese: ['Hanashite ii desu ka?', 'hah-nah-shee-teh ee dess kah'] },
  { gradeLevel: 7, english: 'What does it mean?', category: 'phrases' as const, spanish: ['Que significa?', 'keh seeg-nee-fee-KAH'], french: ['Qu est-ce que ca veut dire?', 'kess kuh sah vuh deer'], mandarin: ['Zhe shi shenme yisi?', 'juh shrr shen-muh ee-suh'], japanese: ['Dou iu imi desu ka?', 'doh yoo ee-mee dess kah'] },
  { gradeLevel: 7, english: 'Please say it slowly', category: 'phrases' as const, spanish: ['Por favor dilo despacio', 'por fah-VOR DEE-loh dehs-PAH-syoh'], french: ['Dites-le lentement', 'deet luh lahnt-MAHN'], mandarin: ['Qing man man shuo', 'ching mahn mahn shwoh'], japanese: ['Yukkuri itte kudasai', 'yoo-koo-ree eet-teh koo-dah-sai'] },
  { gradeLevel: 7, english: 'Please say it again', category: 'phrases' as const, spanish: ['Dilo otra vez', 'DEE-loh OH-trah vehs'], french: ['Repetez encore', 'ray-pay-TAY ahn-KOR'], mandarin: ['Qing zai shuo yi ci', 'ching zai shwoh ee tsuh'], japanese: ['Mou ichido itte kudasai', 'moh ee-chee-doh eet-teh koo-dah-sai'] },
  { gradeLevel: 7, english: 'I can answer', category: 'phrases' as const, spanish: ['Puedo responder', 'PWEH-doh rrehs-pon-DEHR'], french: ['Je peux repondre', 'zhuh puh ray-PONDR'], mandarin: ['Wo keyi hui da', 'woh kuh-yee hway dah'], japanese: ['Kotae raremasu', 'koh-tah-eh rah-reh-mahs'] },
  { gradeLevel: 7, english: 'I made a mistake', category: 'phrases' as const, spanish: ['Cometi un error', 'koh-meh-TEE oon eh-RROR'], french: ["J'ai fait une erreur", 'zhay fay oon eh-RUR'], mandarin: ['Wo cuo le', 'woh tswoh luh'], japanese: ['Machigaemashita', 'mah-chee-gai-mah-shee-tah'] },
  { gradeLevel: 7, english: 'I will try again', category: 'phrases' as const, spanish: ['Voy a intentar otra vez', 'boy ah een-ten-TAR OH-trah vehs'], french: ['Je vais reessayer', 'zhuh vay ray-eh-say-YAY'], mandarin: ['Wo zai shi yi ci', 'woh zai shrr ee tsuh'], japanese: ['Mou ichido yarimasu', 'moh ee-chee-doh yah-ree-mahs'] },
  { gradeLevel: 7, english: 'That is interesting', category: 'phrases' as const, spanish: ['Eso es interesante', 'EH-soh es een-teh-reh-SAHN-teh'], french: ["C'est interessant", 'say tan-tay-ray-SAHN'], mandarin: ['Hen you qu', 'hun yo chee'], japanese: ['Omoshiroi desu', 'oh-moh-shee-roy dess'] },
  { gradeLevel: 7, english: 'I agree', category: 'phrases' as const, spanish: ['Estoy de acuerdo', 'eh-STOY deh ah-KWEHR-doh'], french: ["Je suis d'accord", 'zhuh swee dah-KOR'], mandarin: ['Wo tong yi', 'woh tong ee'], japanese: ['Sansei desu', 'sahn-say dess'] },
  { gradeLevel: 7, english: 'I have a question', category: 'phrases' as const, spanish: ['Tengo una pregunta', 'TEN-goh OO-nah preh-GOON-tah'], french: ["J'ai une question", 'zhay oon kes-tee-OHN'], mandarin: ['Wo you wenti', 'woh yo wun-tee'], japanese: ['Shitsumon ga arimasu', 'sheet-soo-mon gah ah-ree-mahs'] },
  { gradeLevel: 7, english: 'May I go first?', category: 'phrases' as const, spanish: ['Puedo ir primero?', 'PWEH-doh eer pree-MEH-roh'], french: ['Puis-je commencer?', 'pweezh koh-mahn-SAY'], mandarin: ['Wo keyi xian lai ma?', 'woh kuh-yee shyen lie mah'], japanese: ['Saki ni ii desu ka?', 'sah-kee nee ee dess kah'] },
  { gradeLevel: 7, english: 'Your turn', category: 'phrases' as const, spanish: ['Tu turno', 'too TOOR-noh'], french: ['A ton tour', 'ah ton toor'], mandarin: ['Dao ni le', 'dow nee luh'], japanese: ['Anata no ban', 'ah-nah-tah noh bahn'] },
  { gradeLevel: 7, english: 'My turn', category: 'phrases' as const, spanish: ['Mi turno', 'mee TOOR-noh'], french: ['A mon tour', 'ah mon toor'], mandarin: ['Dao wo le', 'dow woh luh'], japanese: ['Watashi no ban', 'wah-tah-shee noh bahn'] },
  { gradeLevel: 7, english: 'Great work', category: 'phrases' as const, spanish: ['Buen trabajo', 'bwen trah-BAH-hoh'], french: ['Bon travail', 'bon trah-VAI'], mandarin: ['Zuo de hao', 'dzwoh duh how'], japanese: ['Yoku dekimashita', 'yoh-koo deh-kee-mah-shee-tah'] },
  { gradeLevel: 7, english: 'Keep practicing', category: 'phrases' as const, spanish: ['Sigue practicando', 'SEE-geh prahk-tee-KAHN-doh'], french: ['Continue a pratiquer', 'kon-tee-NOO ah prahk-tee-KAY'], mandarin: ['Ji xu lian xi', 'jee shoo lyen shee'], japanese: ['Renshuu tsuzukete', 'ren-shoo tsoo-zoo-keh-teh'] },
];

const EXPANDED_LANGUAGE_WORDS: { [key: string]: LanguageWord[] } = {
  spanish: LANGUAGE_EXPANSION_CONCEPTS.map(item => ({ gradeLevel: item.gradeLevel, english: item.english, translation: item.spanish[0], pronunciation: item.spanish[1], language: 'spanish', category: item.category })),
  french: LANGUAGE_EXPANSION_CONCEPTS.map(item => ({ gradeLevel: item.gradeLevel, english: item.english, translation: item.french[0], pronunciation: item.french[1], language: 'french', category: item.category })),
  mandarin: LANGUAGE_EXPANSION_CONCEPTS.map(item => ({ gradeLevel: item.gradeLevel, english: item.english, translation: item.mandarin[0], pronunciation: item.mandarin[1], language: 'mandarin', category: item.category })),
  japanese: LANGUAGE_EXPANSION_CONCEPTS.map(item => ({ gradeLevel: item.gradeLevel, english: item.english, translation: item.japanese[0], pronunciation: item.japanese[1], language: 'japanese', category: item.category })),
};

export const getLanguageWords = (language: keyof typeof VOCABULARY) => [
  ...VOCABULARY[language],
  ...(EXTRA_LANGUAGE_WORDS[language] || []),
  ...(EXPANDED_LANGUAGE_WORDS[language] || []),
];

export const LANGUAGE_INFO = {
  spanish: { flag: 'ES', name: 'Spanish', color: 'from-red-500 to-yellow-500' },
  french: { flag: 'FR', name: 'French', color: 'from-blue-500 to-red-500' },
  mandarin: { flag: 'CN', name: 'Mandarin', color: 'from-red-500 to-yellow-400' },
  japanese: { flag: 'JP', name: 'Japanese', color: 'from-red-400 to-rose-500' },
};

const CATEGORY_LABELS: { [key: string]: string } = {
  greetings: 'Greeting',
  numbers: 'Number',
  colors: 'Color',
  animals: 'Animal',
  food: 'Food',
  family: 'Family',
  school: 'School',
  places: 'Place',
  phrases: 'Phrase',
};
const AdvancedLanguageRoom: React.FC<LanguageRoomProps> = ({ level, onBack, onReward, onAttempt }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof VOCABULARY>('spanish');
  const [currentWord, setCurrentWord] = useState<LanguageWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [coachTip, setCoachTip] = useState('');
  const lessonStep = useRef(0);

  const availableWords = useMemo(() => {
    const allWords = getLanguageWords(selectedLanguage);
    // Use the child's exact grade. Only fall back one grade for review.
    const exactGrade = allWords.filter(word => (word.gradeLevel ?? 1) === level);
    if (exactGrade.length > 0) return exactGrade;
    return allWords.filter(word => {
      const wordGrade = word.gradeLevel ?? 1;
      return wordGrade === level || wordGrade === level - 1;
    });
  }, [level, selectedLanguage]);

  const languageTip = useMemo(() => {
    if (mode === 'learn') return 'Listen, say it, then notice the pronunciation pattern.';
    return 'Think of the sound first, then choose the translation.';
  }, [mode]);

  const getNewWord = () => {
    const words: LanguageWord[] = availableWords;
    const step = lessonStep.current;
    lessonStep.current += 1;
    const word = pickDailyItem<LanguageWord>(words, `language-${selectedLanguage}-${mode}-grade-${level}`, step);
    setCurrentWord(word);

    // Generate wrong options
    const wrongOptions = shuffleDailyItems(
      words.filter(w => w.translation !== word.translation),
      `language-distractors-${selectedLanguage}-${mode}-${level}-${word.translation}`,
      step
    )
      .slice(0, 3)
      .map(w => w.translation);

    const allOptions = shuffleDailyItems(
      [...wrongOptions, word.translation],
      `language-options-${selectedLanguage}-${mode}-${level}-${word.translation}`,
      step
    );
    setOptions(allOptions);
    setSelectedAnswer(null);
    setShowResult(false);
    setCoachTip(languageTip);

    if (mode === 'quiz') {
      void speakAsync(`How do you say ${word.english} in ${LANGUAGE_INFO[selectedLanguage].name}? A. ${allOptions[0]}. B. ${allOptions[1]}. C. ${allOptions[2]}. D. ${allOptions[3]}.`, 0.86, 1.04);
    } else {
      void speakAsync(`${word.english} is ${word.translation}. Say ${word.translation}.`, 0.86, 1.04);
    }
  };

  useEffect(() => {
    getNewWord();
  }, [selectedLanguage, mode, languageTip, availableWords]);

  const speakWord = () => {
    if (currentWord) {
      // Speak the translation with pronunciation guide
      void speakAsync(`${currentWord.translation}. It sounds like ${currentWord.pronunciation}.`, 0.82, 1.0);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult || !currentWord) return;

    setSelectedAnswer(answer);
    const correct = answer === currentWord.translation;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccess();
      setScore(s => s + 1);
      setWordsLearned(prev => new Set(prev).add(currentWord.english));
      void speakCorrect(`${currentWord.translation} means ${currentWord.english}. Great job learning ${langInfo.name}.`);
      setTimeout(() => onReward({
        questionId: `language-${selectedLanguage}-${currentWord.category}-${currentWord.english}`,
        skill: `${selectedLanguage} ${currentWord.category}`,
        prompt: `Translate ${currentWord.english}`,
        selectedAnswer: answer,
        correctAnswer: currentWord.translation,
      }), 2000);
    } else {
      playWrongBuzzer();
      onAttempt?.({
        questionId: `language-${selectedLanguage}-${currentWord.category}-${currentWord.english}`,
        skill: `${selectedLanguage} ${currentWord.category}`,
        prompt: `Translate ${currentWord.english}`,
        selectedAnswer: answer,
        correctAnswer: currentWord.translation,
      }, false);
      void speakWrong(`The answer is ${currentWord.translation}. It sounds like ${currentWord.pronunciation}.`);
    }
  };

  const langInfo = LANGUAGE_INFO[selectedLanguage];

  if (!currentWord) return null;

  return (
    <div className="academy-room-surface w-full h-full flex flex-col overflow-auto relative" style={{ '--academy-room-scene': "url('/academy/rooms/language.webp')" } as React.CSSProperties}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} aria-label="Back to world map" className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
          <ArrowLeft className="text-white" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Languages className="text-white" size={28} />
          <span className="text-2xl font-bold text-white drop-shadow">Language Lab</span>
        </div>
        <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full">
          <Heart className="text-red-300 fill-red-300" size={20} />
          <span className="text-white font-bold">{wordsLearned.size}</span>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex justify-center gap-2 p-4 flex-wrap">
        {(Object.keys(LANGUAGE_INFO) as Array<keyof typeof LANGUAGE_INFO>).map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-4 py-2 rounded-full font-bold text-base sm:text-lg transition-all transform ${
              selectedLanguage === lang
                ? 'bg-white text-purple-600 scale-110 shadow-lg'
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            {LANGUAGE_INFO[lang].name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 max-w-2xl w-full relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-pink-100/80" />
          <div className="absolute -left-12 bottom-20 h-32 w-32 rounded-full bg-indigo-100/80" />
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6 relative">
            <div className="bg-gray-100 rounded-full p-1 flex">
              <button
                onClick={() => setMode('learn')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  mode === 'learn' ? 'bg-purple-500 text-white' : 'text-gray-600'
                }`}
              >
                Learn
              </button>
              <button
                onClick={() => setMode('quiz')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  mode === 'quiz' ? 'bg-purple-500 text-white' : 'text-gray-600'
                }`}
              >
                Quiz
              </button>
            </div>
          </div>

          {/* Category Badge */}
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700">
              {CATEGORY_LABELS[currentWord.category] || currentWord.category}
            </span>
          </div>
          <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl px-4 py-3 mb-5">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 mb-1">Language Coach</div>
            <div className="text-purple-900 font-semibold">{coachTip}</div>
          </div>

          <div className="relative mb-5 overflow-hidden rounded-2xl border-2 border-fuchsia-100 bg-gradient-to-br from-pink-50 via-white to-indigo-50 p-4 shadow-inner">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-600">Word Passport</div>
                <div className="text-lg font-black text-slate-800">Listen, Say, Match</div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-fuchsia-700 shadow-sm">
                {wordsLearned.size} words saved
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['Listen', 'Hear the word'],
                ['Say', 'Practice out loud'],
                ['Match', 'Choose meaning'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-xl bg-white/95 p-3 text-center shadow-sm ring-1 ring-fuchsia-100">
                  <div className="text-sm font-black text-slate-800">{title}</div>
                  <div className="text-xs font-semibold text-slate-500">{copy}</div>
                </div>
              ))}
            </div>
          </div>

          {mode === 'learn' ? (
            /* Learn Mode */
            <div className="text-center">
              {/* English Word */}
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 mb-4">
                <p className="text-sm text-gray-500 mb-1">English</p>
                <p data-testid="language-learn-english" className="text-4xl font-bold text-gray-800">{currentWord.english}</p>
              </div>

              {/* Translation */}
              <div className={`bg-gradient-to-r ${langInfo.color} rounded-xl p-6 mb-4`}>
                <p className="text-sm text-white/80 mb-1">{langInfo.name}</p>
                <p className="text-4xl font-bold text-white">{currentWord.translation}</p>
                <p className="text-lg text-white/90 mt-2 italic">"{currentWord.pronunciation}"</p>
              </div>

              {/* Listen Button */}
              <button
                onClick={speakWord}
                className="mb-6 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <Volume2 size={24} />
                Listen & Repeat
              </button>

              {/* Next Button */}
              <button
                onClick={getNewWord}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
              >
                Next Word
              </button>
            </div>
          ) : (
            /* Quiz Mode */
            <>
              {/* Question */}
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 mb-6 text-center">
                <p className="text-sm text-gray-500 mb-2">How do you say this in {langInfo.name}?</p>
                <p data-testid="language-quiz-word" className="text-4xl font-bold text-gray-800">{currentWord.english}</p>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
                {options.map((option, index) => {
                  let buttonClass = 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-purple-100 hover:to-pink-100 text-gray-700 border-2 border-gray-200';

                  if (showResult) {
                    if (option === currentWord.translation) {
                      buttonClass = 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-2 border-green-400';
                    } else if (option === selectedAnswer) {
                      buttonClass = 'bg-gradient-to-r from-red-400 to-rose-500 text-white border-2 border-red-400';
                    } else {
                      buttonClass = 'bg-gray-100 text-gray-400 border-2 border-gray-200';
                    }
                  }

                  return (
                    <button
                      key={index}
                      data-testid={`language-option-${option}`}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      className={`flex min-h-[88px] items-center gap-3 rounded-xl p-4 text-left text-lg font-bold transition-all transform hover:scale-105 shadow-md ${buttonClass}`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/85 text-base font-black text-purple-700 shadow-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Result */}
              {showResult && (
                <div className={`p-4 rounded-2xl border-2 mb-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                  <div className="flex items-start gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-black uppercase tracking-wide text-slate-700">
                      Teacher Check
                    </span>
                    <div>
                      <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                        {isCorrect ? 'Correct translation.' : `The answer is ${currentWord.translation}.`}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-600">
                        Your answer: {selectedAnswer || 'Not selected'}
                      </p>
                      <p className="text-gray-600">
                        {currentWord.translation} means {currentWord.english}. Pronunciation: "{currentWord.pronunciation}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Button */}
              {showResult && (
                <button
                  onClick={getNewWord}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105"
                >
                  {isCorrect ? 'Next Word!' : 'Try Another!'}
                </button>
              )}
            </>
          )}

          {/* Score */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-400 px-3 py-1 rounded-full shadow">
            <Star className="text-white fill-white" size={16} />
            <span className="text-white font-bold">{score}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LanguageRoom: React.FC<LanguageRoomProps> = (props) => {
  if (props.level <= 7) {
    return <EarlySpeechLesson {...props} />;
  }
  return <AdvancedLanguageRoom {...props} />;
};
