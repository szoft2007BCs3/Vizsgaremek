-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Nov 05. 13:24
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
(10, 'Növényvédelem', 'Rovarirtók, gombaölők és védőhálók'),
(11, 'Utak és Burkolatok', 'Térkövek, kavicsok, lépőkövek, szegélyek és minden, ami az utak és a teraszok építéséhez kell'),
(12, 'Veteményes, Fűszer- és Gyümölcsnövények', 'Zöldség- és fűszernövény palánták, bogyósok és gyümölcsfák');

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
(100, 'Szélkerék Madárriasztó', 'Látványos és mozgó madárriasztó eszköz', 1490.00, 40, 'Magasság: 40 cm', 10),
(101, 'Őszirózsa (Aster)', 'Késő nyári, lila virágú évelő', 1490.00, 50, '40-60 cm', 1),
(102, 'Margaréta (Leucanthemum)', 'Klasszikus fehér szirmú, sárga közepű évelő', 1190.00, 60, '40-80 cm', 1),
(103, 'Cserepes Gerbera', 'Élénk színű, tartós vágott- és dísznövény', 1990.00, 50, '30-40 cm', 1),
(104, 'Kerti Szegfű (Dianthus)', 'Illatos, ezüstös levelű szegélynövény', 1390.00, 50, '20-30 cm', 1),
(105, 'Dália Gumó (3 db)', 'Nagy virágú, nyártól őszig virágzó', 1790.00, 60, '60-120 cm', 1),
(106, 'Írisz (Iris germanica)', 'Nagy virágú, szárazságtűrő kardvirág', 1590.00, 80, '60-90 cm', 1),
(107, 'Nárcisz Hagyma (10 db)', 'Tavaszi sárga virágú hagymás', 1490.00, 20, '30-40 cm', 1),
(108, 'Krókusz Hagyma (20 db)', 'Korán nyíló, gyepbe is ültethető', 1590.00, 15, '8-12 cm', 1),
(109, 'Jácint Hagyma (5 db)', 'Illatos tavaszi virághagyma', 1690.00, 60, '20-30 cm', 1),
(110, 'Liliom Hagyma (3 db)', 'Nagy, illatos virágú liliom', 2190.00, 50, '80-120 cm', 1),
(111, 'Pipacs Mag (5 g)', 'Egynyári, vörös virágú vadvirág', 790.00, 80, '40-70 cm', 1),
(112, 'Búzavirág Mag (5 g)', 'Kék virágú egynyári rétvirág', 790.00, 15, '50-80 cm', 1),
(113, 'Körömvirág Mag (5 g)', 'Narancssárga, gyógyhatású egynyári', 690.00, 12, '30-50 cm', 1),
(114, 'Petúnia Palánta', 'Balkonládába és ágyásba is való, dús virágú', 690.00, 50, '20-30 cm', 1),
(115, 'Begónia Palánta', 'Árnyéktűrő, folyamatosan virágzó', 1290.00, 25, '20-25 cm', 1),
(116, 'Büdöskevirág (Tagetes)', 'Kártevőűző, sárga-narancs egynyári', 590.00, 15, '20-30 cm', 1),
(117, 'Árvácska Palánta', 'Hidegtűrő, tavaszi és őszi virágágyakba', 490.00, 12, '10-20 cm', 1),
(118, 'Százszorszép (Bellis)', 'Apró, fehér-rózsaszín tavaszi virág', 590.00, 60, '10-15 cm', 1),
(119, 'Harangvirág (Campanula)', 'Lila, harang alakú virágú évelő', 1590.00, 8, '20-40 cm', 1),
(120, 'Díszzsálya (Salvia nemorosa)', 'Méhbarát, hosszan virágzó évelő', 1390.00, 80, '40-60 cm', 1),
(121, 'Aranyvessző (Solidago)', 'Késő nyári sárga virágfelhő', 1490.00, 40, '60-100 cm', 1),
(122, 'Napsugárvirág (Helenium)', 'Őszi, rézszínű virágú évelő', 1590.00, 50, '80-120 cm', 1),
(123, 'Párnás Kakukkfű', 'Talajtakaró, illatos kövikert növény', 990.00, 80, '5-10 cm', 1),
(124, 'Varjúháj (Sedum)', 'Aszálytűrő, húsos levelű évelő', 1290.00, 15, '20-40 cm', 1),
(125, 'Fukszia (Fuchsia)', 'Lecsüngő, kétszínű virágú balkonnövény', 1690.00, 80, '30-50 cm', 1),
(126, 'Szívvirág (Dicentra)', 'Árnyékban is díszlő, szív alakú virágok', 1790.00, 8, '60-80 cm', 1),
(127, 'Gólyaorr (Geranium)', 'Talajtakaró, hosszan virágzó évelő', 1490.00, 60, '30-50 cm', 1),
(128, 'Tűzvirág (Phlox subulata)', 'Tavasszal teljesen beborító szőnyegnövény', 1290.00, 12, '10-15 cm', 1),
(129, 'Rezgőfű Díszfű (Briza)', 'Légies, díszes kalászú egynyári fű', 890.00, 8, '30-50 cm', 1),
(130, 'Pompás Díszkáposzta', 'Őszi, színes levélrózsás dísznövény', 990.00, 8, '25-35 cm', 1),
(131, 'Gömbjuhar (Acer platanoides Globosum)', 'Kompakt, gömb alakú lombkoronájú fa', 24900.00, 20, 'Lombkorona: 3-4 m', 2),
(132, 'Kocsányos Tölgy (Quercus robur)', 'Hosszú életű, impozáns árnyékadó fa', 18900.00, 20, 'Lombkorona: 12-15 m', 2),
(133, 'Platán (Platanus acerifolia)', 'Városi környezetet is jól bíró nagy fa', 21900.00, 80, 'Lombkorona: 10-12 m', 2),
(134, 'Kislevelű Hárs (Tilia cordata)', 'Illatos virágú, méhlegelő fa', 17900.00, 8, 'Lombkorona: 8-10 m', 2),
(135, 'Szomorú Nyír (Betula pendula)', 'Fehér törzsű, lecsüngő ágú fa', 14900.00, 50, 'Lombkorona: 5-7 m', 2),
(136, 'Vérbükk (Fagus sylvatica Purpurea)', 'Bordó levelű, díszes fa', 26900.00, 30, 'Lombkorona: 10-12 m', 2),
(137, 'Szomorúfűz (Salix babylonica)', 'Tavak mellé való, lecsüngő ágú fa', 12900.00, 50, 'Lombkorona: 8-10 m', 2),
(138, 'Liliomfa (Magnolia soulangeana)', 'Tavasszal nagy rózsaszín virágokkal borított', 19900.00, 80, 'Lombkorona: 5-6 m', 2),
(139, 'Páfrányfenyő (Ginkgo biloba)', 'Aranysárga őszi lomb, ősi díszfa', 22900.00, 20, 'Lombkorona: 6-8 m', 2),
(140, 'Közönséges Gyertyán (Carpinus betulus)', 'Sövénynek és szoliternek is jó', 8900.00, 60, 'Lombkorona: 6-8 m', 2),
(141, 'Vérmogyoró (Corylus maxima Purpurea)', 'Bordó levelű, termő díszcserje', 6900.00, 20, 'Lombkorona: 3-4 m', 2),
(142, 'Bugás Hortenzia (Hydrangea paniculata)', 'Nyártól őszig virágzó nagy cserje', 6900.00, 25, 'Lombkorona: 1,5-2 m', 2),
(143, 'Futórózsa', 'Pergolára, kerítésre futtatható rózsa', 3490.00, 50, 'Magasság: 2-3 m', 2),
(144, 'Teahibrid Rózsa', 'Nagy, illatos virágú vágórózsa', 2990.00, 8, 'Magasság: 0,8-1 m', 2),
(145, 'Puszpáng (Buxus sempervirens)', 'Metszhető, örökzöld szegély- és formacserje', 2490.00, 12, 'Magasság: 0,5-1 m', 2),
(146, 'Kúszó Kecskerágó (Euonymus)', 'Örökzöld, tarka levelű talajtakaró', 2990.00, 50, 'Magasság: 0,3-0,5 m', 2),
(147, 'Borostyán (Hedera helix)', 'Falra és kerítésre futtatható örökzöld', 1290.00, 25, 'Hossz: 3-5 m', 2),
(148, 'Lonc (Lonicera)', 'Illatos virágú kúszócserje', 1890.00, 40, 'Magasság: 3-4 m', 2),
(149, 'Azálea (Rhododendron)', 'Tavasszal tömegesen virágzó, savanyú talajt kedvelő', 4290.00, 60, 'Magasság: 1-1,5 m', 2),
(150, 'Fagyal (Ligustrum)', 'Gyors növekedésű sövénynövény', 1190.00, 12, 'Magasság: 2-3 m', 2),
(151, 'Oszlopos Boróka (Juniperus)', 'Karcsú, kék-zöld örökzöld', 4490.00, 25, 'Magasság: 2-3 m', 2),
(152, 'Kúszó Boróka (Juniperus horizontalis)', 'Talajtakaró, lapos termetű fenyő', 3290.00, 30, 'Szélesség: 1,5-2 m', 2),
(153, 'Ezüstfenyő (Picea pungens)', 'Kékes tűlevelű, látványos fenyő', 16900.00, 20, 'Lombkorona: 3-4 m', 2),
(154, 'Berkenye (Sorbus aucuparia)', 'Piros bogyós, madárbarát fa', 8900.00, 60, 'Lombkorona: 4-6 m', 2),
(155, 'Díszmandula (Prunus triloba)', 'Tavasszal rózsaszín virágtengerű cserje', 7900.00, 25, 'Lombkorona: 2-3 m', 2),
(156, 'Feketefenyő (Pinus nigra)', 'Szárazságtűrő, robusztus fenyő', 9900.00, 8, 'Lombkorona: 6-8 m', 2),
(157, 'Nyáriorgona (Buddleja davidii)', 'Pillangókat vonzó, hosszan virágzó cserje', 3490.00, 12, 'Lombkorona: 2-3 m', 2),
(158, 'Japán Díszcseresznye Sudár', 'Oszlopos, tavasszal rózsaszín virágzású fa', 18900.00, 80, 'Lombkorona: 2-3 m', 2),
(159, 'Fehér Som (Cornus alba)', 'Piros szárú, télen is díszítő cserje', 2990.00, 12, 'Lombkorona: 1,5-2 m', 2),
(160, 'Árnyéktűrő Fűmag 1 kg', 'Fák alá és árnyékos részekre', 3290.00, 40, '1 kg, 40 m²', 3),
(161, 'Sportgyep Fűmag 2 kg', 'Strapabíró, taposásálló keverék', 6490.00, 12, '2 kg, 80 m²', 3),
(162, 'Sziklakert Fűmag 1 kg', 'Szárazságtűrő, lassú növekedésű', 3890.00, 25, '1 kg, 40 m²', 3),
(163, 'Virágos Rét Magkeverék 500 g', 'Méhbarát, színes vadvirág rét', 4290.00, 40, '500 g, 100 m²', 3),
(164, 'Gyepjavító Fűmag Mix 1 kg', 'Kopásos területek pótlására', 2890.00, 12, '1 kg, 40 m²', 3),
(165, 'Szegélynyíró Kézi Olló', 'Éles pengéjű, hosszú nyelű gyepszegély olló', 4490.00, 8, 'Hossz: 90 cm', 4),
(166, 'Akkus Fűnyíró 36V', 'Hordozható, csendes akkumulátoros fűnyíró', 89900.00, 8, 'Vágásszélesség: 41 cm', 4),
(167, 'Benzines Fűnyíró', 'Önjáró, nagy kertekhez', 129900.00, 20, 'Vágásszélesség: 46 cm', 4),
(168, 'Robotfűnyíró', 'Automatikus gyepnyírás, esőérzékelővel', 249900.00, 20, 'Munkaterület: 800 m²', 4),
(169, 'Akkus Láncfűrész', 'Ágvágáshoz és kisebb fák döntéséhez', 54900.00, 8, 'Laphossz: 30 cm', 4),
(170, 'Akkus Sövénynyíró', 'Könnyű, nagy teljesítményű', 39900.00, 50, 'Penge: 55 cm', 4),
(171, 'Gyepszellőztető Kézi', 'Tüskés talajlazító gyephez', 7990.00, 40, 'Munkaszélesség: 30 cm', 4),
(172, 'Gyephenger Töltethető', 'Gyepsimításhoz, vetés utáni tömörítéshez', 18900.00, 40, 'Szélesség: 50 cm', 4),
(173, 'Akkus Lombfúvó', 'Falevelek eltakarításához', 32900.00, 40, 'Légsebesség: 200 km/h', 4),
(174, 'Kerti Kézikocsi', 'Összecsukható, nagy teherbírású', 17900.00, 12, 'Teherbírás: 150 kg', 4),
(175, 'Gereblye Gyepre', 'Gyepről és ágyásból is gyűjt', 3490.00, 80, 'Szélesség: 50 cm', 4),
(176, 'Esővízgyűjtő Hordó 200L', 'Tetőcsatornához köthető tároló', 14900.00, 20, 'Térfogat: 200 L', 5),
(177, 'Kerti Szivattyú 1000W', 'Kútból és tóból is szivattyúz', 34900.00, 25, '1000 W', 5),
(178, 'Okos Öntözővezérlő WiFi', 'Telefonról vezérelhető, időjárás-érzékelős', 19900.00, 30, '6 zóna', 5),
(179, 'Csepegtető Cső 50m', 'Ágyások és sorok öntözéséhez', 7990.00, 12, '50 méter', 5),
(180, 'Mikroszóró Készlet', 'Nagy ágyásokhoz és pázsithoz', 4990.00, 25, '10 szórófej', 5),
(181, 'Slagtartó Doboz Falra', 'Gyorsan feltekerhető, védett tárolás', 11900.00, 30, 'Hossz: 30 m', 5),
(182, 'Kerti Csap Szerelvény Szett', 'Csatlakozók és adapterek', 3290.00, 8, '6 db/szett', 5),
(183, 'Talajnedvesség Szenzor', 'Vezeték nélküli nedvességmérő', 5990.00, 40, 'Hatótáv: 30 m', 5),
(184, 'Fa Kerti Pad 3 személyes', 'Impregnált fenyő, ívelt háttámlával', 44900.00, 12, '150x60 cm', 6),
(185, 'Összecsukható Kerti Szék', 'Könnyű, aszályálló szövet', 5990.00, 15, '52x52 cm', 6),
(186, 'Rattan Napozóágy', 'Állítható háttámlájú pihenő', 69900.00, 20, '200x70 cm', 6),
(187, 'Kerti Grillasztal', 'Kerti sütéshez és étkezéshez', 59900.00, 12, '180x80 cm', 6),
(188, 'Fa Pergola 3x3 m', 'Futónövényekkel beültethető tartószerkezet', 189900.00, 8, '300x300 cm', 6),
(189, 'Kerti Hintaágy 3 személyes', 'Napellenzővel, párnával', 99900.00, 8, '190x120 cm', 6),
(190, 'Kerti Bárasztal', 'Magas, kültéri asztal', 34900.00, 50, '120x60 cm', 6),
(191, 'Kerti Lugas Szett', 'Ülőgarnitúrás, borított lugas', 229900.00, 50, '300x300 cm', 6),
(192, 'Napelemes Út Lámpa', 'Szolár szegélylámpa, hideg fehér', 1990.00, 15, 'Magasság: 40 cm', 7),
(193, 'Napelemes Fényfüzér 10m', 'Kerti dísz fényfüzér, melegfehér', 4990.00, 60, '10 méter', 7),
(194, 'Mozgásérzékelős Reflektor', 'Ház és kerítés biztonsági világítása', 7990.00, 20, 'Fényerő: 1000 lm', 7),
(195, 'Kerti Fáklya Napelemes', 'Lobogó láng hatású szolár lámpa', 2490.00, 50, 'Magasság: 80 cm', 7),
(196, 'Kerti Álló Lámpa Fekete', 'Kertbe szúrható LED lámpa', 8990.00, 60, 'Magasság: 60 cm', 7),
(197, 'Kerti Fali Lámpa', 'Kültéri, IP65 védettségű', 5990.00, 20, '15x10 cm', 7),
(198, 'Víz Alatti Tó Lámpa', 'Színváltós LED tavi világítás', 6990.00, 15, 'Átmérő: 6 cm', 7),
(199, 'Tápoldat Rózsának 1L', 'Bővebb virágzásért', 2290.00, 40, '1 liter', 8),
(200, 'Orchidea Tápoldat 500ml', 'Cserepes növényekhez', 1990.00, 40, '500 ml', 8),
(201, 'Fűnövekedés Serkentő 5kg', 'Gyorsítja a gyep sűrűsödését', 5990.00, 12, '5 kg', 8),
(202, 'Tőzeg Virágföld 50L', 'Általános minőségi talaj', 1990.00, 40, '50 liter', 8),
(203, 'Komposzt Gyorsító 1kg', 'Felgyorsítja a lebomlást', 1790.00, 40, '1 kg', 8),
(204, 'Csontliszt Szerves Trágya 2kg', 'Lassú lebomlású foszfor', 2490.00, 20, '2 kg', 8),
(205, 'Vermikomposzt 10L', 'Giliszta humusz, minden növénynek', 3490.00, 8, '10 liter', 8),
(206, 'Növénykondicionáló Algakivonat', 'Stresszoldó tápoldat', 2890.00, 25, '500 ml', 8),
(207, 'Tavirózsa (Nymphaea)', 'Sárga virágú vízinövény', 2490.00, 80, 'Tómélység: 30-80 cm', 9),
(208, 'Vízi Nőszirom (Iris pseudacorus)', 'Sárga virágú mocsári növény', 1790.00, 25, 'Magasság: 80-100 cm', 9),
(209, 'Nád (Phragmites)', 'Tópart szegélynövény', 1290.00, 8, 'Magasság: 150-250 cm', 9),
(210, 'Gyékény (Typha)', 'Barna buzogányos vízparti növény', 1490.00, 20, 'Magasság: 100-150 cm', 9),
(211, 'Tó Szűrő Szett', 'Mechanikus és biológiai szűrés', 44900.00, 15, 'Max. 10 000 L', 9),
(212, 'Tó Szivattyú 2000L/h', 'Vízmozgatáshoz és szökőkúthoz', 12900.00, 40, '2000 l/h', 9),
(213, 'Kerti Szobor Angyal', 'Kőhatású díszszobor', 12900.00, 80, 'Magasság: 50 cm', 9),
(214, 'Kerti Madárfürdő', 'Kerámia, talpon álló', 7490.00, 80, 'Átmérő: 40 cm', 9),
(215, 'Kerti Napóra', 'Fém, kerti dísz', 9990.00, 12, 'Átmérő: 30 cm', 9),
(216, 'Kerti Kutya Szobor', 'Aranyos kerti dísz', 4990.00, 8, 'Magasság: 35 cm', 9),
(217, 'Virágtartó Állvány', 'Háromszintes, fém', 8490.00, 15, 'Magasság: 90 cm', 9),
(218, 'Kerti Fa Híd 120cm', 'Kis tavakhoz és patakmederhez', 34900.00, 20, '120x60 cm', 9),
(219, 'Gyomirtó Szer 1L', 'Szelektív, gyepbe is használható', 3990.00, 50, '1 liter', 10),
(220, 'Fűrészporos Csapda', 'Szúnyog és légy elleni', 1490.00, 25, '1 db', 10),
(221, 'Kerti Szúnyogháló Fólia', 'Üvegházakra és sátrakra', 2790.00, 8, '2x5 méter', 10),
(222, 'Ultrahangos Rágcsáló Riasztó', 'Napelemes, kerti', 4990.00, 80, 'Hatótáv: 100 m²', 10),
(223, 'Biokertészeti Kén 500g', 'Lisztharmat ellen', 1990.00, 30, '500 g', 10),
(224, 'Fahéjas Hangyaölő', 'Természetes hangyariasztó', 1790.00, 25, '250 g', 10),
(225, 'Térkő Szürke 20x10x6', 'Behajtóra és gyalogos útra', 5490.00, 40, '1 m²', 11),
(226, 'Térkő Terrakotta 20x10x6', 'Meleg színű burkolat', 5890.00, 12, '1 m²', 11),
(227, 'Zúzottkő 0/32', 'Útalap kiválóan tömöríthető', 3590.00, 12, '1 m³ / 1,6 t', 11),
(228, 'Mosott Kavics 16-32', 'Díszítő és drénező', 4290.00, 12, '25 kg zsák', 11),
(229, 'Fehér Dekor Kavics 16-32', 'Díszkerti kavics', 2990.00, 20, '25 kg zsák', 11),
(230, 'Folyami Kő 40-80', 'Nagyobb, kerek kövek ösvényekhez', 5290.00, 80, '25 kg zsák', 11),
(231, 'Bazalt Zúzalék Fekete', 'Elegáns, sötét burkolat', 4990.00, 20, '25 kg zsák', 11),
(232, 'Mészkő Zúzalék 8-16', 'Világos, stabil felület', 1990.00, 8, '25 kg zsák', 11),
(233, 'Útalap Homok 0/4', 'Burkolat alá, 5 cm rétegnek', 1490.00, 80, '25 kg zsák', 11),
(234, 'Beton Járólap 40x40', 'Teraszra és járdára', 1890.00, 30, '40x40x4 cm', 11),
(235, 'Beton Járólap 50x50 Palamintás', 'Csúszásmentes felület', 2490.00, 30, '50x50x4 cm', 11),
(236, 'Gránit Kockakő 10x10', 'Hagyományos, tartós út', 690.00, 80, '10x10x10 cm', 11),
(237, 'Kerti Lépőkő Kör Ø40', 'Gyepben ösvényhez', 1990.00, 50, 'Ø40 cm', 11),
(238, 'Természetes Pala Lépőkő', 'Szabálytalan, természetes forma', 3290.00, 15, '40-50 cm', 11),
(239, 'Kerti Lépcsőlap 100x35', 'Lépcső burkolásához', 7990.00, 80, '100x35 cm', 11),
(240, 'Beton Lépcsőelem 100', 'Kész, előregyártott lépcső', 14900.00, 50, '100x35x15 cm', 11),
(241, 'WPC Teraszdeszka 2,4m', 'Karbantartásmentes, csúszásmentes', 8990.00, 80, '240x14 cm', 11),
(242, 'Fa Járólap Deszka 1m', 'Impregnált, kerti ösvényhez', 2490.00, 15, '100x14 cm', 11),
(243, 'Gyeprács 50x50', 'Parkolóba és kocsifeljáróra', 1990.00, 40, '50x50 cm', 11),
(244, 'Beton Szegélykő 100', 'Útszegély járdák mellé', 1790.00, 15, '100x20x5 cm', 11),
(245, 'Kerti Ágyásszegély Corten 1m', 'Rozsdás hatású acél szegély', 3990.00, 15, '100x15 cm', 11),
(246, 'Műanyag Útszegély 5m', 'Rugalmas, könnyű telepítésű', 3290.00, 25, '5 méter', 11),
(247, 'Geotextília 1x25m', 'Burkolat alá gyomgátló', 6990.00, 20, '1x25 méter', 11),
(248, 'Fakéreg Mulcs 50L', 'Ösvények és ágyások takarására', 2290.00, 80, '50 liter', 11),
(249, 'Faforgács Ösvényre 50L', 'Természetes, puha felület', 1790.00, 20, '50 liter', 11),
(250, 'Márványzúzalék Fehér', 'Díszes út és ágyás borítás', 3490.00, 20, '25 kg zsák', 11),
(251, 'Klinker Téglaburkolat', 'Hagyományos, színtartó téglaút', 7990.00, 15, '1 m²', 11),
(252, 'Mintás Térkő Hullám', 'Díszes, hullámmintás burkolat', 6990.00, 60, '1 m²', 11),
(253, 'Fugázó Homok Térkőhöz', 'Kötőanyag nélküli fugázáshoz', 1590.00, 20, '25 kg zsák', 11),
(254, 'Kerti Út Kavicsrács', 'Kavicsot stabilizáló rácsos burkolat', 4990.00, 40, '1 m²', 11),
(255, 'Kerti Gázlókő Szett (5 db)', 'Gyors ösvény létrehozáshoz', 7490.00, 50, '5 db/szett', 11),
(256, 'Paradicsom Palánta (Hegyes Bajor)', 'Magas termésű, bő termő fajta', 390.00, 80, '60-100 cm', 12),
(257, 'Paprika Palánta (Kápia)', 'Édes, hosszú, vastag húsú', 390.00, 12, '40-60 cm', 12),
(258, 'Uborka Palánta (Szabadföldi)', 'Gyors növekedésű, bő termő', 390.00, 40, '30-40 cm', 12),
(259, 'Cukkini Palánta', 'Hosszú ideig termő, könnyen gondozható', 390.00, 8, '40-60 cm', 12),
(260, 'Fejes Saláta Palánta', 'Ropogós, gyors növésű', 190.00, 12, '15-20 cm', 12),
(261, 'Retek Mag (10 g)', 'Gyors, 4 hét alatt érő', 490.00, 12, '10 g', 12),
(262, 'Sárgarépa Mag (10 g)', 'Édes, tartósítható fajta', 490.00, 8, '10 g', 12),
(263, 'Vöröshagyma Dughagyma 500g', 'Egészséges vetőhagyma', 1290.00, 60, '500 g', 12),
(264, 'Fokhagyma Fej (5 db)', 'Ültetésre és fogyasztásra', 1490.00, 25, '5 db', 12),
(265, 'Burgonya Vetőgumó 5kg', 'Korai, jó termőképességű', 1990.00, 20, '5 kg', 12),
(266, 'Bazsalikom Cserép', 'Illatos fűszernövény', 890.00, 40, '20-30 cm', 12),
(267, 'Rozmaring Cserép', 'Örökzöld, illatos fűszer', 1190.00, 25, '30-50 cm', 12),
(268, 'Kakukkfű Cserép', 'Szárazságtűrő fűszernövény', 890.00, 40, '10-20 cm', 12),
(269, 'Menta Cserép', 'Gyorsan terjedő, üdítő', 890.00, 80, '30-40 cm', 12),
(270, 'Petrezselyem Mag (5 g)', 'Klasszikus levélzöldség', 390.00, 50, '5 g', 12),
(271, 'Snidling Cserép', 'Fokhagyma ízű fűszernövény', 890.00, 25, '20-30 cm', 12),
(272, 'Oregánó Cserép', 'Mediterrán fűszernövény', 890.00, 60, '30-40 cm', 12),
(273, 'Kapor Mag (5 g)', 'Savanyúsághoz és főzelékhez', 390.00, 15, '5 g', 12),
(274, 'Zsálya Fűszercserép', 'Gyógy- és fűszernövény', 990.00, 12, '30-50 cm', 12),
(275, 'Citromfű (Melissa)', 'Citrom illatú gyógynövény', 890.00, 15, '40-60 cm', 12),
(276, 'Eper Palánta (10 db)', 'Nagy termésű, édes fajta', 1990.00, 20, '10-15 cm', 12),
(277, 'Málna Tő (Autumn Bliss)', 'Őszi termő málnafajta', 1790.00, 50, 'Magasság: 1,5 m', 12),
(278, 'Piros Ribizli Tő', 'Tőből sokat termő bogyós', 2290.00, 60, 'Magasság: 1 m', 12),
(279, 'Szamóca Tő (5 db)', 'Illatos, kistermésű eper', 1490.00, 80, '10-15 cm', 12),
(280, 'Áfonya (Vaccinium)', 'Savanyú talajt kedvelő bogyós', 3490.00, 80, 'Magasság: 0,8 m', 12),
(281, 'Szőlő Tő (Kékfrankos)', 'Borszőlő, rothadásálló fajta', 2490.00, 12, 'Magasság: 2 m', 12),
(282, 'Alma Gyümölcsfa (Jonathan)', 'Magas termőképességű, jól tárolható', 6990.00, 25, 'Lombkorona: 3-4 m', 12),
(283, 'Körte Gyümölcsfa (Vilmos)', 'Klasszikus, édes körtefajta', 6990.00, 20, 'Lombkorona: 3-4 m', 12),
(284, 'Meggy Gyümölcsfa (Érdi Bőtermő)', 'Savanykás, bőtermő', 7490.00, 20, 'Lombkorona: 3-4 m', 12),
(285, 'Szilva Gyümölcsfa (Besztercei)', 'Hagyományos, magyar fajta', 6990.00, 8, 'Lombkorona: 3-4 m', 12),
(286, 'Kajszibarack Gyümölcsfa (Gönci Magyar)', 'Zamatos, magyar fajta', 7490.00, 12, 'Lombkorona: 3-4 m', 12),
(287, 'Őszibarack Gyümölcsfa (Champion)', 'Sárga húsú, édes', 7490.00, 25, 'Lombkorona: 3-4 m', 12);

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
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=288;

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
