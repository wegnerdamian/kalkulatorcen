import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare, 
  Copy, 
  ShieldAlert, 
  Wallet, 
  Clock, 
  Sword, 
  ScrollText, 
  Target, 
  Info, 
  Coins, 
  Printer,
  ChevronDown,
  ChevronUp,
  Settings2,
  PieChart
} from 'lucide-react';

// --- UTILS & HELPERS ---

const formatCurrency = (val) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);

// Komponent Inputu z przełącznikiem jednostki (np. % lub Osoby)
const SmartInput = ({ label, value, onChange, min, max, step, unit, secondaryUnit, isSecondary, onToggleUnit, disabled, hint }) => (
  <div className={`mb-5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex justify-between items-end mb-2">
      <label className="text-sm font-medium text-slate-300 flex flex-col">
        {label}
        {hint && <span className="text-[10px] text-slate-500 font-normal">{hint}</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
          step={step}
        />
        {secondaryUnit ? (
            <button 
                onClick={onToggleUnit}
                className="text-[10px] uppercase font-bold bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-400 hover:text-white hover:border-amber-500 transition-all min-w-[3rem]"
            >
                {isSecondary ? secondaryUnit : unit}
            </button>
        ) : (
            <span className="text-xs text-slate-500 w-8 text-center">{unit}</span>
        )}
      </div>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all`}
    />
  </div>
);

// Prosty wykres porównawczy (CSS)
const SimpleBarChart = ({ before, after, label }) => {
    const max = Math.max(before, after) * 1.1 || 1;
    const hBefore = (before / max) * 100;
    const hAfter = (after / max) * 100;

    return (
        <div className="flex items-end h-24 gap-4 mt-2">
            <div className="flex-1 flex flex-col justify-end items-center group">
                <span className="text-[10px] text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{formatCurrency(before)}</span>
                <div style={{ height: `${hBefore}%` }} className="w-full bg-slate-700 rounded-t-sm relative transition-all duration-500"></div>
                <span className="text-[10px] text-slate-500 mt-1">Przed</span>
            </div>
            <div className="flex-1 flex flex-col justify-end items-center group">
                <span className="text-[10px] text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{formatCurrency(after)}</span>
                <div style={{ height: `${hAfter}%` }} className={`w-full rounded-t-sm relative transition-all duration-500 ${after >= before ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] text-white font-bold mt-1">Po</span>
            </div>
        </div>
    );
};

// --- LOGIC ENGINE ---

const calculateMetrics = (params) => {
    const { 
        clients, sessionsPerClient, price, 
        increasePercent, churnValue, churnType, // type: 'percent' | 'count'
        sessionsPerClientAfter, // New: clients might reduce sessions instead of leaving
        fixedCosts, variableCost 
    } = params;

    // 1. Current State
    const currentSessions = clients * sessionsPerClient;
    const currentRevenue = currentSessions * price;
    const currentVariableCosts = currentSessions * variableCost;
    const currentProfit = currentRevenue - fixedCosts - currentVariableCosts;
    const currentHours = currentSessions; // Assumption: 1 session = 1 hour
    const currentEffectiveRate = currentHours > 0 ? currentProfit / currentHours : 0;

    // 2. New State Parameters
    const newPrice = price * (1 + increasePercent / 100);
    
    // Calculate Churn in Clients
    let clientsLost = 0;
    if (churnType === 'percent') {
        clientsLost = clients * (churnValue / 100);
    } else {
        clientsLost = churnValue;
    }
    const clientsLeft = Math.max(0, clients - clientsLost);

    // Calculate New Volume
    // We use sessionsPerClientAfter because existing clients might reduce frequency
    const newSessions = clientsLeft * sessionsPerClientAfter; 
    
    const newRevenue = newSessions * newPrice;
    const newVariableCosts = newSessions * variableCost;
    const newProfit = newRevenue - fixedCosts - newVariableCosts;
    const newHours = newSessions;
    const newEffectiveRate = newHours > 0 ? newProfit / newHours : 0;

    // 3. Deltas & Analysis
    const profitDiff = newProfit - currentProfit;
    const revenueDiff = newRevenue - currentRevenue;
    const hoursSaved = currentHours - newHours;
    
    // Time Value: How much is the saved time worth if sold to NEW clients at NEW price?
    // We use margin (NewPrice - VariableCost) to be precise
    const marginPerSession = newPrice - variableCost;
    const timeValue = Math.max(0, hoursSaved * marginPerSession);

    // Break Even Analysis (How many clients can I lose to keep same PROFIT?)
    // CurrentProfit = (Clients - X) * Sessions * (NewPrice - Var) - Fixed
    // solving for X...
    let breakEvenClients = 0;
    const newMargin = newPrice - variableCost;
    if (newMargin > 0) {
        // Target Profit + Fixed Costs = Total Contribution Margin needed
        const requiredContribution = currentProfit + fixedCosts; 
        const requiredSessions = requiredContribution / newMargin;
        const requiredClients = requiredSessions / sessionsPerClientAfter;
        breakEvenClients = clients - requiredClients;
    }

    return {
        currentRevenue, currentProfit, currentEffectiveRate,
        newRevenue, newProfit, newEffectiveRate, newPrice,
        profitDiff, revenueDiff,
        clientsLost, clientsLeft,
        hoursSaved, timeValue,
        breakEvenClients: breakEvenClients.toFixed(1)
    };
};

// --- MAIN COMPONENT ---

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [showCosts, setShowCosts] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- STATE ---
  const [clients, setClients] = useState(15);
  const [sessions, setSessions] = useState(8);
  const [price, setPrice] = useState(150);
  
  const [increase, setIncrease] = useState(15); // %
  
  const [churnVal, setChurnVal] = useState(10);
  const [churnType, setChurnType] = useState('percent'); // 'percent' or 'count'
  
  const [sessionsAfter, setSessionsAfter] = useState(8); // Nowe: czy klienci ucinają treningi?
  
  const [fixedCosts, setFixedCosts] = useState(2000);
  const [varCost, setVarCost] = useState(0);

  // Sync sessionsAfter when main sessions change (unless user modified it manually, simplify for now)
  useEffect(() => {
    setSessionsAfter(sessions);
  }, [sessions]);

  // --- CALCULATION ---
  const results = calculateMetrics({
      clients, sessionsPerClient: sessions, price,
      increasePercent: increase, churnValue: churnVal, churnType,
      sessionsPerClientAfter: sessionsAfter,
      fixedCosts: showCosts ? fixedCosts : 0, 
      variableCost: showCosts ? varCost : 0
  });

  const verdict = results.profitDiff >= 0 ? 'positive' : 'negative';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900 pb-12">
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <Sword className="text-amber-500 w-5 h-5" />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                GILDIA <span className="text-amber-500">TRENERÓW</span>
                </h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Kalkulator Strategiczny 2.0</p>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'calculator', label: 'Symulator', icon: Calculator },
              { id: 'checklist', label: 'Checklista', icon: CheckCircle },
              { id: 'strategy', label: 'Strategia', icon: Target },
              { id: 'scripts', label: 'Gotowce', icon: ScrollText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  activeTab === tab.id ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

           {/* Mobile Menu Icon Placeholder ( Simplified for this view ) */}
           <div className="md:hidden flex gap-2">
              <button onClick={() => window.print()} className="p-2 text-slate-400"><Printer className="w-5 h-5"/></button>
           </div>
        </div>
         {/* Mobile Nav Bar */}
         <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-slate-950 border-t border-slate-800 no-scrollbar">
           {['calculator', 'checklist', 'strategy', 'scripts'].map(t => (
               <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${activeTab === t ? 'bg-amber-600 border-amber-500 text-white' : 'border-slate-800 text-slate-500'}`}>
                   {t.charAt(0).toUpperCase() + t.slice(1)}
               </button>
           ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'calculator' && (
            <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in zoom-in duration-300">
                
                {/* --- LEFT: INPUTS --- */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* 1. BAZA */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-500" /> Parametry Wyjściowe
                        </h2>
                        
                        <SmartInput label="Liczba aktywnych klientów" value={clients} onChange={setClients} min={1} max={100} step={1} unit="os." />
                        <SmartInput label="Średnia liczba treningów" value={sessions} onChange={setSessions} min={1} max={30} step={1} unit="tr./msc" hint="Na jednego klienta miesięcznie" />
                        <SmartInput label="Obecna stawka" value={price} onChange={setPrice} min={30} max={1000} step={5} unit="PLN" hint="Cena za 1h / 1 trening" />
                        
                        <div className="mt-4 pt-4 border-t border-slate-800">
                             <button onClick={() => setShowCosts(!showCosts)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors w-full">
                                <Coins className={`w-4 h-4 ${showCosts ? 'text-amber-500' : ''}`} />
                                {showCosts ? "Ukryj koszty" : "Uwzględnij koszty (opcjonalne)"}
                                {showCosts ? <ChevronUp className="w-3 h-3 ml-auto"/> : <ChevronDown className="w-3 h-3 ml-auto"/>}
                             </button>
                             {showCosts && (
                                <div className="mt-4 animate-in slide-in-from-top-2">
                                    <SmartInput label="Koszty stałe (miesięcznie)" value={fixedCosts} onChange={setFixedCosts} min={0} max={20000} step={100} unit="PLN" hint="ZUS, czynsz, księgowość, aplikacje" />
                                    <SmartInput label="Koszt zmienny (za trening)" value={varCost} onChange={setVarCost} min={0} max={200} step={5} unit="PLN" hint="Dojazd, % dla klubu, podatek od sztuki" />
                                </div>
                             )}
                        </div>
                    </div>

                    {/* 2. ZMIANA */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-blue-500" /> Symulacja Zmiany
                        </h2>
                        
                        <SmartInput 
                            label="Planowana podwyżka" 
                            value={increase} onChange={setIncrease} min={0} max={100} step={1} unit="%" 
                            hint={`Nowa cena: ${formatCurrency(Math.round(price * (1 + increase/100)))}`}
                        />
                        
                        <SmartInput 
                            label="Przewidywane odejścia (Churn)" 
                            value={churnVal} onChange={setChurnVal} min={0} max={churnType === 'percent' ? 100 : clients} step={churnType === 'percent' ? 1 : 0.5} 
                            unit="%" 
                            secondaryUnit="Os." 
                            isSecondary={churnType === 'count'} 
                            onToggleUnit={() => setChurnType(prev => prev === 'percent' ? 'count' : 'percent')}
                            hint={churnType === 'percent' ? `Odejdzie ok. ${(clients * churnVal/100).toFixed(1)} osób` : `To ${(churnVal/clients*100).toFixed(1)}% Twojej bazy`}
                        />

                        <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-slate-500 underline decoration-slate-700 hover:text-slate-300">
                             {showAdvanced ? "Ukryj zaawansowane" : "Pokaż zaawansowane (zmiana częstotliwości)"}
                        </button>
                        
                        {showAdvanced && (
                             <div className="mt-4 animate-in fade-in">
                                 <SmartInput 
                                    label="Śr. liczba treningów po zmianie" 
                                    value={sessionsAfter} onChange={setSessionsAfter} min={1} max={30} step={1} unit="tr./msc" 
                                    hint="Jeśli klienci nie odejdą, ale zmniejszą pakiety"
                                />
                             </div>
                        )}
                    </div>
                </div>

                {/* --- RIGHT: RESULTS --- */}
                <div className="lg:col-span-7 space-y-6">
                    {/* MAIN CARD */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative min-h-[500px]">
                        <div className={`absolute top-0 w-full h-1.5 bg-gradient-to-r ${verdict === 'positive' ? 'from-slate-700 via-emerald-500 to-emerald-400' : 'from-slate-700 via-red-500 to-red-400'}`}></div>
                        
                        <div className="p-8">
                             <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Miesięczny {showCosts ? "Zysk (Na rękę)" : "Przychód"}</p>
                                    <div className="flex items-baseline gap-4">
                                        <h2 className={`text-4xl md:text-5xl font-black ${verdict === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatCurrency(showCosts ? results.newProfit : results.newRevenue)}
                                        </h2>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${verdict === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {results.profitDiff > 0 ? '+' : ''}{formatCurrency(showCosts ? results.profitDiff : results.revenueDiff)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Poprzednio: {formatCurrency(showCosts ? results.currentProfit : results.currentRevenue)}
                                    </p>
                                </div>
                                <div className="text-right hidden md:block">
                                     <div className="w-32">
                                        <SimpleBarChart 
                                            before={showCosts ? results.currentProfit : results.currentRevenue} 
                                            after={showCosts ? results.newProfit : results.newRevenue} 
                                        />
                                     </div>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                 {/* Karta Czasu */}
                                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                                     <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1"><Clock className="w-5 h-5"/></div>
                                     <div>
                                         <p className="text-sm font-bold text-slate-200">Odzyskany Czas</p>
                                         <p className="text-2xl font-bold text-white my-1">{results.hoursSaved.toFixed(1)} h</p>
                                         <p className="text-xs text-slate-500 leading-tight">
                                             Warte <span className="text-blue-400">{formatCurrency(results.timeValue)}</span> jeśli sprzedasz te godziny nowym klientom po nowej stawce.
                                         </p>
                                     </div>
                                 </div>
                                 {/* Karta Stawki Godzinowej */}
                                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                                     <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 mt-1"><Wallet className="w-5 h-5"/></div>
                                     <div>
                                         <p className="text-sm font-bold text-slate-200">Efektywna Stawka/h</p>
                                         <div className="flex items-end gap-2 my-1">
                                            <p className="text-2xl font-bold text-white">{formatCurrency(results.newEffectiveRate)}</p>
                                            <p className="text-xs text-slate-500 mb-1 line-through">{formatCurrency(results.currentEffectiveRate)}</p>
                                         </div>
                                         <p className="text-xs text-slate-500 leading-tight">
                                             Twój realny zarobek za godzinę pracy {showCosts ? "(po kosztach)" : ""}.
                                         </p>
                                     </div>
                                 </div>
                             </div>

                             {/* Werdykt i BEP */}
                             <div className={`p-5 rounded-xl border ${verdict === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                 <h3 className={`font-bold flex items-center gap-2 mb-2 ${verdict === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {verdict === 'positive' ? <CheckCircle className="w-5 h-5"/> : <ShieldAlert className="w-5 h-5"/>}
                                    {verdict === 'positive' ? "WERDYKT: OPŁACALNE" : "WERDYKT: RYZYKOWNE"}
                                 </h3>
                                 <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                     {verdict === 'positive' 
                                        ? `Nawet tracąc ${results.clientsLost.toFixed(1)} klienta, zarabiasz więcej. Masz mniej pracy i wyższą stawkę godzinową. To podręcznikowy przykład dobrej podwyżki.`
                                        : `Uwaga! Przy takim poziomie odejść tracisz finansowo. Aby ta podwyżka miała sens, churn musi być niższy niż ${(results.breakEvenClients / results.clientsLeft * 100).toFixed(0)}%.`
                                     }
                                 </p>
                                 <div className="flex items-start gap-2 pt-4 border-t border-slate-700/50">
                                     <Info className="w-4 h-4 text-slate-500 mt-0.5" />
                                     <p className="text-xs text-slate-400">
                                         <strong>Próg bólu (Break-Even Point):</strong> Aby wyjść na zero, musiałoby odejść aż <strong className="text-white">{results.breakEvenClients} osób</strong>.
                                         Dopóki tracisz mniej, jesteś na plusie.
                                     </p>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'scripts' && <ScriptsGenerator newPrice={formatCurrency(results.newPrice)} />}
        {activeTab === 'checklist' && <ChecklistTab />}
        {activeTab === 'strategy' && <StrategyTab />}
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ScriptsGenerator = ({ newPrice }) => {
    const [type, setType] = useState('email'); // email, sms, social
    const [tone, setTone] = useState('formal'); // formal, casual
    const [copied, setCopied] = useState(false);
    
    // Simple template engine
    const getTemplate = () => {
        const templates = {
            email: {
                formal: `Szanowny Kliencie,\n\nDziękuję za zaufanie, jakim obdarzasz mnie podczas naszej współpracy. Obserwowanie Twoich postępów to dla mnie ogromna satysfakcja.\n\nAby utrzymać najwyższą jakość usług i dalej inwestować w rozwój naszego zaplecza treningowego, od przyszłego miesiąca wprowadzam korektę cennika. Cena za sesję wyniesie ${newPrice}.\n\nJako stały klient, jesteś objęty okresem ochronnym - Twoja stawka zmieni się dopiero za 2 miesiące. Dziękuję, że jesteś!\n\nPozdrawiam,\nTwoje Imię`,
                casual: `Cześć!\n\nMega się cieszę z formy, którą robimy! 🔥 Chcę dawać z siebie jeszcze więcej, dlatego inwestuję w szkolenia i sprzęt. W związku z tym, od nowego miesiąca lekko zmieniam cennik - trening będzie kosztował ${newPrice}.\n\nAle dla Ciebie (jako mojego stałego zawodnika) mam luz - nowa cena wchodzi dopiero za 8 tygodni. Dzięki, że działamy razem!\n\nPiątka,\nTwoje Imię`
            },
            sms: {
                formal: `Dzień dobry! Informuję o planowanej aktualizacji cennika treningów na ${newPrice}. Dla Ciebie jako stałego klienta nowa stawka obowiązuje dopiero od [DATA]. Dziękuję za zaufanie!`,
                casual: `Hej! Szybkie info: od przyszłego msc zmieniam cennik na ${newPrice}, ale Ciebie to łapie dopiero za 2 miesiące. Dzięki, że trenujesz ze mną! 💪`
            },
            social: {
                formal: `📢 WAŻNE INFO 📢\n\nOd 1. dnia miesiąca aktualizuję cennik moich usług trenerskich. Nowa cena pojedynczego treningu to ${newPrice}.\n\nZmiana ta pozwoli mi na [CEL, np. zakup nowego sprzętu] i podniesienie jakości naszej współpracy. Dziękuję wszystkim obecnym podopiecznym za zaufanie!`,
                casual: `🚀 LEVEL UP 🚀\n\nCały czas idziemy do przodu! Żeby dowozić Wam jeszcze lepszą jakość, od nowego miesiąca zmieniam stawki. Trening solo: ${newPrice}.\n\nObecni klienci mają gwarancję starej ceny jeszcze przez chwilę! Kto chce dołączyć na starych zasadach - macie ostatnie 3 dni! 🔥`
            }
        };
        return templates[type][tone];
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getTemplate());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-4">
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4">Konfigurator</h3>
                        
                        <label className="block text-sm font-medium text-slate-300 mb-2">Kanał komunikacji</label>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {['email', 'sms', 'social'].map(t => (
                                <button 
                                    key={t} onClick={() => setType(t)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${type === t ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <label className="block text-sm font-medium text-slate-300 mb-2">Twój styl</label>
                        <div className="grid grid-cols-2 gap-2">
                             {['formal', 'casual'].map(t => (
                                <button 
                                    key={t} onClick={() => setTone(t)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${tone === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {t === 'formal' ? 'Oficjalny' : 'Luźny'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded text-emerald-500"><Settings2 className="w-4 h-4"/></div>
                            <p className="text-sm text-slate-300 font-bold">Zmienne</p>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Wartości z symulatora zostały wstawione automatycznie.</p>
                        <div className="flex flex-wrap gap-2">
                             <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-amber-500 font-mono border border-slate-700">{newPrice}</span>
                             <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 font-mono border border-slate-700">[DATA]</span>
                             <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 font-mono border border-slate-700">[IMIĘ]</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-8">
                     <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col">
                        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
                            <button onClick={handleCopy} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
                                {copied ? <CheckCircle className="w-3 h-3 text-emerald-500"/> : <Copy className="w-3 h-3"/>} {copied ? "Skopiowano!" : "Kopiuj"}
                            </button>
                        </div>
                        <div className="p-6 flex-grow bg-slate-900/50">
                            <textarea 
                                readOnly 
                                value={getTemplate()} 
                                className="w-full h-full bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Checklist & Strategy Tabs (Simplified for length, but branded)
const ChecklistTab = () => {
    const [checked, setChecked] = useState({});
    const items = ["Popyt > Podaż (kolejka klientów)", "Brak skarg na cenę od 6 msc", "Praca po godzinach", "Frustracja przy odwołaniu wizyty", "Niski autorytet (traktowanie jak kumpla)", "Brak podwyżki od 1.5 roku", "Rosnące koszty szkoleń", "Klienci roszczeniowi", "Konkurencja bierze 30% więcej", "Lęk przed końcem miesiąca"];
    const count = Object.values(checked).filter(Boolean).length;
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                <h2 className="text-3xl font-black text-white mb-2">{count} / {items.length}</h2>
                <p className={`text-sm font-bold uppercase tracking-widest ${count >=3 ? 'text-emerald-500' : 'text-slate-500'}`}>{count >= 3 ? "Podnoś śmiało!" : "Jeszcze chwilę poczekaj"}</p>
            </div>
            <div className="space-y-2">
                {items.map((i, idx) => (
                    <div key={idx} onClick={() => setChecked(p => ({...p, [idx]: !p[idx]}))} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${checked[idx] ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${checked[idx] ? 'border-amber-500 bg-amber-500' : 'border-slate-600'}`}>
                            {checked[idx] && <CheckCircle className="w-4 h-4 text-slate-900" />}
                        </div>
                        <span className={checked[idx] ? 'text-white font-medium' : 'text-slate-400'}>{i}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StrategyTab = () => (
    <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
        {[
            { t: 'Korekta Inflacyjna', v: '3-5%', d: 'Nudna, bezpieczna, coroczna.', c: 'border-slate-500', i: TrendingUp },
            { t: 'Wzrost Jakości', v: '10-20%', d: 'Nowe certyfikaty, sprzęt, lepsza usługa.', c: 'border-amber-500', i: Sword },
            { t: 'Repozycjonowanie', v: '30%+', d: 'Zmiana grupy docelowej. Rewolucja.', c: 'border-red-500', i: Target }
        ].map((s, idx) => (
            <div key={idx} className={`bg-slate-900 p-6 rounded-2xl border-t-4 ${s.c} shadow-xl`}>
                <div className="flex justify-between mb-4"><h3 className="font-bold text-white">{s.t}</h3><s.i className="w-6 h-6 text-slate-500"/></div>
                <div className="text-3xl font-black text-white mb-4">{s.v}</div>
                <p className="text-sm text-slate-400">{s.d}</p>
            </div>
        ))}
    </div>
);

export default App;
