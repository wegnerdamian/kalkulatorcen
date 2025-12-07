import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
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
  Activity,
  HeartPulse,
  Dumbbell,
  Apple
} from 'lucide-react';

// --- KONFIGURACJA PROFESJI ---
const PROFESSIONS = {
  trainer: {
    label: "Trener Personalny",
    icon: Dumbbell,
    labels: {
      client: "Aktywni podopieczni",
      session: "Treningów / msc",
      price: "Cena za trening",
      variable: "Koszt dojazdu/siłowni (za trening)"
    }
  },
  dietitian: {
    label: "Dietetyk",
    icon: Apple,
    labels: {
      client: "Aktywni pacjenci",
      session: "Konsultacji/Jadłospisów / msc",
      price: "Cena za wizytę/pakiet",
      variable: "Koszt oprogramowania/materiałów (za szt.)"
    }
  },
  physio: {
    label: "Fizjoterapeuta",
    icon: Activity,
    labels: {
      client: "Pacjenci w miesiącu",
      session: "Wizyt na pacjenta / msc",
      price: "Cena za wizytę",
      variable: "Koszt materiałów (za wizytę)"
    }
  }
};

// --- UTILS ---
const formatCurrency = (val) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);

// --- KOMPONENTY UI ---

// Input z suwakiem i opcjonalnymi markerami
const SmartInput = ({ 
  label, value, onChange, min, max, step, unit, 
  secondaryUnit, isSecondary, onToggleUnit, 
  disabled, hint, markers 
}) => {
  
  const handleInputChange = (e) => {
    let val = Number(e.target.value);
    if (val < min) val = min;
    // Nie blokujemy max przy wpisywaniu ręcznym, chyba że to churn %
    if (unit === '%' && val > 100) val = 100;
    onChange(val);
  };

  return (
    <div className={`mb-6 ${disabled ? 'opacity-50 pointer-events-none' : ''} relative`}>
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-medium text-slate-300 flex flex-col">
          {label}
          {hint && <span className="text-[10px] text-slate-500 font-normal">{hint}</span>}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            className={`w-24 bg-slate-950 border ${value === 0 && !disabled ? 'border-red-500/50' : 'border-slate-700'} rounded px-2 py-1 text-right text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-colors`}
            step={step}
            min={min}
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
      
      <div className="relative h-6 flex items-center">
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all z-10 relative`}
        />
        {/* Markery na suwaku (np. dla Churnu) */}
        {markers && markers.map((m, idx) => (
            <div key={idx} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-0" style={{ left: `${(m.at / max) * 100}%` }}>
                <div className={`w-0.5 h-4 ${m.color} mb-6`}></div>
                <span className={`text-[9px] font-bold uppercase whitespace-nowrap absolute -top-4 ${m.textColor || 'text-slate-500'}`}>{m.label}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

// Prosty wykres porównawczy
const SimpleBarChart = ({ before, after, label, isProfit }) => {
    const max = Math.max(before, after) * 1.1 || 1;
    const hBefore = Math.max(0, (before / max) * 100);
    const hAfter = Math.max(0, (after / max) * 100);

    return (
        <div className="flex items-end h-28 gap-4 mt-2 bg-slate-950/30 p-2 rounded-lg border border-slate-800/50">
            <div className="flex-1 flex flex-col justify-end items-center group relative">
                <span className="text-[10px] text-slate-400 mb-1">{formatCurrency(before)}</span>
                <div style={{ height: `${hBefore}%` }} className="w-full bg-slate-700 rounded-t-sm relative transition-all duration-500 min-h-[4px]"></div>
                <span className="text-[10px] text-slate-500 mt-2 font-medium">PRZED</span>
            </div>
            <div className="flex-1 flex flex-col justify-end items-center group relative">
                <span className={`text-[10px] font-bold mb-1 ${after >= before ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(after)}</span>
                <div style={{ height: `${hAfter}%` }} className={`w-full rounded-t-sm relative transition-all duration-500 min-h-[4px] ${after >= before ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] text-white font-bold mt-2">PO ZMIANIE</span>
            </div>
        </div>
    );
};

// --- SILNIK LOGIKI ---

const calculateMetrics = (params) => {
    const { 
        clients, sessionsPerClient, price, 
        increasePercent, churnValue, churnType, 
        sessionsPerClientAfter, 
        fixedCosts, variableCost 
    } = params;

    // Walidacja podstawowa, żeby nie dzielić przez zero
    const safeClients = Math.max(0, clients);
    const safeSessions = Math.max(0, sessionsPerClient);
    
    // 1. Stan Obecny
    const currentSessions = safeClients * safeSessions;
    const currentRevenue = currentSessions * price;
    const currentVariableCosts = currentSessions * variableCost;
    const currentProfit = currentRevenue - fixedCosts - currentVariableCosts;
    const currentHours = currentSessions; 
    // Stawka godzinowa (netto - po odjęciu kosztów zmiennych i stałych per godzina)
    const currentCostPerHour = currentHours > 0 ? (fixedCosts / currentHours) + variableCost : 0;
    const currentNetHourly = Math.max(0, price - currentCostPerHour);

    // 2. Stan Po Zmianie
    const newPrice = price * (1 + increasePercent / 100);
    
    let clientsLost = 0;
    if (churnType === 'percent') {
        clientsLost = safeClients * (churnValue / 100);
    } else {
        clientsLost = churnValue;
    }
    const clientsLeft = Math.max(0, safeClients - clientsLost);
    const newSessions = clientsLeft * sessionsPerClientAfter; 
    
    const newRevenue = newSessions * newPrice;
    const newVariableCosts = newSessions * variableCost;
    const newProfit = newRevenue - fixedCosts - newVariableCosts;
    const newHours = newSessions;
    
    const newCostPerHour = newHours > 0 ? (fixedCosts / newHours) + variableCost : 0;
    const newNetHourly = Math.max(0, newPrice - newCostPerHour);

    // 3. Delty
    const profitDiff = newProfit - currentProfit;
    const revenueDiff = newRevenue - currentRevenue;
    const hoursSaved = currentHours - newHours;
    
    // Ekwiwalent finansowy czasu (liczony po NOWEJ marży)
    const newMarginPerSession = newPrice - variableCost;
    const timeValue = Math.max(0, hoursSaved * newMarginPerSession);

    // 4. Break Even Point (Próg Opłacalności w liczbie klientów)
    // Ile klientów musi zostać, aby zysk był taki sam?
    // TargetProfit = (Clients * Sessions * (NewPrice - Var)) - Fixed
    // (CurrentProfit + Fixed) / (Sessions * (NewPrice - Var)) = RequiredClients
    let requiredClients = 0;
    const contributionMargin = newPrice - variableCost;
    
    if (contributionMargin > 0 && sessionsPerClientAfter > 0) {
        const requiredContribution = currentProfit + fixedCosts;
        requiredClients = requiredContribution / (sessionsPerClientAfter * contributionMargin);
    }
    
    const maxClientsToLose = Math.max(0, safeClients - requiredClients);

    return {
        currentRevenue, currentProfit, currentNetHourly,
        newRevenue, newProfit, newNetHourly, newPrice,
        profitDiff, revenueDiff,
        clientsLost, clientsLeft,
        hoursSaved, timeValue,
        maxClientsToLose,
        isValid: currentRevenue > 0
    };
};

// --- GŁÓWNY KOMPONENT ---

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  
  // Stan globalny
  const [profession, setProfession] = useState('trainer');
  const [showCosts, setShowCosts] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Stan danych
  const [clients, setClients] = useState(15);
  const [sessions, setSessions] = useState(8);
  const [price, setPrice] = useState(150);
  
  const [increase, setIncrease] = useState(15); 
  const [churnVal, setChurnVal] = useState(10);
  const [churnType, setChurnType] = useState('percent'); 
  const [sessionsAfter, setSessionsAfter] = useState(8); 
  
  const [fixedCosts, setFixedCosts] = useState(2000);
  const [varCost, setVarCost] = useState(0);

  // Synchronizacja sesji
  useEffect(() => { setSessionsAfter(sessions); }, [sessions]);

  // Etykiety
  const labels = PROFESSIONS[profession].labels;
  const CurrentIcon = PROFESSIONS[profession].icon;

  // Obliczenia
  const results = calculateMetrics({
      clients, sessionsPerClient: sessions, price,
      increasePercent: increase, churnValue: churnVal, churnType,
      sessionsPerClientAfter: sessionsAfter,
      fixedCosts: showCosts ? fixedCosts : 0, 
      variableCost: showCosts ? varCost : 0
  });

  const verdict = results.isValid 
    ? (showCosts ? results.profitDiff : results.revenueDiff) >= -10 // Mały bufor na błędy zaokrągleń
        ? 'positive' 
        : 'negative'
    : 'neutral';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900 pb-12">
      
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Logo + Wybór Profesji */}
            <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <Sword className="text-amber-500 w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white leading-none mb-1">
                    GILDIA <span className="text-amber-500">TRENERÓW</span>
                    </h1>
                    <div className="flex gap-2">
                        {Object.entries(PROFESSIONS).map(([key, data]) => (
                            <button
                                key={key}
                                onClick={() => setProfession(key)}
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-all ${profession === key ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                            >
                                {data.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Nawigacja Desktop */}
            <nav className="hidden md:flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
              {[
                { id: 'calculator', label: 'Symulator', icon: Calculator },
                { id: 'checklist', label: 'Checklista', icon: CheckCircle },
                { id: 'strategy', label: 'Strategia', icon: Target },
                { id: 'scripts', label: 'Gotowce', icon: ScrollText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
            
             {/* Mobile Print/Export */}
             <div className="md:hidden absolute top-4 right-4">
                <button onClick={() => window.print()} className="p-2 text-slate-500"><Printer className="w-5 h-5"/></button>
             </div>
          </div>
        </div>
        
        {/* Nawigacja Mobile */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-slate-950 border-t border-slate-800 no-scrollbar">
           {['calculator', 'checklist', 'strategy', 'scripts'].map(t => (
               <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${activeTab === t ? 'bg-amber-600 border-amber-500 text-white' : 'border-slate-800 text-slate-500'}`}>
                   {t === 'calculator' ? 'Symulator' : t.charAt(0).toUpperCase() + t.slice(1)}
               </button>
           ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {activeTab === 'calculator' && (
            <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in zoom-in duration-300">
                
                {/* --- LEWA KOLUMNA: DANE --- */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* 1. BAZA */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <CurrentIcon className="w-4 h-4 text-amber-500" /> Twoje liczby
                        </h2>
                        
                        <SmartInput 
                            label={labels.client} 
                            value={clients} onChange={setClients} min={1} max={200} step={1} unit="os." 
                        />
                        <SmartInput 
                            label={labels.session} 
                            value={sessions} onChange={setSessions} min={1} max={40} step={1} unit={profession === 'trainer' ? 'sesji' : 'wizyt'} 
                            hint="Średnio na jednego klienta" 
                        />
                        <SmartInput 
                            label={labels.price} 
                            value={price} onChange={setPrice} min={0} max={2000} step={10} unit="PLN" 
                        />
                        
                        <div className="mt-6 pt-4 border-t border-slate-800">
                             <button 
                                onClick={() => setShowCosts(!showCosts)} 
                                className={`flex items-center gap-2 text-xs font-bold transition-colors w-full p-2 rounded-lg ${showCosts ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                             >
                                <Coins className={`w-4 h-4 ${showCosts ? 'text-amber-500' : ''}`} />
                                {showCosts ? "Ukryj koszty" : "Uwzględnij koszty (opcjonalne)"}
                                {showCosts ? <ChevronUp className="w-3 h-3 ml-auto"/> : <ChevronDown className="w-3 h-3 ml-auto"/>}
                             </button>
                             
                             {showCosts && (
                                <div className="mt-4 animate-in slide-in-from-top-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <SmartInput label="Koszty stałe (miesięcznie)" value={fixedCosts} onChange={setFixedCosts} min={0} max={50000} step={100} unit="PLN" hint="ZUS, lokal, marketing" />
                                    <SmartInput label={labels.variable} value={varCost} onChange={setVarCost} min={0} max={500} step={5} unit="PLN" hint="Prowizje, dojazd, materiały" />
                                </div>
                             )}
                        </div>
                    </div>

                    {/* 2. ZMIANA */}
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-blue-500" /> Planowana Zmiana
                        </h2>
                        
                        <SmartInput 
                            label="Wzrost ceny (Podwyżka)" 
                            value={increase} onChange={setIncrease} min={0} max={100} step={1} unit="%" 
                            hint={`Nowa cena: ${formatCurrency(Math.round(price * (1 + increase/100)))}`}
                        />
                        
                        <SmartInput 
                            label="Utrata klientów (Churn)" 
                            value={churnVal} onChange={setChurnVal} min={0} max={churnType === 'percent' ? 100 : clients} step={churnType === 'percent' ? 1 : 0.5} 
                            unit="%" 
                            secondaryUnit="Os." 
                            isSecondary={churnType === 'count'} 
                            onToggleUnit={() => setChurnType(prev => prev === 'percent' ? 'count' : 'percent')}
                            hint={churnType === 'percent' ? `Odejdzie ok. ${(clients * churnVal/100).toFixed(1)} osób` : `To ${(churnVal/clients*100).toFixed(1)}% bazy`}
                            markers={churnType === 'percent' ? [
                                { at: 12.5, label: 'ZDROWY', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
                                { at: 20, label: 'OSTRZEŻENIE', color: 'bg-red-500', textColor: 'text-red-500' }
                            ] : null}
                        />

                        <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-slate-500 underline decoration-slate-700 hover:text-slate-300">
                             {showAdvanced ? "Ukryj opcje zaawansowane" : "Pokaż opcje zaawansowane"}
                        </button>
                        
                        {showAdvanced && (
                             <div className="mt-4 animate-in fade-in bg-slate-950 p-3 rounded-lg border border-slate-800">
                                 <SmartInput 
                                    label={`Śr. liczba ${profession === 'trainer' ? 'treningów' : 'wizyt'} po zmianie`} 
                                    value={sessionsAfter} onChange={setSessionsAfter} min={1} max={40} step={1} unit="szt." 
                                    hint="Gdy klient zostaje, ale przychodzi rzadziej"
                                />
                             </div>
                        )}
                    </div>
                </div>

                {/* --- PRAWA KOLUMNA: WYNIKI --- */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {!results.isValid ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed text-slate-500">
                            <ShieldAlert className="w-12 h-12 mb-4 opacity-50"/>
                            <p>Wprowadź dane po lewej stronie, aby zobaczyć wynik.</p>
                        </div>
                    ) : (
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
                            <div className={`absolute top-0 w-full h-1.5 bg-gradient-to-r ${verdict === 'positive' ? 'from-slate-700 via-emerald-500 to-emerald-400' : 'from-slate-700 via-red-500 to-red-400'}`}></div>
                            
                            <div className="p-6 md:p-8">
                                {/* SEKCJA GŁÓWNA */}
                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-8">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            {showCosts ? "Miesięczny ZYSK (na rękę)" : "Miesięczny PRZYCHÓD"}
                                            {showCosts && <span className="bg-slate-800 text-amber-500 px-1.5 rounded text-[9px]">NETTO</span>}
                                        </p>
                                        <div className="flex items-baseline gap-4">
                                            <h2 className={`text-4xl md:text-5xl font-black ${verdict === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {formatCurrency(showCosts ? results.newProfit : results.newRevenue)}
                                            </h2>
                                            <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${verdict === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {results.profitDiff >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingUp className="w-3 h-3 rotate-180"/>}
                                                {results.profitDiff > 0 ? '+' : ''}{formatCurrency(showCosts ? results.profitDiff : results.revenueDiff)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Poprzednio: {formatCurrency(showCosts ? results.currentProfit : results.currentRevenue)}
                                        </p>
                                    </div>
                                    
                                    <div className="w-full md:w-48 hidden sm:block">
                                        <SimpleBarChart 
                                            before={showCosts ? results.currentProfit : results.currentRevenue} 
                                            after={showCosts ? results.newProfit : results.newRevenue}
                                        />
                                    </div>
                                </div>

                                {/* SEKCJA SZCZEGÓŁOWA */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {/* Kalkulator Godzinowy */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-amber-500/10 rounded text-amber-500"><Wallet className="w-4 h-4"/></div>
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Kalkulator Godzinowy</p>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-slate-400">
                                                <span>Godziny pracy:</span>
                                                <span className="text-white">{Math.round(results.currentRevenue/price)}h <span className="text-slate-600">→</span> {Math.round(results.newRevenue/results.newPrice)}h</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                                                <span className="text-slate-400">Stawka "na rękę"/h:</span>
                                                <div className="text-right">
                                                    <div className="font-bold text-white text-lg">{formatCurrency(results.newNetHourly)}</div>
                                                    <div className="text-[10px] text-slate-600 line-through">{formatCurrency(results.currentNetHourly)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Odzyskany Czas */}
                                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-blue-500/10 rounded text-blue-500"><Clock className="w-4 h-4"/></div>
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Twoja Wolność</p>
                                        </div>
                                        
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-2xl font-bold text-white">{results.hoursSaved.toFixed(1)} h</span>
                                            <span className="text-xs text-slate-500">odyskane / msc</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-tight">
                                            To równowartość <span className="text-blue-400 font-bold">{formatCurrency(results.timeValue)}</span> potencjalnego przychodu z nowych klientów (po nowej stawce).
                                        </p>
                                    </div>
                                </div>

                                {/* WERDYKT I PRÓG OPŁACALNOŚCI */}
                                <div className={`p-5 rounded-xl border ${verdict === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <h3 className={`font-bold flex items-center gap-2 mb-2 ${verdict === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {verdict === 'positive' ? <CheckCircle className="w-5 h-5"/> : <ShieldAlert className="w-5 h-5"/>}
                                        {verdict === 'positive' ? "WERDYKT: OPŁACALNE" : "WERDYKT: RYZYKOWNE"}
                                    </h3>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                        {verdict === 'positive' 
                                            ? `Nawet tracąc ${results.clientsLost.toFixed(1)} os., zarabiasz więcej. Masz mniej pracy i wyższą stawkę godzinową. Finansowo jesteś na plusie.`
                                            : `Uwaga! Przy takim poziomie odejść tracisz finansowo. Aby wyjść na zero, musiałoby odejść mniej niż ${results.maxClientsToLose.toFixed(1)} osób.`
                                        }
                                    </p>
                                    <div className="flex items-start gap-2 pt-4 border-t border-slate-700/50">
                                        <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-slate-400">
                                            <strong>Próg opłacalności (Break-Even Point):</strong> Możesz stracić maksymalnie <strong className="text-white">{results.maxClientsToLose.toFixed(1)} os.</strong> (ok. {((results.maxClientsToLose/clients)*100).toFixed(0)}% bazy), żeby wyjść finansowo na zero.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- INNE ZAKŁADKI --- */}
        {activeTab === 'scripts' && <ScriptsGenerator newPrice={formatCurrency(results.newPrice)} professionName={PROFESSIONS[profession].label} />}
        {activeTab === 'checklist' && <ChecklistTab />}
        {activeTab === 'strategy' && <StrategyTab />}
      </main>
    </div>
  );
};

// --- POMOCNICZE KOMPONENTY ZAKŁADEK ---

const ScriptsGenerator = ({ newPrice, professionName }) => {
    const [type, setType] = useState('email');
    const [tone, setTone] = useState('formal');
    const [copied, setCopied] = useState(false);
    
    const getTemplate = () => {
        // Uproszczone szablony - w pełnej wersji można dodać ich więcej zgodnie z prośbą
        const base = tone === 'formal' 
            ? `Szanowni Państwo,\n\nInformuję o planowanej waloryzacji cennika usług (${professionName}). Od przyszłego miesiąca cena wyniesie ${newPrice}.\n\nZmiana ta podyktowana jest wzrostem kosztów operacyjnych oraz inwestycjami w jakość naszej współpracy. Dla obecnych klientów nowa stawka obowiązuje z miesięcznym opóźnieniem.\n\nZ poważaniem,\n[Twoje Imię]`
            : `Hej!\n\nSzybkie info: od przyszłego miesiąca zmieniam cennik na ${newPrice}. Cały czas inwestuję w sprzęt i szkolenia, żebyśmy robili jeszcze lepsze wyniki!\n\nDla Ciebie jako stałego klienta - stara cena zostaje jeszcze przez miesiąc. Dzięki, że jesteś!\n\nPozdro,\n[Twoje Imię]`;
        return base;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getTemplate());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex gap-4">
                        <select value={tone} onChange={(e) => setTone(e.target.value)} className="bg-slate-800 text-slate-300 text-sm rounded px-3 py-1 border border-slate-700">
                            <option value="formal">Styl Oficjalny</option>
                            <option value="casual">Styl Luźny</option>
                        </select>
                    </div>
                    <button onClick={handleCopy} className="text-xs font-bold text-white flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-amber-900/20">
                        {copied ? <CheckCircle className="w-4 h-4"/> : <Copy className="w-4 h-4"/>} {copied ? "Skopiowano!" : "Kopiuj"}
                    </button>
                </div>
                <div className="p-8 bg-slate-900">
                    <textarea 
                        readOnly 
                        value={getTemplate()} 
                        className="w-full h-64 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                    />
                </div>
            </div>
        </div>
    );
};

const ChecklistTab = () => {
    const [checked, setChecked] = useState({});
    const items = [
        "Popyt przewyższa podaż (brak wolnych terminów)", 
        "Brak skarg na cenę od min. 6 miesięcy", 
        "Praca 'po godzinach' by spiąć budżet", 
        "Frustracja gdy klient odwołuje wizytę", 
        "Traktowanie przez klientów jak 'tani zamiennik'", 
        "Brak podwyżki od ponad 1.5 roku", 
        "Znaczący wzrost kosztów działalności/szkoleń", 
        "Klienci roszczeniowi (płacą mało, wymagają dużo)", 
        "Konkurencja o podobnym stażu bierze 30-50% więcej", 
        "Lęk finansowy przed końcem miesiąca"
    ];
    const count = Object.values(checked).filter(Boolean).length;
    
    let status = { text: "POCZEKAJ", color: "text-slate-500", desc: "Twoja sytuacja jest stabilna, ale nie krytyczna." };
    if (count >= 4) status = { text: "ROZWAŻ KOREKTĘ", color: "text-amber-500", desc: "Dobre argumenty za korektą inflacyjną (5-10%)." };
    if (count >= 7) status = { text: "PODNOŚ ŚMIAŁO!", color: "text-emerald-500", desc: "Jesteś zdecydowanie za tani/a. Tracisz pieniądze każdego dnia." };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
                <div className={`absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-${status.color.split('-')[1]}-500 to-transparent opacity-50`}></div>
                <h2 className="text-5xl font-black text-white mb-2">{count} <span className="text-xl text-slate-600 font-medium">/ {items.length}</span></h2>
                <h3 className={`text-xl font-bold uppercase tracking-widest mb-2 ${status.color}`}>{status.text}</h3>
                <p className="text-slate-400 text-sm">{status.desc}</p>
            </div>
            
            <div className="space-y-3">
                {items.map((i, idx) => (
                    <div key={idx} onClick={() => setChecked(p => ({...p, [idx]: !p[idx]}))} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${checked[idx] ? 'bg-amber-500/5 border-amber-500/40' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${checked[idx] ? 'border-amber-500 bg-amber-500 text-slate-900' : 'border-slate-600 text-transparent'}`}>
                            <CheckCircle className="w-4 h-4" />
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
            { t: 'Korekta Inflacyjna', v: '5-8%', d: 'Bezpieczna. Klient traktuje jako "koszt życia". Rób to co rok.', c: 'border-blue-500', i: TrendingUp },
            { t: 'Wzrost Jakości', v: '15-20%', d: 'Masz nowe certyfikaty, lepszy sprzęt? Klient płaci za lepszy wynik.', c: 'border-amber-500', i: Sword },
            { t: 'Repozycjonowanie', v: '30%+', d: 'Zmiana grupy docelowej (np. z "Kowalskiego" na "Biznes"). Rewolucja.', c: 'border-red-500', i: Target }
        ].map((s, idx) => (
            <div key={idx} className={`bg-slate-900 p-6 rounded-2xl border-t-4 ${s.c} shadow-xl group hover:-translate-y-1 transition-transform`}>
                <div className="flex justify-between mb-4"><h3 className="font-bold text-white">{s.t}</h3><s.i className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors"/></div>
                <div className="text-3xl font-black text-white mb-4">{s.v}</div>
                <p className="text-sm text-slate-400 leading-relaxed">{s.d}</p>
            </div>
        ))}
    </div>
);

export default App;
