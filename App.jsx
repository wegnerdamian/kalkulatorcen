import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, CheckCircle, ShieldAlert, 
  Wallet, Clock, Sword, ScrollText, Target, Info, Coins, 
  Settings2, Activity, Dumbbell, Apple, Brain, Layers, 
  CalendarCheck, Copy, Printer, ChevronDown, ChevronUp
} from 'lucide-react';

// --- LOGIKA BIZNESOWA (Wklejona bezpośrednio tutaj) ---

const calculateChecklistScore = (inputs) => {
  const { capacityUtilization, costIncrease, goldenWindow, signalsCheckedCount } = inputs;
  let rawScore = signalsCheckedCount;

  if (capacityUtilization >= 85) rawScore += 2;
  else if (capacityUtilization >= 70) rawScore += 1;

  if (costIncrease) rawScore += 1;

  const goodWindows = ['january', 'september', 'yearEnd'];
  if (goodWindows.includes(goldenWindow)) rawScore += 1;

  let recommendation = {
    title: 'Wynik niski (0-3)',
    desc: 'Twoje ceny prawdopodobnie nie są priorytetowym problemem. Najpierw zadbaj o pozyskiwanie klientów, jakość usługi i podstawowy marketing. Podwyżkę zostaw na później.',
  };

  if (rawScore >= 9) {
    recommendation = {
      title: 'Wynik bardzo wysoki (9+)',
      desc: 'Twoje ceny są zdecydowanie za niskie względem obłożenia, wartości i rynku. Spokojnie możesz myśleć o mocniejszym ruchu (repozycjonowanie, +30–50%), jeśli jesteś gotów(-a) na wymianę części bazy klientów.',
    };
  } else if (rawScore >= 7) {
    recommendation = {
      title: 'Wynik wysoki (7-8)',
      desc: 'To dobry moment na podwyżkę. Z danych wynika, że jesteś przeciążony(-a), za tani(-a) i dokładasz do rozwoju zawodowego. Rozważ podwyżkę 10–20% zgodnie ze strategią „Wzrost jakości”.',
    };
  } else if (rawScore >= 4) {
    recommendation = {
      title: 'Wynik średni (4-6)',
      desc: 'Masz pierwsze sygnały, że Twoje ceny zaczynają odstawać od rzeczywistości. Rozważ delikatną korektę inflacyjną (np. +3–8%) dla nowych klientów i przygotuj grunt pod większą zmianę.',
    };
  }

  return { rawScore, recommendation };
};

const runSimulation = (inputs) => {
  const { clients, sessionsPerClient, price, increasePercent, churnPercent, sessionsPerClientAfter, fixedCosts, variableCost } = inputs;

  const safeClients = Math.max(0, clients);
  
  // 1. Stan Obecny
  const currentSessions = safeClients * sessionsPerClient;
  const currentRevenue = currentSessions * price;
  const currentVariableCosts = currentSessions * variableCost;
  const currentProfit = currentRevenue - fixedCosts - currentVariableCosts;
  const currentHours = currentSessions; 
  const currentCostPerHour = currentHours > 0 ? (fixedCosts / currentHours) + variableCost : 0;
  const currentNetHourly = Math.max(0, price - currentCostPerHour);

  // 2. Stan Po Zmianie
  const newPrice = price * (1 + increasePercent / 100);
  
  let clientsLost = 0;
  if (inputs.churnType === 'percent') {
      clientsLost = safeClients * (churnPercent / 100);
  } else {
      clientsLost = inputs.churnValue || churnPercent; 
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
  
  const newMarginPerSession = newPrice - variableCost;
  const timeValue = Math.max(0, hoursSaved * newMarginPerSession);

  // 4. Break Even Point
  let requiredClients = 0;
  const contributionMargin = newPrice - variableCost;
  
  if (contributionMargin > 0 && sessionsPerClientAfter > 0) {
      const requiredContribution = currentProfit + fixedCosts;
      requiredClients = requiredContribution / (sessionsPerClientAfter * contributionMargin);
  }
  
  const maxClientsToLose = Math.max(0, safeClients - requiredClients);

  let status = 'neutral';
  if (profitDiff > 10) status = 'positive';
  if (profitDiff < -10) status = 'negative';

  let churnHealth = 'optimal';
  if (churnPercent <= 5) churnHealth = 'tooLow';
  if (churnPercent > 20) churnHealth = 'tooHigh';

  return {
    currentRevenue, currentProfit, currentNetHourly,
    newRevenue, newProfit, newNetHourly, 
    newPrice: Math.round(newPrice),
    profitDiff, revenueDiff,
    clientsLost, clientsLeft,
    hoursSaved, timeValue,
    maxClientsToLose,
    status,
    churnHealth,
    isValid: currentRevenue > 0
  };
};

const buildMessage = (type, context) => {
  const { clientName, oldPrice, newPrice, packageName, startDate, graceDate } = context;
  const templates = {
    sandwich: `Cześć ${clientName},\n\nNa początku chcę Ci bardzo podziękować za dotychczasową współpracę. Widzę, jak przez ostatnie miesiące poprawiła się Twoja forma i mega mnie to cieszy.\n\nPiszę, bo od ${startDate} aktualizuję cennik moich usług. Cena za ${packageName} wzrośnie z ${oldPrice} zł do ${newPrice} zł.\n\nDzięki tej zmianie mogę dalej inwestować w jakość naszej współpracy. Ponieważ jesteś stałym klientem, dla Ciebie nowa cena zacznie obowiązywać dopiero od ${graceDate}.\n\nDziałamy dalej i robimy formę. 💪`,
    official: `Szanowny/a ${clientName},\n\nInformuję o planowanej waloryzacji cennika usług od ${startDate}. Nowa cena za ${packageName} wyniesie ${newPrice} zł (dotychczas: ${oldPrice} zł).\n\nZmiana ta podyktowana jest wzrostem kosztów operacyjnych oraz inwestycjami w jakość. Dla obecnych klientów przewidziałem okres przejściowy – nowa stawka obowiązuje od ${graceDate}.\n\nZ wyrazami szacunku,`,
    casual: `Hej ${clientName}! 👋\n\nSzybkie info: od ${startDate} podnoszę ceny za ${packageName} na ${newPrice} zł. Inwestuję w sprzęt i szkolenia, żebyśmy robili jeszcze lepsze wyniki!\n\nDla Ciebie jako stałego klienta - stara cena zostaje jeszcze do ${graceDate}. Dzięki, że jesteś!`,
    vip: `Dzień dobry ${clientName},\n\nW związku z rozwojem oferty premium, od ${startDate} aktualizuję stawkę za ${packageName} do ${newPrice} zł.\n\nJako osoba już ze mną współpracująca, otrzymuje Pan/Pani preferencyjne warunki: nowa stawka wejdzie w życie dopiero ${graceDate}.\n\nDziękuję za zaufanie.`
  };
  return templates[type] || "Wybierz szablon.";
};

// --- CONFIG ---
const PROFESSIONS = {
  trainer: { label: "Trener Personalny", icon: Dumbbell, sessionName: "trening", variableName: "koszt dojazdu" },
  dietitian: { label: "Dietetyk", icon: Apple, sessionName: "konsultacja", variableName: "koszt materiałów" },
  physio: { label: "Fizjoterapeuta", icon: Activity, sessionName: "wizyta", variableName: "koszt jednorazowy" }
};

const GOLDEN_WINDOWS = [
  { id: 'other', label: 'Inny termin' },
  { id: 'january', label: 'Styczeń (postanowienia)' },
  { id: 'september', label: 'Wrzesień/Paź (po wakacjach)' },
  { id: 'yearEnd', label: 'Koniec roku (budżety)' },
];

// --- KOMPONENTY ---

const formatCurrency = (val) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);

const NavButton = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
      activeTab === id ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden md:inline">{label}</span>
  </button>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="mb-6 border-b border-slate-800 pb-4">
    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
      {Icon && <Icon className="text-amber-500 w-6 h-6" />}
      {title}
    </h2>
    {subtitle && <p className="text-slate-400 mt-1 text-sm md:text-base">{subtitle}</p>}
  </div>
);

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-2 cursor-help">
    <Info className="w-3.5 h-3.5 text-slate-500 hover:text-amber-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 md:w-64 p-2 bg-slate-800 border border-slate-700 rounded shadow-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      {text}
    </div>
  </div>
);

const SmartInput = ({ label, value, onChange, min, max, step, unit, hint, tooltip, type = "number", markers }) => (
  <div className="mb-6 relative">
    <div className="flex justify-between items-end mb-2">
      <label className="text-sm font-medium text-slate-300 flex items-center">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 bg-transparent py-1 text-right text-sm font-bold text-white focus:outline-none"
          step={step}
        />
        <span className="text-[10px] text-slate-500 select-none w-4">{unit}</span>
      </div>
    </div>
    {hint && <p className="text-[10px] text-slate-500 mb-2">{hint}</p>}
    <div className="relative h-6 flex items-center">
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 z-10 relative"
        />
        {markers && markers.map((m, idx) => (
            <div key={idx} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-0" style={{ left: `${(m.at / max) * 100}%` }}>
                <div className={`w-0.5 h-4 ${m.color} mb-6`}></div>
                <span className={`text-[9px] font-bold uppercase whitespace-nowrap absolute -top-4 ${m.textColor || 'text-slate-500'}`}>{m.label}</span>
            </div>
        ))}
    </div>
  </div>
);

const SimpleBarChart = ({ before, after, label }) => {
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

// --- SEKCJE APLIKACJI ---

const ChecklistTab = ({ state, setState }) => {
  const { capacity, wonCalls, totalCalls, costIncrease, goldenWindow, signals } = state;
  const result = calculateChecklistScore({
    capacityUtilization: capacity,
    costIncrease,
    goldenWindow,
    signalsCheckedCount: Object.values(signals).filter(Boolean).length
  });

  const updateSignal = (idx) => setState({...state, signals: {...signals, [idx]: !signals[idx]}});

  const signalItems = [
    { txt: "Mam listę oczekujących klientów.", tip: "Masz więcej chętnych niż czasu? To klasyczny sygnał, że Twoje ceny są za niskie." },
    { txt: "Prawie nikt nie mówi „za drogo”.", tip: "Jeśli od dawna nie słyszysz żadnych obiekcji cenowych, bardzo możliwe, że zostawiasz pieniądze na stole." },
    { txt: "Pracuję po godzinach, żeby spiąć budżet.", tip: "Dużo roboty, mało pieniędzy = zła kombinacja. Podwyżka reguluje obłożenie i zarobki." },
    { txt: "Czuję frustrację, gdy ktoś odwoła wizytę w ostatniej chwili.", tip: "Jeśli każde odwołanie „boli Cię w portfel”, to znak, że pracujesz za tanio." },
    { txt: "Część klientów traktuje mnie jak kumpla, a nie eksperta.", tip: "Niska cena często psuje szacunek do Twojej pracy. Wyższa stawka buduje autorytet." },
    { txt: "Nie podnosiłem(-am) cen od ponad 12–18 miesięcy.", tip: "Przy obecnej inflacji brak podwyżek przez 2 lata to realnie 20–30% mniej pieniędzy." },
    { txt: "Inwestuję w szkolenia, sprzęt i aplikacje więcej, niż odrabiam.", tip: "Jeśli się dokształcasz, a stawki stoją, to wycena nie nadąża za Twoją wartością." },
    { txt: "Przyciągam sporo problemowych / roszczeniowych klientów.", tip: "Im mniej klient płaci, tym często więcej wymaga. Wyższa cena filtruje trudne przypadki." },
    { txt: "Konkurencja o podobnym stażu bierze 30–50% więcej.", tip: "Jeśli inni podobni do Ciebie są znacząco drożsi, rynek mówi Ci: „Jesteś za tani”." },
    { txt: "Boję się sprawdzić konto pod koniec miesiąca.", tip: "To nie jest powód do wstydu, tylko sygnał, że trzeba uporządkować pricing." }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in zoom-in">
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">1. Pola ilościowe</h3>
          <SmartInput 
            label="Obłożenie kalendarza" unit="%" 
            value={capacity} onChange={v => setState({...state, capacity: v})} min={0} max={100}
            tooltip="Powyżej 85% to mocny sygnał do podwyżki."
          />
          <div className="mb-4">
             <label className="text-sm font-medium text-slate-300 block mb-1">Skuteczność sprzedaży</label>
             <div className="flex gap-4">
               <div className="flex-1">
                 <p className="text-[10px] text-slate-500">Rozmów</p>
                 <input type="number" value={totalCalls} onChange={e=>setState({...state, totalCalls:Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
               </div>
               <div className="flex-1">
                 <p className="text-[10px] text-slate-500">Sukcesów</p>
                 <input type="number" value={wonCalls} onChange={e=>setState({...state, wonCalls:Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
               </div>
             </div>
             <p className="text-[10px] text-slate-500 mt-1">Konwersja: {totalCalls>0 ? Math.round(wonCalls/totalCalls*100):0}% (Zdrowa: ~80% z odrzuceniem)</p>
          </div>
          
          <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800/50 rounded-lg cursor-pointer" onClick={() => setState({...state, costIncrease: !costIncrease})}>
             <div className={`w-4 h-4 rounded border flex items-center justify-center ${costIncrease ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                {costIncrease && <CheckCircle className="w-3 h-3 text-slate-900" />}
             </div>
             <span className="text-sm text-slate-300">Moje koszty wzrosły w ostatnich 12 msc.</span>
          </div>

          <label className="text-sm font-medium text-slate-300 block mb-1">Złote Okno (Planowany termin)</label>
          <select value={goldenWindow} onChange={e => setState({...state, goldenWindow: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white">
             {GOLDEN_WINDOWS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
           <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">2. Sygnały (Checklista)</h3>
           <div className="space-y-2">
             {signalItems.map((item, idx) => (
                <div key={idx} onClick={() => updateSignal(idx)} className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${signals[idx] ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-800 hover:bg-slate-800'}`}>
                   <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${signals[idx] ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                      {signals[idx] && <CheckCircle className="w-3 h-3 text-slate-900" />}
                   </div>
                   <div>
                     <p className={`text-xs md:text-sm font-medium ${signals[idx] ? 'text-white' : 'text-slate-400'}`}>{item.txt}</p>
                     {signals[idx] && <p className="text-[10px] text-slate-500 mt-1">{item.tip}</p>}
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="sticky top-24 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl text-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">TWÓJ WYNIK</h3>
            <div className="text-5xl font-black text-white mb-2">{result.rawScore} pkt</div>
            <h4 className={`text-xl font-bold mb-4 ${result.rawScore >= 7 ? 'text-emerald-500' : result.rawScore >= 4 ? 'text-amber-500' : 'text-slate-400'}`}>
               {result.recommendation.title}
            </h4>
            <div className={`p-4 rounded-xl text-left border mb-6 ${result.rawScore >= 7 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-slate-700'}`}>
               <p className="text-sm text-slate-300 leading-relaxed">{result.recommendation.desc}</p>
            </div>
            <p className="text-[10px] text-slate-500">
              Pamiętaj: nawet jeśli część osób odejdzie po podwyżce, możesz zarabiać WIĘCEJ, pracując MNIEJ. Przejdź do Symulatora.
            </p>
        </div>
      </div>
    </div>
  );
};

const SimulatorTab = ({ profession }) => {
  const [inputs, setInputs] = useState({
    clients: 20, sessionsPerClient: 8, price: 150, 
    increasePercent: 20, churnPercent: 15,
    churnType: 'percent', churnValue: 15,
    sessionsPerClientAfter: 8,
    fixedCosts: 2000, variableCost: 0
  });
  
  const [showCosts, setShowCosts] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => { setInputs(p => ({...p, sessionsPerClientAfter: p.sessionsPerClient})); }, [inputs.sessionsPerClient]);

  const res = runSimulation({...inputs, churnPercent: inputs.churnType === 'percent' ? inputs.churnValue : 0});
  const pConf = PROFESSIONS[profession];

  const getVerdict = () => {
    if (res.status === 'positive') return { text: "✅ Podwyżka się OPŁACA", color: "text-emerald-400", bg: "bg-emerald-500/10", desc: `Zarabiasz o ${Math.round(res.profitDiff || res.revenueDiff)} zł więcej, obsługując ${res.clientsLost.toFixed(1)} mniej klientów.` };
    if (res.status === 'neutral') return { text: "⚖ Neutralna finansowo", color: "text-slate-300", bg: "bg-slate-800", desc: "Zarabiasz tyle samo, ale masz więcej czasu na regenerację." };
    return { text: "⚠ NIE opłaca się", color: "text-red-400", bg: "bg-red-500/10", desc: `Tracisz ${Math.abs(Math.round(res.profitDiff || res.revenueDiff))} zł. Zmniejsz churn lub podwyżkę.` };
  };

  const verdict = getVerdict();

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4">
       <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
             <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6">Parametry</h3>
             <SmartInput label="Liczba klientów (płacących)" value={inputs.clients} onChange={v=>setInputs({...inputs, clients:v})} min={1} max={100} unit="os." />
             <SmartInput label={`Średnio ${pConf.sessionName}ów / klienta`} value={inputs.sessionsPerClient} onChange={v=>setInputs({...inputs, sessionsPerClient:v})} min={1} max={30} unit="szt." />
             <SmartInput label={`Średni przychód / ${pConf.sessionName}`} value={inputs.price} onChange={v=>setInputs({...inputs, price:v})} min={10} max={1000} step={5} unit="PLN" />
             
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
                        <SmartInput label="Koszty stałe (miesięcznie)" value={inputs.fixedCosts} onChange={v=>setInputs({...inputs, fixedCosts:v})} min={0} max={50000} step={100} unit="PLN" hint="ZUS, lokal, marketing" />
                        <SmartInput label={pConf.variableName} value={inputs.variableCost} onChange={v=>setInputs({...inputs, variableCost:v})} min={0} max={500} step={5} unit="PLN" hint="Prowizje, dojazd, materiały" />
                    </div>
                 )}
            </div>
             
             <div className="h-px bg-slate-800 my-6"></div>
             
             <SmartInput label="Planowana podwyżka (%)" value={inputs.increasePercent} onChange={v=>setInputs({...inputs, increasePercent:v})} min={0} max={100} step={1} unit="%" tooltip="Np. 20% z 150 zł = 180 zł" />
             <SmartInput 
                label="Szacowana utrata klientów (%)" 
                value={inputs.churnValue} onChange={v=>setInputs({...inputs, churnValue:v})} min={0} max={100} step={1} unit="%" 
                tooltip="Ile % klientów odejdzie? Zdrowo: 10-15%" 
                markers={[
                    { at: 12.5, label: 'ZDROWY', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
                    { at: 20, label: 'OSTRZEŻENIE', color: 'bg-red-500', textColor: 'text-red-500' }
                ]}
             />
             
             <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-slate-500 underline decoration-slate-700 hover:text-slate-300">
                 {showAdvanced ? "Ukryj opcje zaawansowane" : "Pokaż opcje zaawansowane"}
            </button>
            
            {showAdvanced && (
                 <div className="mt-4 animate-in fade-in bg-slate-950 p-3 rounded-lg border border-slate-800">
                     <SmartInput 
                        label={`Śr. liczba ${pConf.sessionName === 'trening' ? 'treningów' : 'wizyt'} po zmianie`} 
                        value={inputs.sessionsPerClientAfter} onChange={v=>setInputs({...inputs, sessionsPerClientAfter:v})} min={1} max={40} step={1} unit="szt." 
                        hint="Gdy klient zostaje, ale przychodzi rzadziej"
                    />
                 </div>
            )}
          </div>
       </div>

       <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${verdict.bg.includes('emerald') ? 'from-slate-800 via-emerald-500 to-emerald-400' : 'from-slate-800 via-red-500 to-red-400'}`}></div>
             
             <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-8">
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        {showCosts ? "Miesięczny ZYSK (na rękę)" : "Miesięczny PRZYCHÓD"}
                        {showCosts && <span className="bg-slate-800 text-amber-500 px-1.5 rounded text-[9px]">NETTO</span>}
                    </p>
                    <div className="flex items-baseline gap-4">
                        <h2 className={`text-4xl md:text-5xl font-black ${res.status === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(showCosts ? res.newProfit : res.newRevenue)}
                        </h2>
                        <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${res.status === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {res.profitDiff >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingUp className="w-3 h-3 rotate-180"/>}
                            {res.profitDiff > 0 ? '+' : ''}{formatCurrency(showCosts ? res.profitDiff : res.revenueDiff)}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Poprzednio: {formatCurrency(showCosts ? res.currentProfit : res.currentRevenue)}
                    </p>
                </div>
                <div className="w-full md:w-48 hidden sm:block">
                    <SimpleBarChart before={showCosts ? res.currentProfit : res.currentRevenue} after={showCosts ? res.newProfit : res.newRevenue} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8 mb-8 border-t border-slate-800 pt-6">
                <div>
                   <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Przed podwyżką</p>
                   <ul className="text-sm text-slate-300 space-y-1">
                      <li>Klientów: <span className="text-white font-bold">{inputs.clients}</span></li>
                      <li>Cena: <span className="text-white font-bold">{inputs.price} zł</span></li>
                   </ul>
                </div>
                <div>
                   <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Po podwyżce</p>
                   <ul className="text-sm text-slate-300 space-y-1">
                      <li>Klientów: <span className="text-white font-bold">{res.clientsAfter.toFixed(1)}</span> <span className="text-red-400 text-xs">(-{res.clientsLost.toFixed(1)})</span></li>
                      <li>Nowa cena: <span className="text-emerald-400 font-bold">{res.newPrice} zł</span></li>
                   </ul>
                </div>
             </div>

             {/* Kalkulator Godzinowy - NOWOŚĆ */}
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-amber-500/10 rounded text-amber-500"><Wallet className="w-4 h-4"/></div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Kalkulator Godzinowy (Na Rękę)</p>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="text-slate-500 text-xs">
                        <p>Przed: <span className="text-slate-400 line-through decoration-slate-600">{formatCurrency(res.currentNetHourly)}/h</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">{formatCurrency(res.newNetHourly)}<span className="text-sm text-slate-500 font-normal">/h</span></p>
                        <p className="text-[10px] text-emerald-500">
                            Wzrost o {Math.round(((res.newNetHourly - res.currentNetHourly)/res.currentNetHourly)*100)}%
                        </p>
                    </div>
                </div>
             </div>

             <div className={`p-6 rounded-xl border ${verdict.bg} border-opacity-50 mb-6`}>
                <h3 className={`text-xl font-bold mb-2 ${verdict.color}`}>{verdict.text}</h3>
                <p className="text-slate-300 text-sm">{verdict.desc}</p>
                <div className="mt-4 pt-4 border-t border-slate-700/30 flex gap-2 items-start">
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400">
                        <strong>Próg opłacalności (BEP):</strong> Możesz stracić max <strong className="text-white">{res.maxClientsToLose.toFixed(1)} os.</strong>, żeby wyjść na zero.
                    </p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const StrategyTab = () => (
  <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
      {[
          { t: 'Korekta Inflacyjna', v: '3-8%', d: 'Delikatne dostosowanie. Nie podnosiłeś cen od roku? Koszty wzrosły? To bezpieczny ruch.', risk: 'Jeśli robisz tylko to, zjara Cię inflacja.', icon: TrendingUp, col: 'blue' },
          { t: 'Wzrost Jakości', v: '10-20%', d: 'Standardowa podwyżka biznesowa. Masz nowe szkolenia, sprzęt, wyniki? Klient płaci za "upgrade".', risk: 'Wymaga dobrej komunikacji (Value Stack).', icon: Sword, col: 'emerald' },
          { t: 'Repozycjonowanie', v: '30-50%+', d: 'Radykalna zmiana. Wchodzisz w segment Premium/VIP. Oczekuj wymiany bazy klientów.', risk: 'Stara baza odejdzie. Musisz mieć silny marketing.', icon: Target, col: 'amber' }
      ].map((s, idx) => (
          <div key={idx} className={`bg-slate-900 p-6 rounded-2xl border-t-4 border-${s.col}-500 shadow-xl flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white text-lg">{s.t}</h3>
                  <s.icon className={`w-6 h-6 text-${s.col}-500`} />
              </div>
              <div className="text-3xl font-black text-white mb-4">{s.v}</div>
              <p className="text-sm text-slate-400 mb-4 flex-grow">{s.d}</p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 mt-auto">
                  <strong className="text-slate-400">Ryzyko:</strong> {s.risk}
              </div>
          </div>
      ))}
  </div>
);

const ValueStackTab = () => {
  const [items, setItems] = useState({
     video: false, report: false, whatsapp: false, community: false, ebook: false, welcome: false
  });

  const toggle = (k) => setItems({...items, [k]: !items[k]});

  const content = [
    { k: 'video', title: 'Biblioteka Wideo', desc: 'Nagrane raz materiały (technika, edukacja), dostępne 24/7.' },
    { k: 'report', title: 'Raport Postępów', desc: 'Miesięczne podsumowanie wyników "na papierze".' },
    { k: 'whatsapp', title: 'Priorytetowy Kontakt', desc: 'WhatsApp VIP - szybsze odpowiedzi na pytania.' },
    { k: 'community', title: 'Zamknięta Grupa', desc: 'Dostęp do społeczności Twoich podopiecznych (FB/Discord).' },
    { k: 'ebook', title: 'Mini-Poradnik', desc: 'PDF np. "Jak jeść na mieście?". Zrób raz, wysyłaj każdemu.' },
    { k: 'welcome', title: 'Welcome Pack', desc: 'Fizyczny gadżet na start (bidon, guma, list powitalny).' }
  ];

  return (
    <div className="animate-in fade-in">
       <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 mb-8">
           <p className="text-slate-300 mb-6 max-w-2xl">
              Klient chętniej zaakceptuje wyższą cenę, jeśli widzi, że zyskuje <strong>WIĘCEJ</strong>. 
              Zaznacz elementy, które możesz dodać do usługi małym kosztem.
           </p>
           <div className="grid md:grid-cols-2 gap-4">
              {content.map(c => (
                 <div key={c.k} onClick={() => toggle(c.k)} className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-4 items-start ${items[c.k] ? 'bg-amber-500/10 border-amber-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${items[c.k] ? 'bg-amber-500 border-amber-500 text-slate-900' : 'border-slate-600'}`}>
                       {items[c.k] && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                       <h4 className={`font-bold text-sm ${items[c.k] ? 'text-white' : 'text-slate-400'}`}>{c.title}</h4>
                       <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
                    </div>
                 </div>
              ))}
           </div>
       </div>
    </div>
  );
};

const TemplatesTab = () => {
   const [config, setConfig] = useState({
      type: 'sandwich', clientName: 'Ania', oldPrice: 150, newPrice: 180, 
      packageName: 'pakiet 8 treningów', startDate: '1 stycznia', graceDate: '1 marca'
   });
   const [copied, setCopied] = useState(false);

   const msg = buildMessage(config.type, config);

   const handleCopy = () => {
      navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   return (
     <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Konfiguracja</h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs text-slate-400 block mb-1">Styl wiadomości</label>
                    <select value={config.type} onChange={e=>setConfig({...config, type:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm">
                       <option value="sandwich">Metoda "Kanapka" (Rekomendowana)</option>
                       <option value="official">Oficjalny (Mail)</option>
                       <option value="casual">Luźny (Messenger)</option>
                       <option value="vip">Premium / VIP</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs text-slate-400 block mb-1">Imię klienta</label>
                       <input type="text" value={config.clientName} onChange={e=>setConfig({...config, clientName:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"/>
                    </div>
                    <div>
                       <label className="text-xs text-slate-400 block mb-1">Nazwa pakietu</label>
                       <input type="text" value={config.packageName} onChange={e=>setConfig({...config, packageName:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"/>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs text-slate-400 block mb-1">Stara cena</label>
                       <input type="number" value={config.oldPrice} onChange={e=>setConfig({...config, oldPrice:Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"/>
                    </div>
                    <div>
                       <label className="text-xs text-slate-400 block mb-1">Nowa cena</label>
                       <input type="number" value={config.newPrice} onChange={e=>setConfig({...config, newPrice:Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"/>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs text-slate-400 block mb-1">Data zmiany</label>
                       <input type="text" value={config.startDate} onChange={e=>setConfig({...config, startDate:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"/>
                    </div>
                    <div>
                       <label className="text-xs text-slate-400 block mb-1">Data dla stałych</label>
                       <input type="text" value={config.graceDate} onChange={e=>setConfig({...config, graceDate:e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"/>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        <div className="lg:col-span-8">
           <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-full flex flex-col relative">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                 <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
                 <button onClick={handleCopy} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                    {copied ? <CheckCircle className="w-3 h-3 text-emerald-500"/> : <Copy className="w-3 h-3"/>} {copied ? "Skopiowano" : "Kopiuj"}
                 </button>
              </div>
              <textarea readOnly value={msg} className="w-full flex-grow bg-transparent p-6 text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed min-h-[400px]" />
           </div>
        </div>
     </div>
   );
};

const PlanTab = () => (
    <div className="max-w-3xl mx-auto animate-in fade-in">
        <SectionHeader title="Plan 30 Dni" subtitle="Jak wdrożyć podwyżkę krok po kroku, żeby nie zwariować." icon={CalendarCheck} />
        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
           {[
               { t: "Tydzień 1: Decyzja", items: ["Policz Capacity i Konwersję", "Zrób symulację w kalkulatorze (3 warianty)", "Wybierz strategię (Korekta vs Jakość vs Repo)"] },
               { t: "Tydzień 2: Oferta", items: ["Dopracuj Value Stack (co dodajesz?)", "Zaktualizuj cennik graficzny", "Wybierz gotowca wiadomości z generatora"] },
               { t: "Tydzień 3: Komunikacja", items: ["Wyślij info do stałych klientów (min. 30 dni przed)", "Daj okres przejściowy (lojalność)", "Notuj obiekcje i pytania"] },
               { t: "Tydzień 4: Wdrożenie", items: ["Zmień ceny na stronie/socialach dla nowych", "Obserwuj churn przez 1-3 miesiące", "Wyciągnij wnioski na przyszły rok"] }
           ].map((w, idx) => (
               <div key={idx} className="relative pl-12">
                   <div className="absolute left-0 top-0 w-10 h-10 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center font-bold text-amber-500 z-10">{idx+1}</div>
                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                       <h3 className="font-bold text-white mb-4">{w.t}</h3>
                       <ul className="space-y-2">
                           {w.items.map((i, k) => (
                               <li key={k} className="flex items-start gap-3 text-sm text-slate-400">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0"></div>
                                   {i}
                               </li>
                           ))}
                       </ul>
                   </div>
               </div>
           ))}
        </div>
    </div>
);

const ErrorsTab = () => (
    <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
        <div>
            <SectionHeader title="10 Błędów" subtitle="Czego unikać jak ognia?" icon={ShieldAlert} />
            <div className="space-y-3">
                {[
                    "Informowanie 'przy ladzie' bez uprzedzenia.",
                    "Tłumaczenie się własnymi kosztami ('czynsz mi wzrósł').",
                    "Przepraszanie za to, że podnosisz ceny.",
                    "Brak zmian w ofercie (podwyżka za 'to samo').",
                    "Wielka podwyżka raz na 5 lat zamiast małych co rok.",
                    "Chaos cenowy (Jan płaci 100, Zdzichu 150).",
                    "Ignorowanie stałych klientów (brak benefitów).",
                    "Brak pewności siebie (jąkanie się przy cenie).",
                    "Zmiana z dnia na dzień (brak vacatio legis).",
                    "Brak tańszej alternatywy dla tych, których nie stać."
                ].map((e, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-red-900/20">
                        <span className="text-red-500 font-bold">✕</span>
                        <span className="text-slate-400 text-sm">{e}</span>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <SectionHeader title="Psychologia" subtitle="Dlaczego nie odejdą?" icon={Brain} />
            <div className="space-y-4">
                {[
                    { t: "Loss Aversion", d: "Klient bardziej boi się stracić sprawdzonego trenera niż dopłacić 20 zł." },
                    { t: "Switching Cost", d: "Szukanie nowego speca to wysiłek i ryzyko. Wolą zapłacić za święty spokój." },
                    { t: "Price Fairness", d: "Akceptują podwyżkę, jeśli widzą sensowny powód (inwestycja w jakość), a nie chciwość." },
                    { t: "Anchoring", d: "Cena 150 zł wydaje się OK, jeśli obok stoi pakiet VIP za 300 zł." },
                    { t: "Pre-framing", d: "Daj wartość PRZED podwyżką. Zbuduj bank zaufania, a łatwiej przełkną zmianę." }
                ].map((p, i) => (
                    <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-amber-500 text-sm mb-1">{p.t}</h4>
                        <p className="text-xs text-slate-400">{p.d}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- MAIN APP SHELL ---

const App = () => {
  const [activeTab, setActiveTab] = useState('checklist');
  const [profession, setProfession] = useState('trainer');
  
  // Checklist State
  const [checklistState, setChecklistState] = useState({
      capacity: 90, totalCalls: 10, wonCalls: 8, costIncrease: true, goldenWindow: 'january', signals: {}
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900 pb-12">
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <Sword className="text-amber-500 w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white leading-none mb-1">
                    GILDIA <span className="text-amber-500">TRENERÓW</span>
                    </h1>
                    <select 
                        value={profession} 
                        onChange={(e) => setProfession(e.target.value)}
                        className="bg-slate-800 text-[10px] uppercase font-bold text-slate-400 rounded px-2 py-0.5 border border-slate-700 outline-none focus:border-amber-500"
                    >
                        {Object.entries(PROFESSIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex overflow-x-auto gap-2 pb-1 md:pb-0 no-scrollbar">
               <NavButton id="checklist" label="Checklista" icon={CheckCircle} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="calculator" label="Symulator" icon={Calculator} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="strategy" label="Strategia" icon={Target} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="valuestack" label="Value Stack" icon={Layers} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="scripts" label="Gotowce" icon={MessageSquare} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="plan" label="Plan 30 Dni" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="education" label="Wiedza" icon={Lightbulb} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'checklist' && <ChecklistTab state={checklistState} setState={setChecklistState} />}
        {activeTab === 'calculator' && <SimulatorTab profession={profession} />}
        {activeTab === 'strategy' && <StrategyTab />}
        {activeTab === 'valuestack' && <ValueStackTab />}
        {activeTab === 'scripts' && <TemplatesTab />}
        {activeTab === 'plan' && <PlanTab />}
        {activeTab === 'education' && <ErrorsTab />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 text-center text-slate-600 text-xs mt-12 pt-8 border-t border-slate-800">
        <p>Narzędzie wewnętrzne Gildii Trenerów. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
};

export default App;
