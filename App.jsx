import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, CheckCircle, ShieldAlert, 
  Wallet, Clock, Sword, ScrollText, Target, Info, Coins, 
  Settings2, Activity, Dumbbell, Apple, Brain, Layers, 
  CalendarCheck, Copy, Printer, ChevronDown, ChevronUp
} from 'lucide-react';

// --- LOGIKA BIZNESOWA ---

const calculateChecklistScore = (inputs) => {
  const { capacity, costIncrease, goldenWindow, signals } = inputs;
  const signalsCount = Object.values(signals).filter(Boolean).length;
  let rawScore = signalsCount;

  if (capacity >= 85) rawScore += 2;
  else if (capacity >= 70) rawScore += 1;

  if (costIncrease) rawScore += 1;
  const goodWindows = ['january', 'september', 'yearEnd'];
  if (goodWindows.includes(goldenWindow)) rawScore += 1;

  let recommendation = {
    title: 'Wynik niski (0-3)',
    desc: 'Twoje ceny prawdopodobnie nie są priorytetowym problemem. Najpierw zadbaj o pozyskiwanie klientów.',
  };

  if (rawScore >= 9) {
    recommendation = { title: 'Wynik bardzo wysoki (9+)', desc: 'Twoje ceny są zdecydowanie za niskie. Czas na repozycjonowanie (+30–50%).' };
  } else if (rawScore >= 7) {
    recommendation = { title: 'Wynik wysoki (7-8)', desc: 'To dobry moment na podwyżkę. Rozważ wzrost jakości (+10–20%).' };
  } else if (rawScore >= 4) {
    recommendation = { title: 'Wynik średni (4-6)', desc: 'Masz pierwsze sygnały. Rozważ korektę inflacyjną (+3–8%).' };
  }

  return { rawScore, recommendation };
};

const runSimulation = (inputs) => {
  const { clients, sessionsPerClient, price, increasePercent, churnPercent, sessionsPerClientAfter, fixedCosts, variableCost, churnType, churnValue } = inputs;
  
  const safeClients = Math.max(0, clients);
  
  // Stan Obecny
  const currentSessions = safeClients * sessionsPerClient;
  const currentRevenue = currentSessions * price;
  const currentProfit = currentRevenue - fixedCosts - (currentSessions * variableCost);
  const currentNetHourly = currentSessions > 0 ? currentProfit / currentSessions : 0;

  // Stan Po Zmianie
  const newPrice = price * (1 + increasePercent / 100);
  
  let clientsLost = 0;
  if (churnType === 'percent') {
      clientsLost = safeClients * (churnPercent / 100);
  } else {
      clientsLost = churnValue; 
  }
  
  const clientsLeft = Math.max(0, safeClients - clientsLost);
  const newSessions = clientsLeft * sessionsPerClientAfter; 
  const newRevenue = newSessions * newPrice;
  const newProfit = newRevenue - fixedCosts - (newSessions * variableCost);
  const newNetHourly = newSessions > 0 ? newProfit / newSessions : 0;

  // Delty
  const profitDiff = newProfit - currentProfit;
  const revenueDiff = newRevenue - currentRevenue;
  const hoursSaved = currentSessions - newSessions;
  const newMarginPerSession = newPrice - variableCost;
  const timeValue = Math.max(0, hoursSaved * newMarginPerSession);

  // Break Even Point
  let maxClientsToLose = 0;
  const contributionMargin = newPrice - variableCost;
  if (contributionMargin > 0 && sessionsPerClientAfter > 0) {
      const requiredClients = (currentProfit + fixedCosts) / (sessionsPerClientAfter * contributionMargin);
      maxClientsToLose = Math.max(0, safeClients - requiredClients);
  }

  let status = 'neutral';
  // Decyzja na podstawie zysku (jeśli koszty są on) lub przychodu
  const diffToCheck = profitDiff; 
  if (diffToCheck > 10) status = 'positive';
  if (diffToCheck < -10) status = 'negative';

  let churnHealth = 'optimal';
  // Przeliczenie % churnu dla wyświetlenia
  const actualChurnPercent = safeClients > 0 ? (clientsLost / safeClients) * 100 : 0;
  if (actualChurnPercent <= 5) churnHealth = 'tooLow';
  if (actualChurnPercent > 20) churnHealth = 'tooHigh';

  return {
    currentRevenue, currentProfit, currentNetHourly,
    newRevenue, newProfit, newNetHourly, newPrice: Math.round(newPrice),
    profitDiff, revenueDiff, clientsLost, clientsLeft, hoursSaved, timeValue, maxClientsToLose,
    status, churnHealth,
    isValid: currentRevenue > 0
  };
};

const buildMessage = (type, ctx) => {
  const templates = {
    sandwich: `Cześć ${ctx.clientName},\n\nDzięki za super współpracę! Widzę Twój progres i mega mnie to cieszy.\n\nOd ${ctx.startDate} aktualizuję cennik (cena za ${ctx.packageName}: ${ctx.newPrice} zł). Dzięki temu mogę inwestować w jakość naszych treningów.\n\nDla Ciebie jako stałego klienta nowa stawka wchodzi dopiero od ${ctx.graceDate}.\n\nDziałamy dalej! 💪`,
    official: `Szanowny/a ${ctx.clientName},\n\nInformuję o planowanej waloryzacji cennika usług od ${ctx.startDate}. Nowa cena za ${ctx.packageName} wyniesie ${ctx.newPrice} zł (dotychczas: ${ctx.oldPrice} zł).\n\nZmiana ta podyktowana jest wzrostem kosztów operacyjnych oraz inwestycjami w jakość. Dla obecnych klientów przewidziałem okres przejściowy – nowa stawka obowiązuje od ${ctx.graceDate}.\n\nZ wyrazami szacunku,`,
    casual: `Hej ${ctx.clientName}! 👋\n\nSzybkie info: od ${ctx.startDate} zmieniam cennik na ${ctx.newPrice} zł. Inwestuję w sprzęt i szkolenia, żebyśmy robili lepsze wyniki!\n\nDla Ciebie stara cena zostaje do ${ctx.graceDate}. Dzięki, że jesteś!`,
    vip: `Dzień dobry ${ctx.clientName},\n\nW związku z rozwojem oferty premium, od ${ctx.startDate} aktualizuję stawkę za ${ctx.packageName} do ${ctx.newPrice} zł.\n\nJako stały klient masz gwarancję obecnej ceny do ${ctx.graceDate}.`
  };
  return templates[type] || "Wybierz szablon.";
};

const formatCurrency = (val) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);

// --- KOMPONENTY UI ---

const SmartInput = ({ label, value, onChange, min, max, step, unit, hint, tooltip, type = "number", markers }) => (
  <div className="mb-6 relative">
    <div className="flex justify-between items-end mb-2">
      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
        {label}
        {tooltip && <div className="group relative cursor-help"><Info className="w-3.5 h-3.5 text-slate-500 hover:text-amber-500" /><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 border border-slate-700 rounded shadow-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">{tooltip}</div></div>}
      </label>
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-2">
        <input type={type} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-16 bg-transparent py-1 text-right text-sm font-bold text-white focus:outline-none" step={step} />
        <span className="text-[10px] text-slate-500 select-none w-4">{unit}</span>
      </div>
    </div>
    {hint && <p className="text-[10px] text-slate-500 mb-2">{hint}</p>}
    <div className="relative h-6 flex items-center">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 z-10 relative" />
        {markers && markers.map((m, idx) => (
            <div key={idx} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-0" style={{ left: `${(m.at / max) * 100}%` }}>
                <div className={`w-0.5 h-4 ${m.color} mb-6`}></div>
                <span className={`text-[9px] font-bold uppercase whitespace-nowrap absolute -top-4 ${m.textColor || 'text-slate-500'}`}>{m.label}</span>
            </div>
        ))}
    </div>
  </div>
);

const NavButton = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
  <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === id ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    <Icon className="w-4 h-4" />
    <span className="hidden md:inline">{label}</span>
  </button>
);

const ChecklistTab = ({ state, setState }) => {
  const result = calculateChecklistScore(state);
  const updateSignal = (idx) => setState({...state, signals: {...state.signals, [idx]: !state.signals[idx]}});
  const items = ["Mam listę oczekujących klientów.", "Prawie nikt nie mówi „za drogo”.", "Pracuję po godzinach, żeby spiąć budżet.", "Czuję frustrację, gdy ktoś odwoła wizytę.", "Traktują mnie jak kumpla, nie eksperta.", "Nie podnosiłem cen od 12–18 miesięcy.", "Inwestuję w szkolenia więcej, niż odrabiam.", "Mam problemowych / roszczeniowych klientów.", "Konkurencja bierze 30–50% więcej.", "Boję się sprawdzić konto pod koniec miesiąca."];

  const GOLDEN_WINDOWS = [
    { id: 'other', label: 'Inny termin' },
    { id: 'january', label: 'Styczeń (postanowienia)' },
    { id: 'september', label: 'Wrzesień/Paź (po wakacjach)' },
    { id: 'yearEnd', label: 'Koniec roku (budżety)' },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in">
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">1. Dane</h3>
          <SmartInput label="Obłożenie kalendarza" unit="%" value={state.capacity} onChange={v => setState({...state, capacity: v})} min={0} max={100} />
          <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800/50 rounded-lg cursor-pointer" onClick={() => setState({...state, costIncrease: !state.costIncrease})}>
             <div className={`w-4 h-4 rounded border flex items-center justify-center ${state.costIncrease ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>{state.costIncrease && <CheckCircle className="w-3 h-3 text-slate-900" />}</div>
             <span className="text-sm text-slate-300">Moje koszty wzrosły (ostatnie 12 msc)</span>
          </div>
          <label className="text-sm font-medium text-slate-300 block mb-1">Złote Okno</label>
          <select value={state.goldenWindow} onChange={e => setState({...state, goldenWindow: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white">
             {GOLDEN_WINDOWS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
           <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">2. Sygnały</h3>
           <div className="space-y-2">
             {items.map((txt, idx) => (
                <div key={idx} onClick={() => updateSignal(idx)} className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 ${state.signals[idx] ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-800'}`}>
                   <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${state.signals[idx] ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>{state.signals[idx] && <CheckCircle className="w-3 h-3 text-slate-900" />}</div>
                   <p className={`text-xs font-medium ${state.signals[idx] ? 'text-white' : 'text-slate-400'}`}>{txt}</p>
                </div>
             ))}
           </div>
        </div>
      </div>
      <div className="sticky top-24 h-fit bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl text-center">
          <div className="text-5xl font-black text-white mb-2">{result.rawScore} pkt</div>
          <h4 className={`text-xl font-bold mb-4 ${result.rawScore >= 7 ? 'text-emerald-500' : result.rawScore >= 4 ? 'text-amber-500' : 'text-slate-400'}`}>{result.recommendation.title}</h4>
          <div className="p-4 rounded-xl text-left border mb-6 bg-slate-950 border-slate-800"><p className="text-sm text-slate-300">{result.recommendation.desc}</p></div>
      </div>
    </div>
  );
};

const SimpleBarChart = ({ before, after }) => {
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

const SimulatorTab = ({ profession }) => {
  const [inputs, setInputs] = useState({ clients: 20, sessionsPerClient: 8, price: 150, increasePercent: 20, churnPercent: 15, churnType: 'percent', churnValue: 15, sessionsPerClientAfter: 8, fixedCosts: 2000, variableCost: 0 });
  const [showCosts, setShowCosts] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const PROFESSIONS = {
    trainer: { label: "Trener Personalny", icon: Dumbbell, sessionName: "trening", variableName: "koszt dojazdu" },
    dietitian: { label: "Dietetyk", icon: Apple, sessionName: "konsultacja", variableName: "koszt materiałów" },
    physio: { label: "Fizjoterapeuta", icon: Activity, sessionName: "wizyta", variableName: "koszt jednorazowy" }
  };

  useEffect(() => { setInputs(p => ({...p, sessionsPerClientAfter: p.sessionsPerClient})); }, [inputs.sessionsPerClient]);
  const res = runSimulation({...inputs, churnPercent: inputs.churnType === 'percent' ? inputs.churnValue : 0});
  const pConf = PROFESSIONS[profession];

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
       <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
             <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6">Parametry</h3>
             <SmartInput label="Liczba klientów" value={inputs.clients} onChange={v=>setInputs({...inputs, clients:v})} min={1} max={100} unit="os." />
             <SmartInput label={`Średnio ${pConf.sessionName}ów / klienta`} value={inputs.sessionsPerClient} onChange={v=>setInputs({...inputs, sessionsPerClient:v})} min={1} max={30} unit="szt." />
             <SmartInput label={`Średni przychód / ${pConf.sessionName}`} value={inputs.price} onChange={v=>setInputs({...inputs, price:v})} min={10} max={1000} step={5} unit="PLN" />
             <div className="mt-6 pt-4 border-t border-slate-800">
                 <button onClick={() => setShowCosts(!showCosts)} className={`flex items-center gap-2 text-xs font-bold transition-colors w-full p-2 rounded-lg ${showCosts ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <Coins className={`w-4 h-4 ${showCosts ? 'text-amber-500' : ''}`} /> {showCosts ? "Ukryj koszty" : "Uwzględnij koszty"}
                 </button>
                 {showCosts && <div className="mt-4 animate-in slide-in-from-top-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <SmartInput label="Koszty stałe (msc)" value={inputs.fixedCosts} onChange={v=>setInputs({...inputs, fixedCosts:v})} min={0} max={50000} step={100} unit="PLN" />
                        <SmartInput label={pConf.variableName} value={inputs.variableCost} onChange={v=>setInputs({...inputs, variableCost:v})} min={0} max={500} step={5} unit="PLN" />
                    </div>}
            </div>
             <div className="h-px bg-slate-800 my-6"></div>
             <SmartInput label="Planowana podwyżka (%)" value={inputs.increasePercent} onChange={v=>setInputs({...inputs, increasePercent:v})} min={0} max={100} step={1} unit="%" tooltip="Np. 20% z 150 zł = 180 zł" />
             <SmartInput label="Szacowana utrata klientów (%)" value={inputs.churnValue} onChange={v=>setInputs({...inputs, churnValue:v})} min={0} max={100} step={1} unit="%" markers={[{ at: 12.5, label: 'ZDROWY', color: 'bg-emerald-500' }, { at: 20, label: 'RYZYKO', color: 'bg-red-500' }]} />
             
             <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-slate-500 underline decoration-slate-700 hover:text-slate-300 mb-2">
                 {showAdvanced ? "Ukryj opcje zaawansowane" : "Pokaż opcje zaawansowane"}
            </button>
            {showAdvanced && (
                 <div className="mt-2 animate-in fade-in bg-slate-950 p-3 rounded-lg border border-slate-800">
                     <SmartInput label={`Śr. liczba ${pConf.sessionName === 'trening' ? 'treningów' : 'wizyt'} po zmianie`} value={inputs.sessionsPerClientAfter} onChange={v=>setInputs({...inputs, sessionsPerClientAfter:v})} min={1} max={40} step={1} unit="szt." hint="Gdy klient zostaje, ale przychodzi rzadziej"/>
                 </div>
            )}
          </div>
       </div>
       <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${res.status === 'positive' ? 'from-slate-800 via-emerald-500 to-emerald-400' : 'from-slate-800 via-red-500 to-red-400'}`}></div>
             <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{showCosts ? "Miesięczny ZYSK" : "Miesięczny PRZYCHÓD"}</p>
                    <div className="flex items-baseline gap-4">
                        <h2 className={`text-4xl md:text-5xl font-black ${res.status === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(showCosts ? res.newProfit : res.newRevenue)}</h2>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${res.status === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{res.profitDiff > 0 ? '+' : ''}{formatCurrency(showCosts ? res.profitDiff : res.revenueDiff)}</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Poprzednio: {formatCurrency(showCosts ? res.currentProfit : res.currentRevenue)}</p>
                </div>
                <div className="w-full md:w-48 hidden sm:block">
                    <SimpleBarChart before={showCosts ? res.currentProfit : res.currentRevenue} after={showCosts ? res.newProfit : res.newRevenue} />
                </div>
             </div>
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                <div className="flex items-center gap-2 mb-3"><div className="p-1.5 bg-amber-500/10 rounded text-amber-500"><Wallet className="w-4 h-4"/></div><p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Stawka na rękę / h</p></div>
                <div className="flex justify-between items-center">
                    <p className="text-slate-500 text-xs line-through">{formatCurrency(res.currentNetHourly)}/h</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(res.newNetHourly)}<span className="text-sm text-slate-500 font-normal">/h</span></p>
                </div>
             </div>
             <div className={`p-6 rounded-xl border ${res.status === 'positive' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <h3 className={`text-xl font-bold mb-2 ${res.status === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>{res.status === 'positive' ? "OPŁACALNE" : "RYZYKOWNE"}</h3>
                <p className="text-slate-300 text-sm">{res.status === 'positive' ? `Zarabiasz więcej przy ${res.clientsLost.toFixed(1)} mniej klientach.` : `Tracisz pieniądze. Musisz zmniejszyć churn.`}</p>
                <div className="mt-4 pt-4 border-t border-slate-700/30 text-xs text-slate-400"><strong>Próg opłacalności (BEP):</strong> Max utrata <strong className="text-white">{res.maxClientsToLose.toFixed(1)} os.</strong></div>
             </div>
          </div>
       </div>
    </div>
  );
};

const TemplatesTab = ({ profession }) => {
   const [config, setConfig] = useState({ type: 'sandwich', clientName: 'Ania', oldPrice: 150, newPrice: 180, packageName: 'pakiet', startDate: '1 stycznia', graceDate: '1 marca' });
   const [copied, setCopied] = useState(false);
   const msg = buildMessage(config.type, config);
   const handleCopy = () => { navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000); };

   return (
     <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Konfiguracja</h3>
              <select value={config.type} onChange={e=>setConfig({...config, type:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"><option value="sandwich">Metoda "Kanapka"</option><option value="official">Oficjalny</option><option value="casual">Luźny</option><option value="vip">Premium</option></select>
              <input type="text" value={config.clientName} onChange={e=>setConfig({...config, clientName:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Imię klienta"/>
              <input type="number" value={config.newPrice} onChange={e=>setConfig({...config, newPrice:Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" placeholder="Nowa cena"/>
           </div>
        </div>
        <div className="lg:col-span-8">
           <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col relative">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                 <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div></div>
                 <button onClick={handleCopy} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">{copied ? <CheckCircle className="w-3 h-3 text-emerald-500"/> : <Copy className="w-3 h-3"/>} Kopiuj</button>
              </div>
              <textarea readOnly value={msg} className="w-full flex-grow bg-transparent p-6 text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed min-h-[400px]" />
           </div>
        </div>
     </div>
   );
};

const PlanTab = () => (
    <div className="max-w-3xl mx-auto animate-in fade-in">
        <SectionHeader title="Plan 30 Dni" subtitle="Wdrożenie krok po kroku." icon={CalendarCheck} />
        <div className="space-y-4">
           {[{ t: "Tydzień 1: Decyzja", i: ["Policz Capacity", "Zrób symulację", "Wybierz strategię"] }, { t: "Tydzień 2: Oferta", i: ["Dopracuj Value Stack", "Wybierz gotowca"] }, { t: "Tydzień 3: Komunikacja", i: ["Wyślij info (min. 30 dni przed)", "Daj okres przejściowy"] }, { t: "Tydzień 4: Wdrożenie", i: ["Zmień ceny dla nowych", "Obserwuj churn"] }].map((w, idx) => (
               <div key={idx} className="bg-slate-900 p-6 rounded-2xl border border-slate-800"><h3 className="font-bold text-white mb-2">{w.t}</h3><ul className="list-disc list-inside text-sm text-slate-400">{w.i.map((x,k)=><li key={k}>{x}</li>)}</ul></div>
           ))}
        </div>
    </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('checklist');
  const [profession, setProfession] = useState('trainer');
  const [checklistState, setChecklistState] = useState({ capacity: 90, totalCalls: 10, wonCalls: 8, costIncrease: true, goldenWindow: 'january', signals: {} });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900 pb-12">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20"><Sword className="text-amber-500 w-6 h-6" /></div>
                <div><h1 className="text-lg font-bold text-white leading-none mb-1">GILDIA <span className="text-amber-500">TRENERÓW</span></h1><select value={profession} onChange={(e) => setProfession(e.target.value)} className="bg-slate-800 text-[10px] uppercase font-bold text-slate-400 rounded px-2 py-0.5 border border-slate-700 outline-none focus:border-amber-500">{Object.entries(PROFESSIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-1 md:pb-0 no-scrollbar">
               <NavButton id="checklist" label="Checklista" icon={CheckCircle} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="calculator" label="Symulator" icon={Calculator} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="scripts" label="Gotowce" icon={MessageSquare} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="plan" label="Plan" icon={CalendarCheck} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'checklist' && <ChecklistTab state={checklistState} setState={setChecklistState} />}
        {activeTab === 'calculator' && <SimulatorTab profession={profession} />}
        {activeTab === 'scripts' && <TemplatesTab profession={profession} />}
        {activeTab === 'plan' && <PlanTab />}
      </main>
    </div>
  );
};

export default App;
