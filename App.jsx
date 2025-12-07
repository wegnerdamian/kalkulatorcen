import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare, 
  Copy, 
  ArrowRight,
  ShieldAlert,
  Wallet,
  Clock
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-12">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-400 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Kalkulator <span className="text-emerald-400">Gildii Trenerów</span></h1>
          </div>
          <nav className="hidden md:flex gap-1 bg-slate-900 p-1 rounded-lg">
            {['calculator', 'checklist', 'strategy', 'scripts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab === 'calculator' && 'Symulator'}
                {tab === 'checklist' && 'Checklista'}
                {tab === 'strategy' && 'Strategia'}
                {tab === 'scripts' && 'Gotowce'}
              </button>
            ))}
          </nav>
        </div>
        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-2 bg-slate-900 border-t border-slate-800 no-scrollbar">
           {['calculator', 'checklist', 'strategy', 'scripts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2 rounded-md text-xs font-medium border ${
                  activeTab === tab 
                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                    : 'border-slate-700 text-slate-400 bg-slate-800'
                }`}
              >
                {tab === 'calculator' && 'Symulator'}
                {tab === 'checklist' && 'Checklista'}
                {tab === 'strategy' && 'Strategia'}
                {tab === 'scripts' && 'Komunikacja'}
              </button>
            ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'checklist' && <ChecklistTab />}
        {activeTab === 'strategy' && <StrategyTab />}
        {activeTab === 'scripts' && <ScriptsTab />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm mt-12">
        <p>Opiera się na twardych danych rynkowych i metodologii z artykułu "Jak DOBRZE podnieść ceny".</p>
      </footer>
    </div>
  );
};

// --- COMPONENTS ---

const CalculatorTab = () => {
  const [clients, setClients] = useState(20);
  const [price, setPrice] = useState(150);
  const [increasePercent, setIncreasePercent] = useState(20);
  const [churnPercent, setChurnPercent] = useState(10);

  // Calculations
  const currentRevenue = clients * price;
  const newPrice = Math.round(price * (1 + increasePercent / 100));
  const clientsLost = Math.round(clients * (churnPercent / 100));
  const newClientCount = clients - clientsLost;
  const newRevenue = newClientCount * newPrice;
  const revenueDiff = newRevenue - currentRevenue;
  const timeSaved = clientsLost; // Assuming 1 session per client unit for simplicity

  // Break Even Calculation: How many clients can I lose to earn the SAME?
  // CurrentRevenue = (Clients - X) * NewPrice
  // X = Clients - (CurrentRevenue / NewPrice)
  const breakEvenClients = Math.floor(clients - (currentRevenue / newPrice));
  const breakEvenPercent = Math.floor((breakEvenClients / clients) * 100);

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-300">
      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="text-emerald-400" /> Parametry Wyjściowe
          </h2>

          <div className="space-y-5">
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                Liczba klientów / sesji msc
                <span className="text-emerald-400 font-bold">{clients}</span>
              </label>
              <input 
                type="range" min="1" max="100" value={clients} 
                onChange={(e) => setClients(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                Obecna stawka (PLN)
                <span className="text-emerald-400 font-bold">{price} PLN</span>
              </label>
              <input 
                type="range" min="50" max="1000" step="10" value={price} 
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                Planowana podwyżka (%)
                <span className="text-blue-400 font-bold">{increasePercent}% ({newPrice} PLN)</span>
              </label>
              <input 
                type="range" min="0" max="100" step="5" value={increasePercent} 
                onChange={(e) => setIncreasePercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Kosmetyka (5%)</span>
                <span>Wzrost (20%)</span>
                <span>Repozycjonowanie (50%+)</span>
              </div>
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                Pesymistyczny scenariusz odejść (Churn)
                <span className="text-red-400 font-bold">{churnPercent}% ({clientsLost} os.)</span>
              </label>
              <input 
                type="range" min="0" max="50" step="5" value={churnPercent} 
                onChange={(e) => setChurnPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <p className="text-xs text-slate-500 mt-2 italic">
                Art: "Jeśli dostarczasz jakość, klienci są mniej wrażliwi niż myślisz."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
          
          <h2 className="text-xl font-bold mb-6 text-slate-100">Twój Wynik</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/50 p-4 rounded-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Obecny Przychód</p>
              <p className="text-2xl font-bold text-slate-200">{currentRevenue.toLocaleString()} PLN</p>
            </div>
            <div className={`bg-slate-900/50 p-4 rounded-xl border ${revenueDiff >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Nowy Przychód</p>
              <p className={`text-2xl font-bold ${revenueDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {newRevenue.toLocaleString()} PLN
              </p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Różnica Finansowa</p>
                        <p className="text-xs text-slate-400">Twój miesięczny zysk netto</p>
                    </div>
                </div>
                <span className={`text-xl font-bold ${revenueDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {revenueDiff > 0 ? '+' : ''}{revenueDiff.toLocaleString()} PLN
                </span>
             </div>

             <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Odzyskany Czas</p>
                        <p className="text-xs text-slate-400">Wolne sloty / mniej godzin</p>
                    </div>
                </div>
                <span className="text-xl font-bold text-blue-400">
                    {clientsLost} slotów
                </span>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
             <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-400 w-6 h-6 shrink-0 mt-1" />
                <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1">Margines bezpieczeństwa</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Aby wyjść na "zero" finansowo, może odejść aż <span className="text-white font-bold">{breakEvenClients} klientów ({breakEvenPercent}%)</span>.
                        Dopóki odejdzie mniej, zarabiasz <strong className="text-emerald-400">WIĘCEJ</strong> pracując <strong className="text-blue-400">MNIEJ</strong>.
                    </p>
                </div>
             </div>
          </div>
        </div>
        
        {/* Insight Box based on Logic */}
        <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl">
             <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Wniosek:
             </h3>
             <p className="text-sm text-emerald-100/80">
                {revenueDiff > 0 
                  ? "Strategia opłacalna. Nawet przy założonym odejściu klientów, Twój portfel rośnie. Odzyskany czas możesz przeznaczyć na marketing, regenerację lub lepszą obsługę pozostałych (Value Stack)."
                  : "Uwaga: Przy tak dużym odejściu klientów (churn), podwyżka jest ryzykowna. Zmniejsz oczekiwany churn poprzez lepszą komunikację (Pre-framing) lub dodanie wartości do oferty."}
             </p>
        </div>
      </div>
    </div>
  );
};

const ChecklistTab = () => {
    const [checkedItems, setCheckedItems] = useState({});

    const items = [
        "Masz listę oczekujących klientów (popyt > podaż).",
        "Nie pamiętasz, kiedy ostatnio ktoś powiedział „za drogo”.",
        "Pracujesz po godzinach, żeby spiąć budżet domowy.",
        "Czujesz złość/frustrację, gdy klient odwołuje wizytę (uderza to w Twój portfel).",
        "Klienci traktują Cię jak kumpla, a nie eksperta (niski autorytet).",
        "Twoje stawki nie zmieniły się od ponad 12-18 miesięcy.",
        "Inwestujesz w szkolenia więcej, niż jesteś w stanie odrobić.",
        "Przyciągasz klientów „problemowych” i roszczeniowych.",
        "Twoja konkurencja o podobnym stażu bierze 30-50% więcej.",
        "Boisz się otworzyć konto bankowe pod koniec miesiąca."
    ];

    const toggleItem = (index) => {
        setCheckedItems(prev => ({...prev, [index]: !prev[index]}));
    };

    const checkedCount = Object.values(checkedItems).filter(Boolean).length;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Czy powinieneś podnieść ceny?</h2>
                <p className="text-slate-400">Zaznacz zdania, które pasują do Twojej obecnej sytuacji.</p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div 
                            key={index}
                            onClick={() => toggleItem(index)}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                checkedItems[index] 
                                    ? 'bg-emerald-900/30 border-emerald-500/50' 
                                    : 'bg-slate-900/50 border-transparent hover:bg-slate-700'
                            }`}
                        >
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                checkedItems[index] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                            }`}>
                                {checkedItems[index] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-sm ${checkedItems[index] ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                                {item}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                    <p className="text-slate-400 mb-2">Twój wynik:</p>
                    <div className="text-3xl font-bold text-white mb-2">{checkedCount} / {items.length}</div>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        checkedCount >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'
                    }`}>
                        {checkedCount >= 3 
                            ? "ZIELONE ŚWIATŁO: Czas na podwyżkę!" 
                            : "Jeszcze stabilnie, ale monitoruj sytuację."}
                    </div>
                    {checkedCount >= 3 && (
                        <p className="mt-4 text-sm text-emerald-400">
                            Masz wystarczająco dużo sygnałów alarmowych. Brak podwyżki w tym momencie to sabotaż własnego biznesu.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const StrategyTab = () => {
    return (
        <div className="grid md:grid-cols-3 gap-4">
            <StrategyCard 
                title="Korekta Inflacyjna"
                range="3-5%"
                desc="Kosmetyka. Klient prawie tego nie zauważa, traktuje jako 'koszt życia'. Bezpieczne, nudne, ale konieczne co rok, aby nie zarabiać realnie mniej."
                icon={<TrendingUp className="w-6 h-6 text-slate-400" />}
                color="border-slate-500"
            />
            <StrategyCard 
                title="Wzrost Jakości (Growth)"
                range="10-20%"
                desc="Standardowa, zdrowa podwyżka biznesowa. Masz nowe szkolenia, sprzęt, doświadczenie? Dajesz realnie więcej wartości. Wymaga Value Stacking."
                icon={<Users className="w-6 h-6 text-emerald-400" />}
                color="border-emerald-500"
                highlight
            />
            <StrategyCard 
                title="Repozycjonowanie"
                range="30-50%+"
                desc="Rewolucja. Zmieniasz grupę docelową (np. z 'dla każdego' na 'dla golfistów'). Liczysz się z dużą wymianą bazy klientów. Tylko przy silnym marketingu."
                icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
                color="border-amber-500"
            />

            <div className="md:col-span-3 mt-8 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ArrowRight className="text-emerald-400" /> Jak to wdrożyć? (Strategia Hybrydowa)
                </h3>
                <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-300">
                    <div>
                        <strong className="block text-white mb-2">1. Nowi Klienci</strong>
                        <p>Wchodzą od razu na wysoką stawkę. Na stronie i w socialach zmieniasz cennik natychmiast.</p>
                    </div>
                    <div>
                        <strong className="block text-white mb-2">2. Starzy Klienci (Lojalność)</strong>
                        <p>Dajesz im "okres ochronny". Informujesz o podwyżce, ale dla nich wchodzi ona np. za 3 miesiące lub jest nieco niższa (np. +10% zamiast +20%). Dzięki temu czują się uprzywilejowani.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StrategyCard = ({ title, range, desc, icon, color, highlight }) => (
    <div className={`bg-slate-800 p-6 rounded-2xl border-t-4 ${color} shadow-lg flex flex-col ${highlight ? 'ring-2 ring-emerald-500/20' : ''}`}>
        <div className="mb-4 flex justify-between items-start">
            <h3 className="font-bold text-lg text-slate-100">{title}</h3>
            {icon}
        </div>
        <div className="text-2xl font-bold mb-4 text-white">{range}</div>
        <p className="text-sm text-slate-400 leading-relaxed flex-grow">
            {desc}
        </p>
    </div>
);

const ScriptsTab = () => {
    const [copied, setCopied] = useState(false);

    const emailBody = `Temat: Ważna aktualizacja dotycząca naszej współpracy 🚀

Cześć [Imię Klienta],

Na wstępie wielkie dzięki za Twoje zaangażowanie w ostatnich miesiącach. Widzę, jak [konkretny sukces klienta, np. poprawiła się Twoja siła/mobilność] i mega mnie to cieszy. Współpraca z Tobą to czysta przyjemność.

Piszę, bo chcę utrzymać najwyższą jakość naszych treningów i dalej inwestować w [nowy sprzęt/aplikację/moje szkolenia], co przełoży się na jeszcze lepsze Twoje wyniki. W związku z tym, od [DATA - np. 1 stycznia] aktualizuję cennik moich usług. Cena za pakiet wyniesie [NOWA KWOTA].

Ale uwaga – ponieważ jesteś moim stałym klientem, chcę Ci to wynagrodzić.

Dla Ciebie nowa stawka wejdzie w życie dopiero od [DATA + 1-2 miesiące później] LUB Masz możliwość wykupienia kolejnego pakietu jeszcze po STAREJ cenie do końca miesiąca.

Chcę, żebyś czuł się doceniony, bo Twoje zaufanie jest dla mnie kluczowe.
Jeśli masz jakiekolwiek pytania – daj znać. Działamy dalej i robimy formę!

Pozdro,
[Twoje Imię]`;

    const handleCopy = () => {
        navigator.clipboard.writeText(emailBody);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="text-emerald-400" /> Zasady Komunikacji
                    </h3>
                    <ul className="space-y-4 text-sm text-slate-300">
                        <li className="flex gap-2">
                            <span className="text-red-400 font-bold">❌</span>
                            <span>Nie przepraszaj ("Przepraszam, ale muszę..."). To zabija autorytet.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-400 font-bold">❌</span>
                            <span>Nie tłumacz się kosztami własnymi ("Czynsz mi wzrósł"). Klienta to nie obchodzi.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-400 font-bold">✅</span>
                            <span>Stosuj <strong>Pre-framing</strong>. Na 2-3 tyg. przed mailem "nad-dowoź" jakość (bądź bardziej dostępny, wyślij bonus).</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-400 font-bold">✅</span>
                            <span>Użyj <strong>Price Fairness</strong>. Pokaż, że inwestujesz w JEGO sukces (nowa apka, sprzęt).</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="md:col-span-3">
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Copy className="w-4 h-4"/>}
                            {copied ? "Skopiowano!" : "Kopiuj treść"}
                        </button>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {emailBody}
                        </pre>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center">
                    * Dostosuj styl do swojego klienta. Inaczej piszesz do Prezesa, inaczej do "ziomka".
                </p>
            </div>
        </div>
    );
};

export default App;
