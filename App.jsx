import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, TrendingUp, Users, CheckCircle, ShieldAlert, 
  Wallet, Clock, Sword, ScrollText, Target, Info, Coins, 
  Settings2, Activity, Dumbbell, Apple, Brain, Layers, 
  CalendarCheck, Copy, Printer, ChevronDown, ChevronUp,
  MessageSquare, Save, Edit3, ArrowRight, BarChart3, HelpCircle
} from 'lucide-react';

// --- KONFIGURACJA I DANE ---

const PROFESSIONS = {
  trainer: { 
    label: "Trener Personalny", 
    icon: Dumbbell, 
    sessionName: "trening", 
    variableName: "koszt dojazdu/siłowni",
    stack: [
      { id: 'video', label: 'Biblioteka ćwiczeń wideo', cost: 'Niski (raz nagrane)', value: 'Wysoka (dostęp 24/7)' },
      { id: 'report', label: 'Raport postępów (PDF)', cost: 'Średni (czas)', value: 'Wysoka (dowód efektów)' },
      { id: 'community', label: 'Grupa wsparcia (FB/Discord)', cost: 'Niski', value: 'Średnia (społeczność)' },
      { id: 'priority', label: 'Priorytet na WhatsApp', cost: 'Wysoki (uwaga)', value: 'Bardzo wysoka (bezpieczeństwo)' }
    ]
  },
  dietitian: { 
    label: "Dietetyk", 
    icon: Apple, 
    sessionName: "konsultacja", 
    variableName: "koszt materiałów",
    stack: [
      { id: 'shopping', label: 'Interaktywna lista zakupów', cost: 'Niski', value: 'Wysoka (wygoda)' },
      { id: 'eating_out', label: 'Poradnik "Jedzenie na mieście"', cost: 'Niski (raz zrobiony)', value: 'Średnia' },
      { id: 'habits', label: 'Checklista nawyków (tracker)', cost: 'Niski', value: 'Średnia (grywalizacja)' },
      { id: 'recipes', label: 'Baza zamienników produktów', cost: 'Niski', value: 'Wysoka (elastyczność)' }
    ]
  },
  physio: { 
    label: "Fizjoterapeuta", 
    icon: Activity, 
    sessionName: "wizyta", 
    variableName: "koszt jednorazowy",
    stack: [
      { id: 'home_ex', label: 'Wideo z instruktażem do domu', cost: 'Niski', value: 'Bardzo wysoka (skuteczność)' },
      { id: 'bands', label: 'Zestaw gum w cenie', cost: 'Niski (koszt gumy)', value: 'Wysoka (prezent)' },
      { id: 'plan', label: 'Plan powrotu do sportu (PDF)', cost: 'Średni', value: 'Wysoka (jasna ścieżka)' }
    ]
  }
};

const STRATEGIES = {
  inflation: {
    title: "Korekta Inflacyjna",
    range: "3-8%",
    desc: "Bezpieczna, nudna, konieczna. Klient traktuje to jako 'koszt życia'. Stosuj, gdy dawno nie podnosiłeś cen, a Twoje koszty wzrosły.",
    pros: ["Niskie ryzyko odejść", "Łatwa akceptacja"],
    cons: ["Nie zwiększa realnie dochodu, tylko wyrównuje"]
  },
  quality: {
    title: "Wzrost Jakości",
    range: "10-25%",
    desc: "Standardowa podwyżka biznesowa. Masz nowe certyfikaty, lepszy sprzęt, lepsze wyniki? Klient płaci za upgrade.",
    pros: ["Buduje autorytet", "Zdrowy wzrost marży"],
    cons: ["Wymaga uzasadnienia (Value Stack)"]
  },
  reposition: {
    title: "Repozycjonowanie",
    range: "30-50%+",
    desc: "Rewolucja. Zmieniasz grupę docelową (np. z 'Kowalskiego' na 'Biznes/Sport'). Liczysz się z wymianą bazy klientów.",
    pros: ["Skokowy wzrost dochodu", "Mniej pracy, lepsi klienci"],
    cons: ["Duże ryzyko odejść", "Wymaga silnego marketingu"]
  },
  hybrid: {
    title: "Model Hybrydowy",
    range: "Mix",
    desc: "Rekomendowane! Nowi klienci płacą od razu 100% nowej stawki. Starzy dostają mniejszą podwyżkę lub długi okres ochronny.",
    pros: ["Wilk syty i owca cała", "Lojalność stałych klientów"],
    cons: ["Wymaga zarządzania dwoma cennikami przez chwilę"]
  }
};

// --- LOGIKA ---

const calculateChecklistScore = (inputs) => {
  const { capacity, conversion, costIncrease, goldenWindow, signals } = inputs;
  const signalsCount = Object.values(signals).filter(Boolean).length;
  
  let score = signalsCount; // 1 pkt za każdy sygnał
  if (capacity >= 85) score += 2;
  if (conversion >= 80) score += 2; // Wysoka konwersja = za tanio
  if (costIncrease) score += 1;
  if (['january', 'september', 'yearEnd'].includes(goldenWindow)) score += 1;

  let status = { label: "NISKI PRIORYTET", color: "text-slate-400", bg: "bg-slate-800", desc: "Twoja sytuacja jest stabilna. Skup się na marketingu." };
  
  if (score >= 7) {
    status = { label: "KONIECZNIE PODNIEŚ CENY!", color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "Tracisz pieniądze każdego dnia. Masz idealne warunki do podwyżki." };
  } else if (score >= 4) {
    status = { label: "CZAS NA ANALIZĘ", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Masz mocne sygnały ostrzegawcze. Przygotuj się do korekty." };
  }

  return { score, status };
};

const runSimulation = (inputs) => {
  const safeClients = Math.max(0, Number(inputs.clients) || 0);
  const currentSessions = safeClients * (Number(inputs.sessions) || 0);
  const currentRevenue = currentSessions * (Number(inputs.price) || 0);
  const currentCosts = (Number(inputs.fixedCosts) || 0) + (currentSessions * (Number(inputs.varCost) || 0));
  const currentProfit = currentRevenue - currentCosts;

  const newPrice = (Number(inputs.price) || 0) * (1 + (Number(inputs.increase) || 0) / 100);
  
  let clientsLost = 0;
  if (inputs.churnType === 'percent') {
      clientsLost = safeClients * ((Number(inputs.churn) || 0) / 100);
  } else {
      clientsLost = Number(inputs.churnValue) || 0; 
  }
  
  const clientsLeft = Math.max(0, safeClients - clientsLost);
  const newSessions = clientsLeft * (Number(inputs.sessionsAfter) || 0); 
  const newRevenue = newSessions * newPrice;
  const newCosts = (Number(inputs.fixedCosts) || 0) + (newSessions * (Number(inputs.varCost) || 0));
  const newProfit = newRevenue - newCosts;

  // Suggested Strategy
  let suggestedStrategy = 'inflation';
  if (inputs.increase >= 30) suggestedStrategy = 'reposition';
  else if (inputs.increase >= 10) suggestedStrategy = 'quality';

  return {
    currentRevenue, currentProfit,
    newRevenue, newProfit,
    diff: inputs.showCosts ? (newProfit - currentProfit) : (newRevenue - currentRevenue),
    newPrice: Math.ceil(newPrice),
    clientsLost, clientsLeft,
    suggestedStrategy
  };
};

const formatCurrency = (val) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val || 0);

// --- KOMPONENTY UI ---

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-1 cursor-help">
    <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-amber-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-800 border border-slate-700 rounded shadow-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-tight">
      {text}
    </div>
  </div>
);

const SmartInput = ({ label, value, onChange, min, max, step, unit, hint, tooltip, type = "number", markers }) => (
  <div className="mb-5">
    <div className="flex justify-between items-end mb-2">
      <label className="text-sm font-medium text-slate-300 flex items-center">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded px-2 focus-within:border-amber-500 transition-colors">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 bg-transparent py-1 text-right text-sm font-bold text-white focus:outline-none"
          step={step}
        />
        {unit && <span className="text-[10px] text-slate-500 select-none">{unit}</span>}
      </div>
    </div>
    {hint && <p className="text-[10px] text-slate-500 mb-2">{hint}</p>}
    <div className="relative h-5 flex items-center">
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 z-10 relative"
        />
        {markers && markers.map((m, idx) => (
            <div key={idx} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-0" style={{ left: `${(m.at / max) * 100}%` }}>
                <div className={`w-0.5 h-3 ${m.color} mb-4`}></div>
                <span className={`text-[8px] font-bold uppercase whitespace-nowrap absolute -top-3 ${m.textColor || 'text-slate-500'}`}>{m.label}</span>
            </div>
        ))}
    </div>
  </div>
);

const NavButton = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
      activeTab === id ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden md:inline">{label}</span>
  </button>
);

// --- SEKCJA 1: DIAGNOZA (Checklista) ---

const DiagnosisTab = ({ state, setState }) => {
  const result = calculateChecklistScore(state);
  const toggleSignal = (idx) => setState(p => ({...p, signals: {...p.signals, [idx]: !p.signals[idx]}}));
  
  const signals = [
    { txt: "Mam kolejkę oczekujących klientów", tip: "Popyt > Podaż = czas na podwyżkę." },
    { txt: "Prawie nikt nie mówi „za drogo”", tip: "Brak obiekcji cenowych oznacza, że jesteś za tani." },
    { txt: "Pracuję po godzinach, żeby spiąć budżet", tip: "Niska stawka zmusza Cię do nadgodzin." },
    { txt: "Czuję frustrację przy odwołanych wizytach", tip: "Każda luka w grafiku boli finansowo." },
    { txt: "Traktują mnie jak kumpla, nie eksperta", tip: "Niska cena obniża autorytet." },
    { txt: "Ceny stoją w miejscu od >18 miesięcy", tip: "Inflacja zjada Twoje zyski." },
    { txt: "Inwestuję w szkolenia więcej niż zarabiam", tip: "Twój rozwój powinien być opłacony przez klientów." },
    { txt: "Przyciągam roszczeniowych klientów", tip: "Niska cena przyciąga trudnych ludzi." },
    { txt: "Konkurencja bierze 30-50% więcej", tip: "Odstajesz od rynku." },
    { txt: "Boję się otworzyć konto bankowe", tip: "Lęk finansowy to sygnał do zmian." }
  ];

  return (
    <div className="animate-in fade-in space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
           <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6">1. Twarde Dane</h3>
           <SmartInput 
             label="Obłożenie kalendarza (Capacity)" unit="%" min={0} max={100} value={state.capacity} onChange={v => setState({...state, capacity: v})}
             tooltip="Ile % Twoich godzin jest zajętych? >85% to sygnał alarmowy."
           />
           <SmartInput 
             label="Wskaźnik Konwersji" unit="%" min={0} max={100} value={state.conversion} onChange={v => setState({...state, conversion: v})}
             tooltip="Ile osób decyduje się na współpracę? >80% bez negocjacji = za tanio."
           />
           <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setState({...state, costIncrease: !state.costIncrease})}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${state.costIncrease ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                 {state.costIncrease && <CheckCircle className="w-3.5 h-3.5 text-slate-900" />}
              </div>
              <span className="text-sm text-slate-300">Moje koszty wzrosły w ostatnich 12 msc</span>
           </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
           <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6">2. Sygnały Ostrzegawcze</h3>
           <div className="space-y-2">
              {signals.map((s, idx) => (
                 <div key={idx} onClick={() => toggleSignal(idx)} className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${state.signals[idx] ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${state.signals[idx] ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                       {state.signals[idx] && <CheckCircle className="w-3.5 h-3.5 text-slate-900" />}
                    </div>
                    <div className="flex-1">
                       <p className={`text-xs font-bold ${state.signals[idx] ? 'text-white' : 'text-slate-400'}`}>{s.txt}</p>
                    </div>
                    <Tooltip text={s.tip} />
                 </div>
              ))}
           </div>
        </div>
      </div>

      <div className={`p-8 rounded-2xl border text-center relative overflow-hidden ${result.status.bg} border-opacity-20`}>
         <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-2">{result.score} pkt</h2>
            <h3 className={`text-xl font-bold uppercase tracking-widest mb-2 ${result.status.color}`}>{result.status.label}</h3>
            <p className="text-slate-300 text-sm max-w-lg mx-auto">{result.status.desc}</p>
         </div>
      </div>
    </div>
  );
};

// --- SEKCJA 2: SYMULATOR ---

const SimulatorTab = ({ state, setState, profession }) => {
  const pConf = PROFESSIONS[profession];
  const res = runSimulation(state);
  
  const saveResult = () => {
    // Prosta symulacja zapisu
    alert("Symulacja zapisana w pamięci przeglądarki!");
    localStorage.setItem('gildia_sim_v1', JSON.stringify(state));
  };

  const statusColor = res.diff > 0 ? "text-emerald-400" : res.diff < 0 ? "text-red-400" : "text-slate-400";
  const statusBg = res.diff > 0 ? "bg-emerald-500/10" : res.diff < 0 ? "bg-red-500/10" : "bg-slate-800";

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
       {/* Parametry */}
       <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Parametry Biznesowe</h3>
                <button onClick={saveResult} className="text-xs text-slate-500 hover:text-white flex items-center gap-1"><Save className="w-3 h-3"/> Zapisz</button>
             </div>
             
             <SmartInput label="Liczba klientów" unit="os." value={state.clients} onChange={v => setState({...state, clients: v})} min={1} max={100} />
             <SmartInput label={`Średnio ${pConf.sessionName}ów / klienta`} unit="szt." value={state.sessions} onChange={v => setState({...state, sessions: v})} min={1} max={30} />
             <SmartInput label="Aktualna stawka (szt.)" unit="PLN" value={state.price} onChange={v => setState({...state, price: v})} min={10} max={1000} step={5} />
             
             <div className="py-4 border-t border-slate-800">
                <button onClick={() => setState({...state, showCosts: !state.showCosts})} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-4">
                   <Coins className="w-4 h-4"/> {state.showCosts ? "Ukryj Koszty" : "Uwzględnij Koszty (Opcjonalne)"}
                </button>
                {state.showCosts && (
                   <div className="space-y-4 animate-in slide-in-from-top-2">
                      <SmartInput label="Koszty stałe (miesięcznie)" unit="PLN" value={state.fixedCosts} onChange={v => setState({...state, fixedCosts: v})} min={0} max={50000} step={100} hint="ZUS, lokal, księgowość" />
                      <SmartInput label={pConf.variableName} unit="PLN" value={state.varCost} onChange={v => setState({...state, varCost: v})} min={0} max={500} step={5} />
                   </div>
                )}
             </div>

             <div className="h-px bg-slate-800 mb-6"></div>
             
             <SmartInput 
                label="Planowana podwyżka" unit="%" value={state.increase} onChange={v => setState({...state, increase: v})} min={0} max={100} 
                hint={`Nowa cena: ${Math.ceil(state.price * (1 + state.increase/100))} PLN`}
             />
             <SmartInput 
                label="Szacowana utrata klientów" unit="%" value={state.churn} onChange={v => setState({...state, churn: v})} min={0} max={100}
                markers={[{at: 10, label: 'ZDROWY', color: 'bg-emerald-500'}, {at: 20, label: 'RYZYKO', color: 'bg-red-500'}]}
                tooltip="Zdrowy churn po podwyżce to 10-15%. Oznacza naturalną wymianę klientów."
             />
          </div>
       </div>

       {/* Wyniki */}
       <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
             {/* Sugestia Strategii */}
             <div className="absolute top-4 right-4 bg-slate-800 text-slate-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-slate-700">
                Sugerowana: {STRATEGIES[res.suggestedStrategy].title}
             </div>

             <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{state.showCosts ? "ZYSK" : "PRZYCHÓD"} MIESIĘCZNY</p>
                   <div className="flex items-baseline gap-3">
                      <h2 className={`text-5xl font-black ${res.diff >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(state.showCosts ? res.newProfit : res.newRevenue)}</h2>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${statusColor} ${statusBg}`}>
                         {res.diff > 0 ? '+' : ''}{formatCurrency(res.diff)}
                      </span>
                   </div>
                   <p className="text-xs text-slate-500 mt-2">Poprzednio: {formatCurrency(state.showCosts ? res.currentProfit : res.currentRevenue)}</p>
                </div>
             </div>

             {/* Karta Werdyktu */}
             <div className={`p-6 rounded-xl border ${res.diff >= 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${statusColor}`}>
                   {res.diff >= 0 ? <CheckCircle className="w-5 h-5"/> : <ShieldAlert className="w-5 h-5"/>}
                   {res.diff >= 0 ? "OPŁACALNE" : "NIEOPŁACALNE"}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                   {res.diff >= 0 
                     ? `Przy podwyżce o ${state.increase}% zarabiasz więcej, nawet jeśli odejdzie ${res.clientsLost.toFixed(1)} osób. Masz więcej czasu i pieniędzy.` 
                     : `Przy założonym churnie (${state.churn}%) tracisz pieniądze. Musisz albo zmniejszyć churn (lepsza oferta), albo zwiększyć podwyżkę.`}
                </p>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- SEKCJA 3: AKCJA (Wdrożenie) ---

const ActionTab = ({ simState, profession }) => {
  const [step, setStep] = useState(1);
  const [selectedStrategy, setSelectedStrategy] = useState('quality');
  const [stack, setStack] = useState({});
  const [msgType, setMsgType] = useState('sandwich');
  const [customMsg, setCustomMsg] = useState('');
  const [dates, setDates] = useState({ start: '', grace: '' });

  const pConf = PROFESSIONS[profession];
  const newPrice = Math.ceil(simState.price * (1 + simState.increase/100));

  // Generowanie wiadomości
  useEffect(() => {
    const stackItems = pConf.stack.filter(i => stack[i.id]).map(i => i.label).join(', ');
    const investmentText = stackItems ? `Wprowadzam nowe elementy, takie jak: ${stackItems}, aby zapewnić Ci jeszcze lepsze efekty.` : `Dzięki tej zmianie mogę dalej inwestować w jakość naszych ${pConf.sessionName}ów.`;
    
    const templates = {
      sandwich: `Cześć [IMIĘ],\n\nDzięki za super współpracę! Widzę Twój progres i mega mnie to cieszy.\n\nPiszę, bo od ${dates.start || '[DATA]'} aktualizuję cennik. Cena za ${pConf.sessionName} wzrośnie z ${simState.price} zł do ${newPrice} zł.\n\n${investmentText}\n\nDla Ciebie jako stałego klienta nowa stawka wchodzi dopiero od ${dates.grace || '[DATA KARENCJI]'}.\n\nDziałamy dalej! 💪`,
      official: `Szanowni Państwo,\n\nInformuję o waloryzacji cennika od ${dates.start || '[DATA]'}. Nowa cena wyniesie ${newPrice} zł.\n\nZmiana ta podyktowana jest: ${stackItems || 'wzrostem kosztów i inwestycjami'}.\n\nDla obecnych klientów przewidziałem okres przejściowy do ${dates.grace || '[DATA KARENCJI]'}.\n\nZ wyrazami szacunku,`
    };
    setCustomMsg(templates[msgType]);
  }, [msgType, stack, simState.price, newPrice, dates, profession]);

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
       {/* Nawigacja Kroków */}
       <div className="lg:col-span-3 space-y-2">
          {['1. Strategia', '2. Value Stack', '3. Komunikacja', '4. Plan Działań'].map((l, i) => (
             <button key={i} onClick={() => setStep(i+1)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${step === i+1 ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                {l}
             </button>
          ))}
       </div>

       {/* Treść Kroku */}
       <div className="lg:col-span-9 bg-slate-900 p-8 rounded-2xl border border-slate-800 min-h-[500px]">
          {step === 1 && (
             <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Target className="text-amber-500"/> Wybierz Strategię</h3>
                <div className="grid md:grid-cols-2 gap-4">
                   {Object.entries(STRATEGIES).map(([k, s]) => (
                      <div key={k} onClick={() => setSelectedStrategy(k)} className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedStrategy === k ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 hover:bg-slate-800'}`}>
                         <div className="flex justify-between mb-2">
                            <span className="font-bold text-white">{s.title}</span>
                            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{s.range}</span>
                         </div>
                         <p className="text-xs text-slate-400 mb-4">{s.desc}</p>
                         <div className="text-[10px] text-emerald-400 flex gap-2"><CheckCircle className="w-3 h-3"/> {s.pros[0]}</div>
                      </div>
                   ))}
                </div>
                <button onClick={() => setStep(2)} className="float-right bg-white text-slate-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">Dalej <ArrowRight className="w-4 h-4"/></button>
             </div>
          )}

          {step === 2 && (
             <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="text-amber-500"/> Zbuduj Value Stack</h3>
                <p className="text-slate-400 text-sm">Zaznacz, co dodasz do oferty, aby uzasadnić nową cenę ({newPrice} zł). Wybrane elementy pojawią się w wiadomości.</p>
                <div className="grid md:grid-cols-2 gap-3">
                   {pConf.stack.map(item => (
                      <div key={item.id} onClick={() => setStack({...stack, [item.id]: !stack[item.id]})} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${stack[item.id] ? 'bg-amber-500/10 border-amber-500' : 'bg-slate-950 border-slate-700'}`}>
                         <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${stack[item.id] ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                            {stack[item.id] && <CheckCircle className="w-3.5 h-3.5 text-slate-900"/>}
                         </div>
                         <div>
                            <p className="font-bold text-sm text-slate-200">{item.label}</p>
                            <p className="text-[10px] text-slate-500">Koszt: {item.cost}</p>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="flex justify-end gap-4 mt-8">
                   <button onClick={() => setStep(1)} className="text-slate-500 text-sm hover:text-white">Wstecz</button>
                   <button onClick={() => setStep(3)} className="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 flex items-center gap-2">Dalej <ArrowRight className="w-4 h-4"/></button>
                </div>
             </div>
          )}

          {step === 3 && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2"><MessageSquare className="text-amber-500"/> Generuj Wiadomość</h3>
                   <select value={msgType} onChange={e => setMsgType(e.target.value)} className="bg-slate-800 text-white text-xs p-2 rounded border border-slate-700">
                      <option value="sandwich">Metoda Kanapki</option>
                      <option value="official">Oficjalny</option>
                   </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <SmartInput label="Data zmiany" type="text" value={dates.start} onChange={v => {}}  unit="" hint="Wpisz np. 1 Stycznia" /> 
                   {/* Hack: SmartInput expects number, but for demo UI we use simple inputs below for dates */}
                   <div className="space-y-1">
                      <label className="text-xs text-slate-400">Data wejścia (Nowi)</label>
                      <input type="text" placeholder="np. 1 Stycznia" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" onChange={e => setDates({...dates, start: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs text-slate-400">Data dla stałych</label>
                      <input type="text" placeholder="np. 1 Marca" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" onChange={e => setDates({...dates, grace: e.target.value})} />
                   </div>
                </div>

                <div className="relative">
                   <textarea 
                      value={customMsg} 
                      onChange={e => setCustomMsg(e.target.value)} 
                      className="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 font-mono leading-relaxed focus:border-amber-500 outline-none resize-none"
                   />
                   <button onClick={() => {navigator.clipboard.writeText(customMsg); alert("Skopiowano!")}} className="absolute bottom-4 right-4 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg">
                      <Copy className="w-4 h-4"/> Kopiuj
                   </button>
                </div>
                
                <div className="flex justify-end gap-4">
                   <button onClick={() => setStep(2)} className="text-slate-500 text-sm hover:text-white">Wstecz</button>
                   <button onClick={() => setStep(4)} className="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 flex items-center gap-2">Dalej <ArrowRight className="w-4 h-4"/></button>
                </div>
             </div>
          )}

          {step === 4 && (
             <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><CalendarCheck className="text-amber-500"/> Plan Wdrożenia</h3>
                <div className="space-y-4">
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-4 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-500 font-bold">✓</div>
                      <div><h4 className="font-bold text-slate-400">Analiza i Strategia</h4><p className="text-xs text-slate-600">Zrobione w poprzednich krokach.</p></div>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">2</div>
                      <div><h4 className="font-bold text-white">Przygotowanie Oferty (Tydzień 2)</h4><p className="text-xs text-slate-400">Dopracuj materiały z Value Stack (PDFy, nagrania). Zaktualizuj grafikę cennika.</p></div>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">3</div>
                      <div><h4 className="font-bold text-white">Komunikacja (Tydzień 3)</h4><p className="text-xs text-slate-400">Wyślij przygotowaną wiadomość do stałych klientów. Zbieraj feedback.</p></div>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">4</div>
                      <div><h4 className="font-bold text-white">Start (Tydzień 4)</h4><p className="text-xs text-slate-400">Zmień ceny oficjalnie dla nowych klientów. Monitoruj churn.</p></div>
                   </div>
                </div>
                <div className="flex justify-center mt-8">
                   <button onClick={() => window.print()} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm"><Printer className="w-4 h-4"/> Drukuj Plan</button>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

// --- GŁÓWNY LAYOUT ---

const App = () => {
  const [activeTab, setActiveTab] = useState('diagnosis');
  const [profession, setProfession] = useState('trainer');
  
  // GLOBALNY STAN (Współdzielony między symulatorem a gotowcami)
  const [simState, setSimState] = useState({
    clients: 20, sessions: 8, price: 150, fixedCosts: 2000, varCost: 0,
    increase: 20, churn: 15, churnType: 'percent', sessionsAfter: 8,
    showCosts: false
  });

  const [checklistState, setChecklistState] = useState({
    capacity: 0, conversion: 0, costIncrease: false, goldenWindow: 'other', signals: {}
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900 pb-12">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20"><Sword className="text-amber-500 w-6 h-6" /></div>
                <div>
                   <h1 className="text-lg font-bold text-white leading-none mb-1">GILDIA <span className="text-amber-500">TRENERÓW</span></h1>
                   <select value={profession} onChange={(e) => setProfession(e.target.value)} className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 rounded border border-slate-700 outline-none focus:border-amber-500 py-1 px-2">
                      {Object.entries(PROFESSIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                   </select>
                </div>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
               <NavButton id="diagnosis" label="1. Diagnoza" icon={Activity} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="simulator" label="2. Liczby" icon={Calculator} activeTab={activeTab} setActiveTab={setActiveTab} />
               <NavButton id="action" label="3. Wdrożenie" icon={Target} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'diagnosis' && <DiagnosisTab state={checklistState} setState={setChecklistState} />}
        {activeTab === 'simulator' && <SimulatorTab state={simState} setState={setSimState} profession={profession} />}
        {activeTab === 'action' && <ActionTab simState={simState} profession={profession} />}
      </main>

      <footer className="max-w-4xl mx-auto px-4 text-center text-slate-600 text-xs mt-12 pt-8 border-t border-slate-800">
        <p>System Podnoszenia Cen v4.0 &bull; Gildia Trenerów &bull; Wszelkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
};

export default App;
