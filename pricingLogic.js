/**
 * Moduł logiki biznesowej dla Kalkulatora Gildii Trenerów.
 * Zawiera obliczenia symulacji, scoring checklisty i rekomendacje.
 */

// --- SYMULATOR ---

export const calculateNewPrice = (price, increasePercent) => {
  return price * (1 + increasePercent / 100);
};

export const calculateClientsAfter = (clientsBefore, churnPercent) => {
  const lost = clientsBefore * (churnPercent / 100);
  return Math.max(0, clientsBefore - lost);
};

export const calculateMonthlyRevenue = (clients, price) => {
  return clients * price;
};

export const calculateBreakEvenChurnPercent = (priceIncreasePercent) => {
  // Wzór: churn_break_even = p / (1 + p) (gdzie p to ułamek)
  // Dla %: churn = (inc / 100) / (1 + inc / 100) * 100
  const p = priceIncreasePercent / 100;
  return (p / (1 + p)) * 100;
};

export const runSimulation = (inputs) => {
  const { clients, sessionsPerClient, price, increasePercent, churnPercent, sessionsPerClientAfter, fixedCosts, variableCost } = inputs;

  // Walidacja podstawowa
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
  // Status opłacalności (bazujemy na zysku jeśli koszty włączone, lub przychodzie)
  // Tutaj dla uproszczenia zwracamy różnicę zysku jako wskaźnik
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

// --- CHECKLISTA ---

export const calculateChecklistScore = (inputs) => {
  const { 
    capacityUtilization, 
    costIncrease, 
    goldenWindow, 
    signalsCheckedCount 
  } = inputs;

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

  return {
    rawScore,
    recommendation
  };
};

// --- SZABLONY WIADOMOŚCI ---

export const buildMessage = (type, context) => {
  const { clientName, oldPrice, newPrice, packageName, startDate, graceDate } = context;
  
  const templates = {
    sandwich: `Cześć ${clientName},\n\nNa początku chcę Ci bardzo podziękować za dotychczasową współpracę. Widzę, jak przez ostatnie miesiące poprawiła się Twoja forma i mega mnie to cieszy.\n\nPiszę, bo od ${startDate} aktualizuję cennik moich usług. Cena za ${packageName} wzrośnie z ${oldPrice} zł do ${newPrice} zł.\n\nDzięki tej zmianie mogę dalej inwestować w jakość naszej współpracy. Ponieważ jesteś stałym klientem, dla Ciebie nowa cena zacznie obowiązywać dopiero od ${graceDate}.\n\nDziałamy dalej i robimy formę. 💪`,
    official: `Szanowny/a ${clientName},\n\nInformuję o planowanej waloryzacji cennika usług od ${startDate}. Nowa cena za ${packageName} wyniesie ${newPrice} zł (dotychczas: ${oldPrice} zł).\n\nZmiana ta podyktowana jest wzrostem kosztów operacyjnych oraz inwestycjami w jakość. Dla obecnych klientów przewidziałem okres przejściowy – nowa stawka obowiązuje od ${graceDate}.\n\nZ wyrazami szacunku,`,
    casual: `Hej ${clientName}! 👋\n\nSzybkie info: od ${startDate} podnoszę ceny za ${packageName} na ${newPrice} zł. Inwestuję w sprzęt i szkolenia, żebyśmy robili jeszcze lepsze wyniki!\n\nDla Ciebie jako stałego klienta - stara cena zostaje jeszcze do ${graceDate}. Dzięki, że jesteś!`,
    vip: `Dzień dobry ${clientName},\n\nW związku z rozwojem oferty premium, od ${startDate} aktualizuję stawkę za ${packageName} do ${newPrice} zł.\n\nJako osoba już ze mną współpracująca, otrzymuje Pan/Pani preferencyjne warunki: nowa stawka wejdzie w życie dopiero ${graceDate}.\n\nDziękuję za zaufanie.`
  };

  return templates[type] || "Wybierz szablon.";
};
