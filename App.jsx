import React, { useState } from 'react';
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
  Clock,
  Dumbbell
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-12">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-400 w-6 h-6 shrink-0" />
            <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">
              Kalkulator <span className="text-emerald-400">Gildii</span>
            </h1>
          </div>
          {/* Desktop Nav */}
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
        {/* Mobile Nav - Scrollable */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-slate-900 border-t border-slate-800 no-scrollbar touch-pan-x">
           {['calculator', 'checklist', 'strategy', 'scripts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-xs font-bold border whitespace-nowrap transition-colors ${
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

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'checklist' && <ChecklistTab />}
        {activeTab === 'strategy' && <StrategyTab />}
        {activeTab === 'scripts' && <ScriptsTab />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-xs md:text-sm mt-8 pb-8">
        <p>Opiera się na twardych danych rynkowych i metodologii z artykułu "Jak DOBRZE podnieść ceny".</p>
      </footer>
    </div>
  );
};

// --- COMPONENTS ---

const CalculatorTab = () => {
  const [clients, setClients] = useState(15);
  const [sessionsPerClient, setSessionsPerClient] = useState(8); // Nowe: średnia liczba treningów
  const [price, setPrice] = useState(150);
  const [increasePercent, setIncreasePercent] = useState(20);
  const [churnPercent, setChurnPercent] = useState(10);

  // Advanced Calculations
  const totalMonthlySessions = clients * sessionsPerClient;
  const currentRevenue = totalMonthlySessions * price;
  
  const newPrice = Math.round(price * (1 + increasePercent / 100));
  
  // Churn applies to CLIENTS (people), which affects sessions
  const clientsLost = Math.round(clients * (churnPercent / 100));
  const clientsLeft = clients - clientsLost;
  
  // Assuming lost clients had average session count
  const sessionsLost = clientsLost * sessionsPerClient;
  const newTotalSessions = totalMonthlySessions - sessionsLost;
  
  const newRevenue = newTotalSessions * newPrice;
  const revenueDiff = newRevenue - currentRevenue;

  // Break Even Calculation: How many sessions/clients can I lose to earn the SAME?
  // CurrentRevenue = (TotalSessions - X_Sessions) * NewPrice
  // X_Sessions = TotalSessions - (CurrentRevenue / NewPrice)
  const breakEvenSessions = Math.floor(totalMonthlySessions - (currentRevenue / newPrice));
  // Convert sessions back to approximate clients for context
  const breakEvenClientsApprox = (breakEvenSessions / sessionsPerClient).toFixed(1);

  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-8 animate-in fade-in zoom-in duration-300">
      <div className="space-y-6">
        <div className="bg-slate-800 p-5 md:p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="text-emerald-400" /> Parametry Biznesu
          </h2>

          <div className="space-y-6">
            {/* Input: Liczba Klientów */}
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                Liczba aktywnych klientów
                <span className="text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded">{clients} os.</span>
              </label>
              <input 
                type="range" min="1" max="50" value={clients} 
                onChange={(e) => setClients(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 touch-manipulation"
              />
            </div>

            {/* Input: Treningi na klienta (NOWE) */}
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                Śr. liczba treningów na klienta / msc
                <span className="text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded">{sessionsPerClient} tr.</span>
              </label>
              <input 
                type="range" min="1" max="20" step="1" value={sessionsPerClient} 
                onChange={(e) => setSessionsPerClient(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 touch-manipulation"
              />
              <p className="text-xs text-slate-500 mt-2 text-right">
                Łącznie prowadzisz: <strong className="text-slate-400">{totalMonthlySessions}</strong> treningów msc.
              </p>
            </div>

            {/* Input: Cena za trening */}
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                Obecna stawka za trening (PLN)
                <span className="text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded">{price} PLN</span>
              </label>
              <input 
                type="range" min="50" max="500" step="10" value={price} 
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 touch-manipulation"
              />
            </div>
            
            <div className="pt-6 border-t border-slate-700">
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                Planowana podwyżka (%)
                <span className="text-blue-400 font-bold bg-blue-900/30 px-2 py-0.5 rounded">{increasePercent}% ({newPrice} PLN)</span>
              </label>
              <input 
                type="range" min="0" max="100" step="5" value={increasePercent} 
                onChange={(e) => setIncreasePercent(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 touch-manipulation"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                Ilu klientów może odejść? (Churn)
                <span className="text-red-400 font-bold bg-red-900/30 px-2 py-0.5 rounded">{churnPercent}% ({clientsLost} os.)</span>
              </label>
              <input 
                type="range" min="0" max="50" step="5" value={churnPercent} 
                onChange={(e) => setChurnPercent(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500 touch-manipulation"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500"></div>
          
          <h2 className="text-xl font-bold mb-6 text-slate-100">Twój Wynik Miesięczny</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/50 p-4 rounded-xl">
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-1">Obecnie (netto)</p>
              <p className="text-xl md:text-2xl font-bold text-slate-200">{currentRevenue.toLocaleString()} PLN</p>
            </div>
            <div className={`bg-slate-900/50 p-4 rounded-xl border ${revenueDiff >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
              <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-1">Po zmianie</p>
              <p className={`text-xl md:text-2xl font-bold ${revenueDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {newRevenue.toLocaleString()} PLN
              </p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Różnica w portfelu</p>
                        <p className="text-xs text-slate-400 hidden md:block">Twój miesięczny zysk ekstra</p>
                    </div>
                </div>
                <span className={`text-lg md:text-xl font-bold ${revenueDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {revenueDiff > 0 ? '+' : ''}{revenueDiff.toLocaleString()} PLN
                </span>
             </div>

             <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Odzyskany czas</p>
                        <p className="text-xs text-slate-400 hidden md:block">Mniej godzin na siłowni</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-lg md:text-xl font-bold text-blue-400 block">
                        {sessionsLost} h
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">miesięcznie</span>
                </div>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
             <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-400 w-6 h-6 shrink-0 mt-1" />
                <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1">Punkt Bezpieczeństwa (BEP)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Aby wyjść na "zero", możesz stracić aż <span className="text-white font-bold">{breakEvenSessions} treningów</span> miesięcznie (ok. {breakEvenClientsApprox} klientów).
                        <br/><br/>
                        Dopóki odejdzie mniej osób, zarabiasz <strong className="text-emerald-400">WIĘCEJ</strong> pracując <strong className="text-blue-400">MNIEJ</strong>.
                    </p>
                </div>
             </div>
          </div>
        </div>
        
        {/* Insight Box based on Logic */}
        <div className={`border p-4 rounded-xl transition-colors ${
            revenueDiff > 0 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'
        }`}>
             <h3 className={`font-bold mb-2 flex items-center gap-2 ${revenueDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <CheckCircle className="w-4 h-4" /> {revenueDiff > 0 ? "Werdykt: OPŁACALNE" : "Werdykt: RYZYKOWNE"}
             </h3>
             <p className="text-sm text-slate-300 leading-relaxed">
                {revenueDiff > 0 
                  ? `Decyzja broni się matematycznie. Zyskujesz ${revenueDiff} PLN i masz ${sessionsLost} godzin wolnego. Możesz te godziny przeznaczyć na marketing i pozyskać klientów po NOWEJ, wyższej stawce.`
                  : "Przy założonym odpływie klientów (Churn) tracisz pieniądze. Rozważ mniejszą podwyżkę, lepszą komunikację (Pre-framing) lub dodanie bonusów (Value Stack), aby zatrzymać więcej osób."}
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
        "Czujesz złość/frustrację, gdy klient odwołuje wizytę.",
        "Klienci traktują Cię jak kumpla, a nie eksperta.",
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
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Czy powinieneś podnieść ceny?</h2>
                <p className="text-slate-400">Zaznacz zdania, które pasują do Twojej obecnej sytuacji.</p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-4 md:p-6 shadow-xl border border-slate-700">
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div 
                            key={index}
                            onClick={() => toggleItem(index)}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border touch-manipulation ${
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
                </div>
            </div>
        </div>
    );
};

const StrategyTab = () => {
    return (
        <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StrategyCard 
                title="Korekta Inflacyjna"
                range="3-5%"
                desc="Kosmetyka. Klient prawie tego nie zauważa, traktuje jako 'koszt życia'. Bezpieczne, nudne, ale konieczne co rok."
                icon={<TrendingUp className="w-6 h-6 text-slate-400" />}
                color="border-slate-500"
            />
            <StrategyCard 
                title="Wzrost Jakości (Growth)"
                range="10-20%"
                desc="Standardowa, zdrowa podwyżka. Masz nowe szkolenia, sprzęt? Dajesz więcej wartości. Wymaga Value Stacking."
                icon={<Users className="w-6 h-6 text-emerald-400" />}
                color="border-emerald-500"
                highlight
            />
            <StrategyCard 
                title="Repozycjonowanie"
                range="30-50%+"
                desc="Rewolucja. Zmieniasz grupę docelową. Liczysz się z dużą wymianą klientów. Tylko przy silnym marketingu."
                icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
                color="border-amber-500"
            />

            <div className="md:col-span-3 mt-4 md:mt-8 bg-slate-800 p-5 md:p-6 rounded-2xl border border-slate-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ArrowRight className="text-emerald-400" /> Strategia Hybrydowa (Rekomendowana)
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <strong className="block text-white mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400"/> Nowi Klienci
                        </strong>
                        <p>Płacą nową stawkę od "dzień dobry". Na stronie WWW i w socialach zmieniasz cennik natychmiast. To testuje Twój nowy rynek.</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <strong className="block text-white mb-2 flex items-center gap-2">
                             <Dumbbell className="w-4 h-4 text-blue-400"/> Starzy Klienci
                        </strong>
                        <p>Dajesz im "okres ochronny" (np. 3 miesiące starej ceny) lub mniejszą podwyżkę (+10% zamiast +20%). To buduje lojalność i zmniejsza ryzyko buntu.</p>
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

Na wstępie wielkie dzięki za Twoje zaangażowanie w ostatnich miesiącach. Widzę, jak [konkretny sukces klienta] i mega mnie to cieszy. Współpraca z Tobą to czysta przyjemność.

Piszę, bo chcę utrzymać najwyższą jakość naszych treningów i dalej inwestować w [sprzęt/edukację], co przełoży się na Twoje wyniki. W związku z tym, od [DATA] aktualizuję cennik moich usług. Cena za pakiet wyniesie [NOWA KWOTA].

Ale uwaga – ponieważ jesteś moim stałym klientem, chcę Ci to wynagrodzić.

Dla Ciebie nowa stawka wejdzie w życie dopiero od [DATA PÓŹNIEJSZA] LUB Masz możliwość wykupienia zapasu treningów po STAREJ cenie do końca miesiąca.

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
        <div className="grid md:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="text-emerald-400" /> Zasady Komunikacji
                    </h3>
                    <ul className="space-y-4 text-sm text-slate-300">
                        <li className="flex gap-2">
                            <span className="text-red-400 font-bold">❌</span>
                            <span>Nie przepraszaj za cenę. To zabija Twój autorytet eksperta.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-400 font-bold">❌</span>
                            <span>Nie tłumacz się własnymi kosztami (czynszem). Mów o korzyściach klienta.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-400 font-bold">✅</span>
                            <span>Metoda Kanapki: Pozytyw (sukcesy) → Info o cenie → Pozytyw (bonus dla stałych).</span>
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
                            className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <Copy className="w-4 h-4"/>}
                            {copied ? "Skopiowano!" : "Kopiuj treść"}
                        </button>
                    </div>
                    <div className="p-4 md:p-6 overflow-x-auto">
                        <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {emailBody}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
