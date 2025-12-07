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
  Dumbbell,
  Sword,
  ScrollText,
  Target,
  ArrowLeftRight,
  Info,
  Coins,
  BarChart3
} from 'lucide-react';

// --- HELPER COMPONENTS ---

// Komponent łączący Slider z Inputem
const DualInput = ({ label, value, onChange, min, max, step, unit, color = "accent-amber-500", disabled = false }) => (
  <div className={`mb-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
        />
        <span className="ml-2 text-xs text-slate-500 w-8">{unit}</span>
      </div>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${color}`}
    />
  </div>
);

// Prosty wykres słupkowy dla trybu PRO
const ComparisonChart = ({ scenarioA, scenarioB, showCosts }) => {
    const maxVal = Math.max(scenarioA.newRevenue, scenarioB.newRevenue) * 1.1; // 10% bufor
    
    const Bar = ({ label, revenue, profit, color }) => {
        const heightRevenue = (revenue / maxVal) * 100;
        const heightProfit = (profit / maxVal) * 100;
        
        return (
            <div className="flex flex-col items-center flex-1 mx-2 group">
                <div className="relative w-full bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-32 md:h-40 transition-all">
                    {/* Revenue Bar */}
                    <div 
                        style={{ height: `${heightRevenue}%` }} 
                        className={`w-full ${color} opacity-30 absolute bottom-0 transition-all duration-500`}
                    ></div>
                    {/* Profit Bar (on top if costs enabled, else same as revenue) */}
                    <div 
                        style={{ height: `${showCosts ? heightProfit : heightRevenue}%` }} 
                        className={`w-full ${color} absolute bottom-0 transition-all duration-500 flex items-end justify-center pb-1`}
                    >
                        <span className="text-[10px] font-bold text-slate-900 bg-white/80 px-1 rounded shadow-sm">
                            {(showCosts ? profit : revenue).toLocaleString()}
                        </span>
                    </div>
                </div>
                <span className="text-xs font-bold mt-2 text-slate-400">{label}</span>
                {showCosts && <span className="text-[10px] text-slate-500">Zysk</span>}
            </div>
        );
    };

    return (
        <div className="flex justify-center items-end h-full w-full pt-4 pb-2 px-2 bg-slate-950/30 rounded-xl border border-slate-800 mb-6">
            <Bar 
                label="Scenariusz A" 
                revenue={scenarioA.newRevenue} 
                profit={scenarioA.newProfit} 
                color="bg-blue-500" 
            />
            <Bar 
                label="Scenariusz B" 
                revenue={scenarioB.newRevenue} 
                profit={scenarioB.newProfit} 
                color="bg-amber-500" 
            />
        </div>
    );
};

// --- MAIN APP ---

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900 pb-12">
      {/* HEADER GILDII */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <Sword className="text-amber-500 w-5 h-5 shrink-0" />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                GILDIA <span className="text-amber-500">TRENERÓW</span>
                </h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Kalkulator Strategiczny</p>
            </div>
          </div>
          
          {/* Desktop Nav */}
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
                  activeTab === tab.id 
                    ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-3 bg-slate-950 border-t border-slate-800 no-scrollbar touch-pan-x">
           {[
              { id: 'calculator', label: 'Symulator' },
              { id: 'checklist', label: 'Checklista' },
              { id: 'strategy', label: 'Strategia' },
              { id: 'scripts', label: 'Komunikacja' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold border whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-amber-600 border-amber-500 text-white' 
                    : 'border-slate-800 text-slate-400 bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'checklist' && <ChecklistTab />}
        {activeTab === 'strategy' && <StrategyTab />}
        {activeTab === 'scripts' && <ScriptsTab />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 text-center text-slate-600 text-xs mt-12 pb-8 border-t border-slate-800 pt-8">
        <p className="mb-2">Narzędzie przygotowane dla społeczności Gildii Trenerów.</p>
        <p>Opiera się na twardych danych rynkowych i metodologii Price Fairness.</p>
      </footer>
    </div>
  );
};

// --- LOGIC HELPER ---
const calculateScenario = (clients, sessionsPerClient, price, increasePercent, churnPercent, fixedCosts = 0, variableCostPerSession = 0, useCosts = false) => {
    // Current State
    const totalSessions = clients * sessionsPerClient;
    const currentRevenue = totalSessions * price;
    const currentTotalVariableCosts = totalSessions * variableCostPerSession;
    const currentProfit = useCosts ? (currentRevenue - fixedCosts - currentTotalVariableCosts) : currentRevenue;
    
    const currentHourlyRate = totalSessions > 0 ? currentRevenue / totalSessions : 0;
    const currentEffectiveHourlyRate = totalSessions > 0 ? currentProfit / totalSessions : 0; // zysk na godzinę

    // New State
    const newPrice = Math.round(price * (1 + increasePercent / 100));
    const clientsLost = Math.round(clients * (churnPercent / 100));
    const clientsLeft = clients - clientsLost;
    
    const sessionsLost = clientsLost * sessionsPerClient;
    const newTotalSessions = totalSessions - sessionsLost;
    const newRevenue = newTotalSessions * newPrice;
    
    const newTotalVariableCosts = newTotalSessions * variableCostPerSession;
    const newProfit = useCosts ? (newRevenue - fixedCosts - newTotalVariableCosts) : newRevenue;
    
    const newHourlyRate = newTotalSessions > 0 ? newRevenue / newTotalSessions : 0;
    const newEffectiveHourlyRate = newTotalSessions > 0 ? newProfit / newTotalSessions : 0; // zysk na godzinę
    
    // Differences
    const revenueDiff = newRevenue - currentRevenue;
    const profitDiff = newProfit - currentProfit;
    
    // Jeśli używamy kosztów, metryką sukcesu jest Różnica w Zysku, jeśli nie - Różnica w Przychodzie
    const financialDiff = useCosts ? profitDiff : revenueDiff;
    const financialChangePercent = (useCosts ? currentProfit : currentRevenue) > 0 
        ? (financialDiff / (useCosts ? currentProfit : currentRevenue)) * 100 
        : 0;
    
    // Wycena odzyskanego czasu
    // Jeśli mamy koszty zmienne, to "odzyskana godzina" to też zaoszczędzony koszt (np. paliwo)
    // Ale w kontekście opportunity cost, liczymy ile byśmy ZAROBILI na nowej stawce (marża)
    const marginPerSession = newPrice - (useCosts ? variableCostPerSession : 0);
    const timeValue = sessionsLost * marginPerSession;
    
    // Break Even Point (Ile klientów może odejść, aby wyjść na zero w ZYSKU)
    // Profit_Current = Profit_New
    // (Clients * Sessions * (Price - Var)) - Fixed = ((Clients - X) * Sessions * (NewPrice - Var)) - Fixed
    // Clients * (Price - Var) = (Clients - X) * (NewPrice - Var)
    // X = Clients - ( Clients * (Price - Var) / (NewPrice - Var) )
    const marginCurrent = price - (useCosts ? variableCostPerSession : 0);
    const marginNew = newPrice - (useCosts ? variableCostPerSession : 0);
    
    let breakEvenClients = 0;
    if (marginNew > 0) {
        breakEvenClients = clients - ((clients * marginCurrent) / marginNew);
    }
    // Jeśli marginNew <= 0 to znaczy że dokładamy do interesu, więc BEP nie istnieje (jest 0)

    return {
        currentRevenue,
        newRevenue,
        currentProfit,
        newProfit,
        financialDiff, // GŁÓWNA METRYKA ZMIANY
        financialChangePercent,
        clientsLost,
        clientsLeft,
        sessionsLost,
        newPrice,
        currentHourlyRate,
        newHourlyRate,
        currentEffectiveHourlyRate, // net hourly
        newEffectiveHourlyRate, // net hourly
        timeValue,
        breakEvenClients: Math.floor(breakEvenClients)
    };
};


// --- CALCULATOR TAB ---

const CalculatorTab = () => {
  // Global State
  const [mode, setMode] = useState('basic'); // basic, pro
  const [proModeType, setProModeType] = useState('compare'); // compare, reverse
  const [showCosts, setShowCosts] = useState(false);

  // Base Inputs
  const [clients, setClients] = useState(15);
  const [sessionsPerClient, setSessionsPerClient] = useState(8);
  const [price, setPrice] = useState(150);
  
  // Costs Inputs
  const [fixedCosts, setFixedCosts] = useState(2000); // np. ZUS, czynsz
  const [variableCost, setVariableCost] = useState(0); // np. dojazd, % dla klubu

  // Scenario A Inputs (Used for Basic & Pro A)
  const [increaseA, setIncreaseA] = useState(20);
  const [churnA, setChurnA] = useState(10);

  // Scenario B Inputs (Used for Pro Comparison)
  const [increaseB, setIncreaseB] = useState(10);
  const [churnB, setChurnB] = useState(5);

  // Reverse Inputs
  const [targetRevenue, setTargetRevenue] = useState(20000);
  const [maxChurn, setMaxChurn] = useState(15);

  // Calculations
  const scenarioA = calculateScenario(clients, sessionsPerClient, price, increaseA, churnA, fixedCosts, variableCost, showCosts);
  const scenarioB = calculateScenario(clients, sessionsPerClient, price, increaseB, churnB, fixedCosts, variableCost, showCosts);

  // Reverse Calculation Logic (simplified for Revenue target)
  const calculateReverse = () => {
    const currentClientsAfterChurn = clients * (1 - maxChurn / 100);
    const totalSessionsAfterChurn = currentClientsAfterChurn * sessionsPerClient;
    
    if (totalSessionsAfterChurn <= 0) return { requiredPrice: 0, requiredIncrease: 0 };

    const requiredPrice = targetRevenue / totalSessionsAfterChurn;
    const requiredIncrease = ((requiredPrice - price) / price) * 100;
    
    return {
        requiredPrice: Math.ceil(requiredPrice),
        requiredIncrease: Math.ceil(requiredIncrease)
    };
  };

  const reverseResult = calculateReverse();

  // Verdict Helper
  const getVerdict = (diff) => {
      if (diff > 50) return { text: "OPŁACALNE", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      if (diff < -50) return { text: "RYZYKOWNE", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
      return { text: "BEZ ZMIAN", color: "text-slate-400", bg: "bg-slate-800", border: "border-slate-700" };
  };

  return (
    <div className="animate-in fade-in zoom-in duration-300">
      
      {/* MODE SWITCHER */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex relative">
           <button 
             onClick={() => setMode('basic')}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'basic' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
           >
             BASIC
           </button>
           <button 
             onClick={() => setMode('pro')}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'pro' ? 'bg-amber-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
           >
             PRO <span className="text-[10px] bg-black/20 px-1.5 rounded">beta</span>
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PARAMETERS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-amber-500 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5" /> BAZA KLIENTÓW
            </h2>

            <DualInput 
              label="Liczba aktywnych klientów" 
              value={clients} onChange={setClients} min={1} max={100} unit="os." 
            />
            <DualInput 
              label="Śr. liczba treningów na klienta" 
              value={sessionsPerClient} onChange={setSessionsPerClient} min={1} max={20} unit="tr/msc" 
            />
            <DualInput 
              label="Obecna stawka za trening" 
              value={price} onChange={setPrice} min={50} max={1000} step={10} unit="PLN" 
            />
            
            {/* COSTS TOGGLE */}
            <div className="mt-6 pt-4 border-t border-slate-800">
                <button 
                    onClick={() => setShowCosts(!showCosts)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors w-full"
                >
                    <Coins className={`w-4 h-4 ${showCosts ? 'text-amber-500' : ''}`} />
                    {showCosts ? "Ukryj koszty" : "Uwzględnij koszty (Opcjonalne)"}
                </button>
                
                {showCosts && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                        <DualInput 
                            label="Koszty stałe (mies.)" 
                            value={fixedCosts} onChange={setFixedCosts} min={0} max={20000} step={100} unit="PLN" color="accent-slate-500"
                        />
                        <DualInput 
                            label="Koszt zmienny (za 1h)" 
                            value={variableCost} onChange={setVariableCost} min={0} max={500} step={10} unit="PLN" color="accent-slate-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">
                            *Wliczając koszty, kalkulator pokaże zmianę <strong>DOCHODU</strong> (zysku), a nie przychodu.
                        </p>
                    </div>
                )}
            </div>
          </div>

          {mode === 'basic' && (
             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-400 border-b border-slate-800 pb-3">
                  <Calculator className="w-5 h-5" /> PARAMETRY ZMIANY
                </h2>
                <DualInput 
                  label="Planowana podwyżka" 
                  value={increaseA} onChange={setIncreaseA} min={0} max={100} step={1} unit="%" color="accent-blue-500"
                />
                <DualInput 
                  label="Szacowany churn (odejścia)" 
                  value={churnA} onChange={setChurnA} min={0} max={50} step={1} unit="%" color="accent-red-500"
                />
             </div>
          )}

          {mode === 'pro' && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
               <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
                 <button 
                    onClick={() => setProModeType('compare')}
                    className={`flex-1 text-xs font-bold py-2 rounded border transition-all ${proModeType === 'compare' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:bg-slate-800'}`}
                 >
                    PORÓWNANIE (A/B)
                 </button>
                 <button 
                    onClick={() => setProModeType('reverse')}
                    className={`flex-1 text-xs font-bold py-2 rounded border transition-all ${proModeType === 'reverse' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:bg-slate-800'}`}
                 >
                    OD CELU (REVERSE)
                 </button>
               </div>

               {proModeType === 'compare' ? (
                 <div className="space-y-8">
                    <div>
                        <div className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider">Scenariusz A</div>
                        <DualInput label="Podwyżka A" value={increaseA} onChange={setIncreaseA} min={0} max={100} step={1} unit="%" color="accent-blue-500"/>
                        <DualInput label="Churn A" value={churnA} onChange={setChurnA} min={0} max={50} step={1} unit="%" color="accent-red-500"/>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-amber-400 mb-4 uppercase tracking-wider">Scenariusz B</div>
                        <DualInput label="Podwyżka B" value={increaseB} onChange={setIncreaseB} min={0} max={100} step={1} unit="%" color="accent-amber-500"/>
                        <DualInput label="Churn B" value={churnB} onChange={setChurnB} min={0} max={50} step={1} unit="%" color="accent-red-500"/>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <p className="text-xs text-slate-400 mb-4">Podaj ile chcesz zarabiać i ilu klientów możesz stracić, a policzymy o ile musisz podnieść ceny.</p>
                    <DualInput label="Cel Przychodu (Mies.)" value={targetRevenue} onChange={setTargetRevenue} min={5000} max={100000} step={500} unit="PLN" />
                    <DualInput label="Maksymalny Churn" value={maxChurn} onChange={setMaxChurn} min={0} max={50} step={1} unit="%" color="accent-red-500" />
                 </div>
               )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* RESULTS CARD */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative min-h-[400px]">
             
             {/* Dynamic Top Gradient */}
             <div className={`absolute top-0 w-full h-1 bg-gradient-to-r ${mode === 'basic' ? 'from-slate-700 via-blue-500 to-emerald-500' : 'from-amber-600 via-yellow-500 to-amber-600'}`}></div>

             <div className="p-6 md:p-8">
                {/* --- BASIC MODE RESULTS --- */}
                {mode === 'basic' && (
                    <BasicResultsView 
                        current={showCosts ? scenarioA.currentProfit : scenarioA.currentRevenue} 
                        scenario={scenarioA} 
                        verdict={getVerdict(scenarioA.financialDiff)}
                        showCosts={showCosts} 
                    />
                )}

                {/* --- PRO MODE: COMPARE --- */}
                {mode === 'pro' && proModeType === 'compare' && (
                    <>
                    <div className="mb-8">
                        <ComparisonChart scenarioA={scenarioA} scenarioB={scenarioB} showCosts={showCosts} />
                        
                        <div className="col-span-2 mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                            <p className="text-slate-400 text-xs uppercase mb-1">
                                Różnica w {showCosts ? "Zysku (Dochodzie)" : "Przychodzie"}
                            </p>
                            <p className={`text-xl font-bold ${scenarioB.financialDiff - scenarioA.financialDiff >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                                {(showCosts ? (scenarioB.newProfit - scenarioA.newProfit) : (scenarioB.newRevenue - scenarioA.newRevenue)).toLocaleString()} PLN
                            </p>
                            <p className="text-xs text-slate-500">
                                na korzyść {scenarioB.financialDiff >= scenarioA.financialDiff ? 'Scenariusza B' : 'Scenariusza A'}
                            </p>
                        </div>
                    </div>
                    </>
                )}

                {/* --- PRO MODE: REVERSE --- */}
                {mode === 'pro' && proModeType === 'reverse' && (
                    <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4">
                        <Target className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Wymagana Podwyżka</h3>
                        <div className="text-5xl md:text-6xl font-black text-white mb-2">
                            {reverseResult.requiredIncrease > 0 ? reverseResult.requiredIncrease.toFixed(1) : 0}%
                        </div>
                        <p className="text-xl text-amber-400 font-bold mb-8">
                            Nowa stawka: {reverseResult.requiredPrice > 0 ? reverseResult.requiredPrice : 0} PLN
                        </p>
                        
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-left max-w-md mx-auto">
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Aby osiągnąć cel <strong className="text-white">{targetRevenue.toLocaleString()} PLN</strong> przy odejściu <strong className="text-red-400">{maxChurn}%</strong> klientów, musisz podnieść cenę o min. <strong>{reverseResult.requiredIncrease.toFixed(1)}%</strong>.
                            </p>
                        </div>
                    </div>
                )}
             </div>

             {/* FOOTER NOTES */}
             <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-start gap-3">
                <Info className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed">
                    <strong>Założenia modelu:</strong> 1 trening = 1 godzina pracy. Model zakłada, że liczba treningów na klienta pozostaje bez zmian po podwyżce (chyba że klient odejdzie całkowicie). Wyniki {showCosts ? "uwzględniają" : "nie uwzględniają"} kosztów stałych/zmiennych.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS FOR RESULTS ---

const BasicResultsView = ({ current, scenario, verdict, showCosts }) => (
    <>
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Obecny {showCosts ? "Zysk (Dochód)" : "Przychód"}
                </p>
                <p className="text-2xl font-bold text-slate-300">{current.toLocaleString()} PLN</p>
                <p className="text-xs text-slate-600 mt-1">
                    {(showCosts ? scenario.currentEffectiveHourlyRate : scenario.currentHourlyRate).toFixed(0)} PLN/h (na rękę)
                </p>
            </div>
            <div className={`bg-slate-950/50 p-4 rounded-xl border ${verdict.border} relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 p-1 px-2 text-[10px] font-bold ${verdict.bg} ${verdict.color} rounded-bl-lg`}>
                    {scenario.financialChangePercent > 0 ? '+' : ''}{scenario.financialChangePercent.toFixed(1)}%
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    {showCosts ? "Zysk" : "Przychód"} po zmianie
                </p>
                <p className={`text-2xl font-bold ${scenario.financialDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(showCosts ? scenario.newProfit : scenario.newRevenue).toLocaleString()} PLN
                </p>
                <p className="text-xs text-slate-500 mt-1 flex gap-2">
                    <span>
                        {(showCosts ? scenario.newEffectiveHourlyRate : scenario.newHourlyRate).toFixed(0)} PLN/h (na rękę)
                    </span>
                </p>
            </div>
        </div>

        <div className="space-y-4 mb-8">
             <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${scenario.financialDiff >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200">
                            Różnica w {showCosts ? "Kieszeni (Zysk)" : "Przychodzie"}
                        </p>
                        <p className="text-xs text-slate-400">Ile więcej/mniej zarobisz miesięcznie</p>
                    </div>
                </div>
                <span className={`text-2xl font-black ${scenario.financialDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scenario.financialDiff > 0 ? '+' : ''}{scenario.financialDiff.toLocaleString()} PLN
                </span>
             </div>

             <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200">Odzyskany Czas</p>
                        <p className="text-xs text-slate-400">
                            Ekwiwalent: <span className="text-blue-300 font-bold">{Math.round(scenario.timeValue)} PLN</span> marży
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-blue-400 block">
                        {scenario.sessionsLost} h
                    </span>
                </div>
             </div>
        </div>

        <div className={`p-4 rounded-xl border ${verdict.border} ${verdict.bg}`}>
             <h3 className={`font-bold mb-2 flex items-center gap-2 ${verdict.color}`}>
                {scenario.financialDiff >= 0 ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                WERDYKT: {verdict.text}
             </h3>
             <p className="text-sm text-slate-300 leading-relaxed">
                {scenario.financialDiff > 50 
                  ? `Przy podwyżce o ${((scenario.newPrice/150 - 1)*100).toFixed(0)}% (do ${scenario.newPrice} PLN) możesz stracić ok. ${scenario.clientsLost} klientów, a i tak zarabiasz ${scenario.financialDiff.toLocaleString()} PLN więcej. Do tego masz ${scenario.sessionsLost}h wolnego.`
                  : scenario.financialDiff < -50
                  ? `Uwaga! Przy takim poziomie odejść (${scenario.clientsLost} os.) podwyżka Ci się nie opłaca - tracisz ${Math.abs(scenario.financialDiff).toLocaleString()} PLN. Musisz zmniejszyć churn (lepsza komunikacja) lub podnieść cenę bardziej.`
                  : "Finansowo wychodzisz praktycznie na zero. Głównym zyskiem jest tutaj wolny czas."
                }
                <br/><br/>
                <span className="text-xs text-slate-400 block border-t border-slate-700/50 pt-2 mt-2">
                    <strong className="text-white">Break-Even Point (BEP):</strong> 
                    Aby wyjść finansowo na zero przy tej podwyżce, musiałoby odejść aż 
                    <strong className="text-white"> {scenario.breakEvenClients} klientów</strong>.
                    Dopóki odejdzie mniej, jesteś na plusie.
                </span>
             </p>
        </div>
    </>
);

// --- OTHER TABS (Checklist, Strategy, Scripts) remain same but imported to keep single file structure ---
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
    const toggleItem = (index) => setCheckedItems(prev => ({...prev, [index]: !prev[index]}));
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 text-white">Czy powinieneś podnieść ceny?</h2>
                <p className="text-slate-400">Zaznacz zdania, które pasują do Twojej obecnej sytuacji.</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} onClick={() => toggleItem(index)} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${checkedItems[index] ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-transparent hover:bg-slate-800'}`}>
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${checkedItems[index] ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                                {checkedItems[index] && <CheckCircle className="w-3.5 h-3.5 text-slate-900" />}
                            </div>
                            <span className={`text-sm ${checkedItems[index] ? 'text-amber-100 font-medium' : 'text-slate-400'}`}>{item}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <div className="text-4xl font-black text-white mb-2">{checkedCount} <span className="text-lg text-slate-500 font-normal">/ {items.length}</span></div>
                    <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${checkedCount >= 3 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-300'}`}>
                        {checkedCount >= 3 ? "ZIELONE ŚWIATŁO: DZIAŁAJ!" : "JESZCZE STABILNIE"}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StrategyTab = () => {
    return (
        <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <StrategyCard title="Korekta Inflacyjna" range="3-5%" desc="Kosmetyka. Klient prawie tego nie zauważa, traktuje jako 'koszt życia'. Bezpieczne, nudne, ale konieczne co rok." icon={<TrendingUp className="w-6 h-6 text-slate-400" />} color="border-slate-500" />
             <StrategyCard title="Wzrost Jakości (Growth)" range="10-20%" desc="Standardowa, zdrowa podwyżka. Masz nowe szkolenia, sprzęt? Dajesz więcej wartości. Wymaga Value Stacking." icon={<Sword className="w-6 h-6 text-amber-500" />} color="border-amber-500" highlight />
             <StrategyCard title="Repozycjonowanie" range="30-50%+" desc="Rewolucja. Zmieniasz grupę docelową. Liczysz się z dużą wymianą klientów. Tylko przy silnym marketingu." icon={<AlertTriangle className="w-6 h-6 text-red-500" />} color="border-red-500" />
        </div>
    );
};

const StrategyCard = ({ title, range, desc, icon, color, highlight }) => (
    <div className={`bg-slate-900 p-6 rounded-2xl border-t-4 ${color} shadow-lg flex flex-col ${highlight ? 'ring-1 ring-amber-500/30 bg-amber-500/5' : ''}`}>
        <div className="mb-4 flex justify-between items-start">
            <h3 className="font-bold text-lg text-slate-100">{title}</h3>
            {icon}
        </div>
        <div className="text-3xl font-black mb-4 text-white">{range}</div>
        <p className="text-sm text-slate-400 leading-relaxed flex-grow">{desc}</p>
    </div>
);

const ScriptsTab = () => {
    const [copied, setCopied] = useState(false);
    const emailBody = `Temat: Ważna aktualizacja dotycząca naszej współpracy 🚀\n\nCześć [Imię Klienta],\n\nNa wstępie wielkie dzięki za Twoje zaangażowanie w ostatnich miesiącach. Widzę, jak [konkretny sukces klienta] i mega mnie to cieszy. Współpraca z Tobą to czysta przyjemność.\n\nPiszę, bo chcę utrzymać najwyższą jakość naszych treningów i dalej inwestować w [sprzęt/edukację], co przełoży się na Twoje wyniki. W związku z tym, od [DATA] aktualizuję cennik moich usług. Cena za pakiet wyniesie [NOWA KWOTA].\n\nAle uwaga – ponieważ jesteś moim stałym klientem, chcę Ci to wynagrodzić.\n\nDla Ciebie nowa stawka wejdzie w życie dopiero od [DATA PÓŹNIEJSZA] LUB Masz możliwość wykupienia zapasu treningów po STAREJ cenie do końca miesiąca.\n\nChcę, żebyś czuł się doceniony, bo Twoje zaufanie jest dla mnie kluczowe.\nJeśli masz jakiekolwiek pytania – daj znać. Działamy dalej i robimy formę!\n\nPozdro,\n[Twoje Imię]`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(emailBody);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid md:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-amber-500">
                        <MessageSquare className="w-5 h-5" /> Zasady Komunikacji
                    </h3>
                    <ul className="space-y-4 text-sm text-slate-300">
                        <li className="flex gap-2"><span className="text-red-400 font-bold">❌</span><span>Nie przepraszaj za cenę. To zabija Twój autorytet eksperta.</span></li>
                        <li className="flex gap-2"><span className="text-red-400 font-bold">❌</span><span>Nie tłumacz się własnymi kosztami (czynszem). Mów o korzyściach klienta.</span></li>
                        <li className="flex gap-2"><span className="text-emerald-400 font-bold">✅</span><span>Metoda Kanapki: Pozytyw (sukcesy) → Info o cenie → Pozytyw (bonus dla stałych).</span></li>
                    </ul>
                </div>
            </div>
            <div className="md:col-span-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
                        <button onClick={handleCopy} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
                            {copied ? <CheckCircle className="w-3 h-3 text-emerald-500"/> : <Copy className="w-3 h-3"/>} {copied ? "Skopiowano!" : "Kopiuj treść"}
                        </button>
                    </div>
                    <div className="p-6 overflow-x-auto"><pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{emailBody}</pre></div>
                </div>
            </div>
        </div>
    );
};

export default App;
