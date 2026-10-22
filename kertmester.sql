-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Okt 02. 08:58
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `kertmester`
--
CREATE DATABASE IF NOT EXISTS `kertmester` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `kertmester`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalo`
--

CREATE TABLE `felhasznalo` (
  `ID` int(11) NOT NULL,
  `Nev` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Jelszo` varchar(255) NOT NULL,
  `Telefonszam` varchar(30) DEFAULT NULL,
  `Regisztracio_Datuma` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `felhasznalo`
--

INSERT INTO `felhasznalo` (`ID`, `Nev`, `Email`, `Jelszo`, `Telefonszam`, `Regisztracio_Datuma`) VALUES
(1, 'Kovács János', 'kovacs.janos@example.com', '$2y$10$e0MYzXyjpJS7uE6.3.3z.eO9Q.41g5/XmH6kE0eM2S9rJ.zE1n2/2', '+36301234567', '2026-10-02 08:43:56'),
(2, 'Nagy Éva', 'nagy.eva@example.com', '$2y$10$e0MYzXyjpJS7uE6.3.3z.eO9Q.41g5/XmH6kE0eM2S9rJ.zE1n2/2', '+36209876543', '2026-10-02 08:43:56'),
(3, 'Szabó Péter', 'szabo.peter@example.com', '$2y$10$e0MYzXyjpJS7uE6.3.3z.eO9Q.41g5/XmH6kE0eM2S9rJ.zE1n2/2', '+36705554433', '2026-10-02 08:43:56');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kategoria`
--

CREATE TABLE `kategoria` (
  `ID` int(11) NOT NULL,
  `Nev` varchar(100) NOT NULL,
  `Leiras` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `kategoria`
--

INSERT INTO `kategoria` (`ID`, `Nev`, `Leiras`) VALUES
(1, 'Virágok és Évelők', 'Különböző évelő és egynyári virágok a kert díszítésére'),
(2, 'Díszcserjék és Fák', 'Kisebb és nagyobb termetű díszfák, cserjék'),
(3, 'Fűmagok és Gyepszőnyeg', 'Pázsit kialakításához szükséges fűmagkeverékek és kiegészítők'),
(4, 'Kerti Szerszámok', 'Kézi és gépi szerszámok a kert gondozásához'),
(5, 'Öntözőrendszerek', 'Agyag- és műanyag csövek, szórófejek, csepegtetők'),
(6, 'Kerti Bútorok', 'Asztalok, székek, padok és napernyők'),
(7, 'Kerti Világítás', 'Szolár lámpák, LED-es kerti világítási rendszerek'),
(8, 'Tápoldatok és Trágyák', 'Növénytápok, szerves és műtrágyák'),
(9, 'Kerti Díszek és Tavak', 'Tótechnika, kerti törpék, kaspók, csobogók'),
(10, 'Növényvédelem', 'Rovarirtók, gombaölők és védőhálók');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kertterv`
--

CREATE TABLE `kertterv` (
  `ID` int(11) NOT NULL,
  `Nev` varchar(100) NOT NULL,
  `Kertterv_kep` varchar(255) DEFAULT NULL,
  `Letrehozas_Datuma` datetime DEFAULT current_timestamp(),
  `Utolso_Modositas` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Kert_Hosszusag` decimal(10,2) DEFAULT NULL,
  `Kert_Szelesseg` decimal(10,2) DEFAULT NULL,
  `Felhasznalo_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `kertterv`
--

INSERT INTO `kertterv` (`ID`, `Nev`, `Kertterv_kep`, `Letrehozas_Datuma`, `Utolso_Modositas`, `Kert_Hosszusag`, `Kert_Szelesseg`, `Felhasznalo_ID`) VALUES
(1, 'Kovács Családi Modern Kert', 'plan_kovacs_01.png', '2026-10-02 08:43:56', '2026-10-02 08:43:56', 15.50, 10.00, 1),
(2, 'Nagy Éva Angolkert Terve', 'plan_eva_01.png', '2026-10-02 08:43:56', '2026-10-02 08:43:56', 20.00, 12.50, 2),
(3, 'Szabó Péter Minikert', 'plan_szabo_01.png', '2026-10-02 08:43:56', '2026-10-02 08:43:56', 8.00, 6.00, 3);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kertterv_termek`
--

CREATE TABLE `kertterv_termek` (
  `Kertterv_ID` int(11) NOT NULL,
  `Termek_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `kertterv_termek`
--

INSERT INTO `kertterv_termek` (`Kertterv_ID`, `Termek_ID`) VALUES
(1, 1),
(1, 11),
(1, 21),
(1, 41),
(1, 61),
(1, 71),
(2, 4),
(2, 12),
(2, 51),
(2, 81),
(2, 82),
(3, 9),
(3, 31),
(3, 32),
(3, 49);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `rendeles`
--

CREATE TABLE `rendeles` (
  `ID` int(11) NOT NULL,
  `Szallitasi_Cim` text NOT NULL,
  `Statusz` varchar(50) NOT NULL,
  `Vegosszeg` decimal(10,2) NOT NULL,
  `Rendeles_Datuma` datetime DEFAULT current_timestamp(),
  `Kertterv_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `rendeles`
--

INSERT INTO `rendeles` (`ID`, `Szallitasi_Cim`, `Statusz`, `Vegosszeg`, `Rendeles_Datuma`, `Kertterv_ID`) VALUES
(1, '1051 Budapest, Kossuth Lajos utca 12.', 'Feldolgozás alatt', 38470.00, '2024-03-15 10:30:00', 1),
(2, '1051 Budapest, Kossuth Lajos utca 12.', 'Kiszállítva', 24900.00, '2024-04-02 14:15:00', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `termek`
--

CREATE TABLE `termek` (
  `ID` int(11) NOT NULL,
  `Nev` varchar(150) NOT NULL,
  `Leiras` text DEFAULT NULL,
  `Ar` decimal(10,2) NOT NULL,
  `Keszleten_Levo_Mennyiseg` int(11) NOT NULL DEFAULT 0,
  `Meret_Adatok` varchar(100) DEFAULT NULL,
  `Kategoria_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `termek`
--

INSERT INTO `termek` (`ID`, `Nev`, `Leiras`, `Ar`, `Keszleten_Levo_Mennyiseg`, `Meret_Adatok`, `Kategoria_ID`) VALUES
(1, 'Levendula (Lavandula angustifolia)', 'Illatos, lila virágú évelő növény', 1290.00, 50, '20-30 cm', 1),
(2, 'Bíbor Kasvirág (Echinacea)', 'Szárazságtűrő, gyógynövényként is ismert évelő', 1450.00, 35, '30-40 cm', 1),
(3, 'Árnyékliliom (Hosta)', 'Árnyékkedvelő, díszes levelű évelő', 1890.00, 20, '15-25 cm', 1),
(4, 'Hortenzia (Hydrangea macrophylla)', 'Hatalmas, színes viráglabdákat hozó cserje', 3490.00, 15, '40-50 cm', 1),
(5, 'Szarkaláb (Delphinium)', 'Magas szárú, kék virágzatú dísznövény', 1690.00, 25, '30-50 cm', 1),
(6, 'Lángvirág (Phlox)', 'Illatos, tömött virágzatú évelő', 1190.00, 40, '20-30 cm', 1),
(7, 'Sásliliom (Hemerocallis)', 'Könnyen gondozható, tartós virágzatú évelő', 1390.00, 30, '25-35 cm', 1),
(8, 'Pünkösdi Rózsa (Paeonia)', 'Nagy méretű, telt virágú klasszikus évelő', 2990.00, 18, '30-40 cm', 1),
(9, 'Kerti Muskátli', 'Kedvelt balkonnövény és kerti dísz', 890.00, 100, '15-20 cm', 1),
(10, 'Tulipán Hagyma Csomag (10db)', 'Tavaszi virágzású mixed tulipánhagymák', 1990.00, 60, 'Hagyma méret 11/12', 1),
(11, 'Smaragdtuja (Thuja occidentalis)', 'Oszlopos növekedésű, sövénynek kiváló tuja', 2490.00, 80, '80-100 cm', 2),
(12, 'Japán Juhar (Acer palmatum)', 'Látványos, vörös levelű kis fa', 8900.00, 10, '60-80 cm', 2),
(13, 'Selyemakác (Albizia julibrissin)', 'Trópusi hatású, rózsaszín virágú díszfa', 6500.00, 12, '100-120 cm', 2),
(14, 'Leyland Ciprus', 'Rendkívül gyorsan növő örökzöld sövénynövény', 1990.00, 120, '60-80 cm', 2),
(15, 'Orgona (Syringa vulgaris)', 'Illatos, tavaszi virágzású cserje', 3200.00, 25, '50-70 cm', 2),
(16, 'Aranyeső (Forsythia)', 'Sárga virágzatú korai tavaszi cserje', 2100.00, 30, '40-60 cm', 2),
(17, 'Kerti Mályva (Hibiscus syriacus)', 'Nyáron virágzó, színes cserje', 2890.00, 22, '40-50 cm', 2),
(18, 'Közönséges Tiszafa (Taxus baccata)', 'Lassan növő, árnyéktűrő örökzöld', 3990.00, 15, '30-40 cm', 2),
(19, 'Díszcseresznye (Prunus serrulata)', 'Tavaszi rózsaszín virágtenger', 9500.00, 8, '120-150 cm', 2),
(20, 'Babérmeggy (Prunus laurocerasus)', 'Fényes levelű, örökzöld sövénynövény', 2790.00, 90, '40-60 cm', 2),
(21, 'Sport Fűmagkeverék 1kg', 'Strapabíró, taposást jól tűrő pázsit', 2490.00, 45, '1 kg', 3),
(22, 'Pázsit Fűmagkeverék 5kg', 'Finom szálú, díszpázsit keverék', 9990.00, 25, '5 kg', 3),
(23, 'Árnyéktűrő Fűmag 1kg', 'Kevesebb napfényt igénylő területekre', 2890.00, 30, '1 kg', 3),
(24, 'Szárazságtűrő Fűmag 5kg', 'Kevés öntözést igénylő fűmagkeverék', 10990.00, 20, '5 kg', 3),
(25, 'Premium Gyepszőnyeg (m2)', 'Azonnali zöld felületet biztosító gyepszőnyeg', 2200.00, 500, '1 m2', 3),
(26, 'Gyepindító Műtrágya 2.5kg', 'Segíti a fűmagok gyors gyökeresedését', 3490.00, 40, '2.5 kg', 3),
(27, 'Gyepregeneráló Fűmag 1kg', 'Kikopott gyep gyors felújítására', 2690.00, 35, '1 kg', 3),
(28, 'Mohásodás Elleni Gyepápoló 5kg', 'Gátolja a moha terjedését a gyepben', 4500.00, 18, '5 kg', 3),
(29, 'Gyep Műtrágya 10kg', 'Hosszú hatású gyeptápanyag', 8990.00, 30, '10 kg', 3),
(30, 'Fűmag Felülvetéshez 2kg', 'Gyep sűrítéséhez ajánlott keverék', 4290.00, 28, '2 kg', 3),
(31, 'Fiskars Ásó', 'Ergonomikus, acél pengéjű ásó', 11990.00, 15, '120 cm', 4),
(32, 'GARDENA Metszőolló', 'Precíziós vágású kézi metszőolló', 6490.00, 30, '20 cm', 4),
(33, 'Lombgereblye Műanyag', 'Széles, rugalmas műanyag fejjel', 3200.00, 25, '150 cm', 4),
(34, 'Kerti Kapa', 'Kovácsolt acél fej, fa nyéllel', 2890.00, 20, '110 cm', 4),
(35, 'Sövényvágó Olló', 'Hullámos vágóélű kézi sövényvágó', 7890.00, 12, '65 cm', 4),
(36, 'Kerti Talicska 80L', 'Horvát horganyzott puttonyos talicska', 18900.00, 10, '80 Liter', 4),
(37, 'Handy Kézi Ültetőlapát', 'Rozsdamentes acél kis lapát', 1490.00, 50, '30 cm', 4),
(38, 'Fiskars Ágvágó Olló', 'Rásegítős mechanizmussal vastag ágakhoz', 15990.00, 8, '80 cm', 4),
(39, 'Kerti Kézi Kiszúró Gyomláló', 'Pitypang és mély gyökerű gyomok ellen', 1890.00, 35, '35 cm', 4),
(40, 'Kerti Kesztyű (L)', 'Gumírozott tenyerű védőkesztyű', 890.00, 100, 'L-es méret', 4),
(41, 'Slag 1/2\" 25m', '3 rétegű csavarodásmentes kerti tömlő', 4990.00, 40, '25 méter', 5),
(42, 'GARDENA Négyszögszóró', 'Egyenletes öntözés négyszögletes területekre', 9890.00, 15, '220 m2-ig', 5),
(43, 'Automata Öntözőóra', 'Digitálisan programozható csapra szerelhető időzítő', 12990.00, 10, '3/4\" és 1\"', 5),
(44, 'Csepegtető Szalag 50m', 'Víztakarékos öntözőrendszer elem', 6500.00, 20, '50 méter', 5),
(45, 'Locsolópisztoly 8 funkciós', 'Állítható vízsugarú kézi szórófej', 2490.00, 45, 'Standard csatlakozó', 5),
(46, 'Tömlőkocsi', 'Könnyen mozgatható fém-műanyag tömlőtartó', 11500.00, 12, '60m tömlőhöz', 5),
(47, 'Gyorscsatlakozó Készlet 1/2\"', 'Alapvető tömlőcsatlakozó elemek', 1890.00, 60, '1/2 col', 5),
(48, 'Pop-up Szórófej', 'Földbe süllyeszthető esőztető szórófej', 3200.00, 50, 'Sugár: 3-5m', 5),
(49, 'Öntözőkanna 10L', 'Műanyag kanna levehető rózsával', 1990.00, 30, '10 Liter', 5),
(50, 'Esővízgyűjtő Hordó 200L', 'Műanyag hordó kifolyó csappal', 14900.00, 8, '200 Liter', 5),
(51, 'Rattan Kerti Garnitúra', '4 részes kanapé, 2 fotel és asztal', 129900.00, 4, 'Standard 4 személyes', 6),
(52, 'Fa Kerti Pad 150cm', 'Kezelt fenyőfa kerti pad', 34900.00, 8, '150 cm', 6),
(53, 'Napernyő 3m', 'Hajókaros, dönthető kerti napernyő', 18900.00, 15, 'Átmérő: 3m', 6),
(54, 'Műanyag Kerti Szék', 'Könnyű, egymásba rakható műanyag szék', 3990.00, 60, '55x55x80 cm', 6),
(55, 'Kerti Asztal Üveglappal', 'Fém vázas, edzett üveglapos asztal', 24900.00, 10, '150x90 cm', 6),
(56, 'Függőfotel', 'Erős állvánnyal és kényelmes párnával', 49900.00, 6, '195x105 cm', 6),
(57, 'Kerti Napozóágy', 'Állítható háttámlájú műanyag napozóágy', 15900.00, 12, '190x60 cm', 6),
(58, 'Összecsukható Fa Asztal', 'Balkonra és kisebb kertekbe ideális', 12900.00, 18, '70x70 cm', 6),
(59, 'Kerti Tároló Láda 300L', 'Műanyag, időjárásálló párnatartó láda', 21900.00, 14, '120x50x60 cm', 6),
(60, 'Hintaágy 3 Személyes', 'Tetővel és párnákkal ellátott fém hintaágy', 59900.00, 5, '170x110x153 cm', 6),
(61, 'Szolár Leszúrható Lámpa', 'Rozsdamentes acél napelem-es lámpa', 990.00, 150, 'Magasság: 38 cm', 7),
(62, 'LED Kerti Fényfüzér 10m', 'Melegfehér fényű vízálló fényfüzér', 6990.00, 25, '10 méter', 7),
(63, 'Napelemes Mozgásérzékelős Reflektor', 'Erős LED világítás falra szerelhető', 5490.00, 30, '15x10 cm', 7),
(64, 'Kerti Állólámpa 80cm', 'Modern alumínium kerti világítóoszlop', 11900.00, 12, 'Magasság: 80 cm', 7),
(65, 'Szolár Kerti Csobogó Világítás', 'Vízálló napelemes tavi lámpa', 3990.00, 20, 'Átmérő: 12 cm', 7),
(66, 'Beépíthető Taposólámpa', 'Rozsdamentes acél gyepbe építhető spotlámpa', 4200.00, 40, 'Átmérő: 10 cm', 7),
(67, 'Kerti Fáklya Műanyag szolár', 'Lánghatású napelemes fáklya', 2490.00, 50, 'Magasság: 50 cm', 7),
(68, 'LED Kerti Szpotlámpa', 'Állítható szögű növényvilágító spot', 7990.00, 15, 'Magasság: 25 cm', 7),
(69, 'Dekoratív Szolár Gömb', 'Színváltós napelemes kerti gömb', 4990.00, 30, 'Átmérő: 20 cm', 7),
(70, 'Kerti Fali Lámpa Classic', 'Klasszikus stílusú kültéri fali lámpás', 6490.00, 18, '25x15 cm', 7),
(71, 'Marhatrágya Érett 20L', 'Szerves tápanyagutánpótlás növényeknek', 1490.00, 80, '20 Liter', 8),
(72, 'Általános Növénytáp 1L', 'Folyékony tápoldat szobai és kerti növényeknek', 1290.00, 50, '1 Liter', 8),
(73, 'Muskátli Tápoldat 1L', 'Bőséges virágzást elősegítő táp', 1390.00, 40, '1 Liter', 8),
(74, 'Rózsatáp Műtrágya 1kg', 'Kifejezetten rózsák igényeire szabva', 1890.00, 30, '1 kg', 8),
(75, 'Komposztálást Segítő Por 1kg', 'Gyorsítja a szerves hulladék lebomlását', 2190.00, 25, '1 kg', 8),
(76, 'Lassú Lebomlású Műtrágya 2kg', '6 hónapos tápanyag-utánpótlás', 4990.00, 20, '2 kg', 8),
(77, 'Savanyú Talaj Tápoldat (Hortenziának)', 'Kékíti a hortenzia virágját', 1790.00, 22, '1 Liter', 8),
(78, 'Orchidea Tápoldat 0.5L', 'Kímélő tápoldat orchideáknak', 1190.00, 35, '0.5 Liter', 8),
(79, 'Bio Zöldség Tápoldat 1L', '100%-ban természetes összetevőkből', 2490.00, 30, '1 Liter', 8),
(80, 'Gyep Műtrágya Rugalmas Táp 5kg', 'Nitrogénben gazdag gyeptáp', 4890.00, 25, '5 kg', 8),
(81, 'Kerti Tó Fólia 4x5m', 'UV-álló PVC tófólia', 15900.00, 10, '4x5 méter', 9),
(82, 'Kerti Tó Szivattyú', 'Energiatakarékos vízforgató szivattyú', 18900.00, 8, '3000 L/h', 9),
(83, 'Kerti Törpe Dísz', 'Műgyanta klasszikus kerti törpe', 2990.00, 25, 'Magasság: 30 cm', 9),
(84, 'Kerámia Kaspó Nagy', 'Fagyálló kerámia virágcserép', 5990.00, 15, 'Átmérő: 40 cm', 9),
(85, 'Műanyag Kerítés Szegély 3m', 'Flexibilis ágyásszegély', 2490.00, 60, '3 méter', 9),
(86, 'Napelemes Tó Csobogó', 'Vízfelszínen lebegő szökőkút', 5990.00, 18, 'Átmérő: 16 cm', 9),
(87, 'Kerti Szélkakas Fém', 'Tradicionális kakas alakú szélkakas', 6490.00, 12, 'Magasság: 70 cm', 9),
(88, 'Bambusz Kerti Szélcsengő', 'Kellemes hangú természetes dísz', 3200.00, 20, 'Hossz: 50 cm', 9),
(89, 'Kő Hatású Kerti Csobogó', 'Komplett zárt rendszerű műkő szökőkút', 39900.00, 4, '60x40 cm', 9),
(90, 'Madáretető Fa', 'Fára akasztható fa madáretető', 3490.00, 30, '25x25 cm', 9),
(91, 'Sárga Ragadós Lap (10db)', 'Rovarcsapda üvegházba és kertbe', 1290.00, 50, '10 db/csomag', 10),
(92, 'Kerti Permetező 5L', 'Vállra akasztható nyomásos permetező', 6990.00, 20, '5 Liter', 10),
(93, 'Madárháló 4x5m', 'Gyümölcsfák és veteményesek védelmére', 1890.00, 40, '4x5 méter', 10),
(94, 'Vakondriasztó Háló 1x50m', 'Gyep alá fektethető műanyag háló', 11900.00, 15, '1x50 méter', 10),
(95, 'Bio Rovarirtó Koncentrátum 250ml', 'Természetes alapanyagú rovarirtó', 3490.00, 30, '250 ml', 10),
(96, 'Gombaölő Szer (Rézoxiklorid) 500g', 'Széles hatásspektrumú védőszer', 2890.00, 25, '500 g', 10),
(97, 'Fatörzsvédő Háló 1m', 'Rágcsálók elleni törzsvédelem', 990.00, 60, '1 méter', 10),
(98, 'Kerti Takarófólia 2x10m', 'Fagy elleni védőfólia', 2200.00, 35, '2x10 méter', 10),
(99, 'Csigaölő Granulátum 500g', 'Csigakártevők elleni csalétek', 2990.00, 45, '500 g', 10),
(100, 'Szélkerék Madárriasztó', 'Látványos és mozgó madárriasztó eszköz', 1490.00, 40, 'Magasság: 40 cm', 10);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `felhasznalo`
--
ALTER TABLE `felhasznalo`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- A tábla indexei `kategoria`
--
ALTER TABLE `kategoria`
  ADD PRIMARY KEY (`ID`);

--
-- A tábla indexei `kertterv`
--
ALTER TABLE `kertterv`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_kertterv_felhasznalo` (`Felhasznalo_ID`);

--
-- A tábla indexei `kertterv_termek`
--
ALTER TABLE `kertterv_termek`
  ADD PRIMARY KEY (`Kertterv_ID`,`Termek_ID`),
  ADD KEY `fk_tartalmaz_termek` (`Termek_ID`);

--
-- A tábla indexei `rendeles`
--
ALTER TABLE `rendeles`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_rendeles_kertterv` (`Kertterv_ID`);

--
-- A tábla indexei `termek`
--
ALTER TABLE `termek`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_termek_kategoria` (`Kategoria_ID`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `felhasznalo`
--
ALTER TABLE `felhasznalo`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `kategoria`
--
ALTER TABLE `kategoria`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT a táblához `kertterv`
--
ALTER TABLE `kertterv`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `rendeles`
--
ALTER TABLE `rendeles`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `termek`
--
ALTER TABLE `termek`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `kertterv`
--
ALTER TABLE `kertterv`
  ADD CONSTRAINT `fk_kertterv_felhasznalo` FOREIGN KEY (`Felhasznalo_ID`) REFERENCES `felhasznalo` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `kertterv_termek`
--
ALTER TABLE `kertterv_termek`
  ADD CONSTRAINT `fk_tartalmaz_kertterv` FOREIGN KEY (`Kertterv_ID`) REFERENCES `kertterv` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tartalmaz_termek` FOREIGN KEY (`Termek_ID`) REFERENCES `termek` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `rendeles`
--
ALTER TABLE `rendeles`
  ADD CONSTRAINT `fk_rendeles_kertterv` FOREIGN KEY (`Kertterv_ID`) REFERENCES `kertterv` (`ID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Megkötések a táblához `termek`
--
ALTER TABLE `termek`
  ADD CONSTRAINT `fk_termek_kategoria` FOREIGN KEY (`Kategoria_ID`) REFERENCES `kategoria` (`ID`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
