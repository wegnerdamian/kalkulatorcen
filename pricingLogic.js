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
  const { clients, sessionsPerClient, price, increasePercent, churnPercent } = inputs;

  const currentRevenue = calculateMonthlyRevenue(clients * sessionsPerClient, price);
  
  const newPrice = calculateNewPrice(price, increasePercent);
  const clientsAfter = calculateClientsAfter(clients, churnPercent);
  const newRevenue = calculateMonthlyRevenue(clientsAfter * sessionsPerClient, newPrice);
  
  const diffAbs = newRevenue - currentRevenue;
  const diffPercent = currentRevenue > 0 ? (diffAbs / currentRevenue) * 100 : 0;

  // Ocena opłacalności (z buforem +/- 2%)
  let status = 'neutral';
  if (diffPercent > 2) status = 'positive';
  if (diffPercent < -2) status = 'negative';

  // Ocena zdrowia churnu
  let churnHealth = 'optimal';
  if (churnPercent <= 5) churnHealth = 'tooLow';
  if (churnPercent > 20) churnHealth = 'tooHigh';

  return {
    currentRevenue,
    newRevenue,
    newPrice: Math.round(newPrice),
    clientsAfter,
    clientsLost: clients - clientsAfter,
    diffAbs,
    diffPercent,
    status, // positive, neutral, negative
    churnHealth, // tooLow, optimal, tooHigh
    breakEvenChurn: calculateBreakEvenChurnPercent(increasePercent)
  };
};

// --- CHECKLISTA ---

export const calculateChecklistScore = (inputs) => {
  const { 
    capacityUtilization, // %
    costIncrease, // boolean
    goldenWindow, // string key
    signalsCheckedCount // number 0-10
  } = inputs;

  let rawScore = signalsCheckedCount; // Baza: 1 pkt za każdy sygnał (max 10)

  // Capacity logic
  if (capacityUtilization >= 85) rawScore += 2;
  else if (capacityUtilization >= 70) rawScore += 1;

  // Cost increase
  if (costIncrease) rawScore += 1;

  // Golden window
  const goodWindows = ['january', 'september', 'yearEnd'];
  if (goodWindows.includes(goldenWindow)) rawScore += 1;

  // Normalizacja do rekomendacji
  // Max teoretyczny: 10 + 2 + 1 + 1 = 14.
  // Mapujemy na poziomy z treści.
  
  let recommendation = {
    level: 'wait',
    title: 'Wynik niski (0-3)',
    desc: 'Twoje ceny prawdopodobnie nie są priorytetowym problemem. Najpierw zadbaj o pozyskiwanie klientów, jakość usługi i podstawowy marketing. Podwyżkę zostaw na później.',
    strategy: 'inflation' // fallback
  };

  if (rawScore >= 9) {
    recommendation = {
      level: 'reposition',
      title: 'Wynik bardzo wysoki (9+)',
      desc: 'Twoje ceny są zdecydowanie za niskie względem obłożenia, wartości i rynku. Spokojnie możesz myśleć o mocniejszym ruchu (repozycjonowanie, +30–50%), jeśli jesteś gotów(-a) na wymianę części bazy klientów.',
      strategy: 'reposition'
    };
  } else if (rawScore >= 7) {
    recommendation = {
      level: 'grow',
      title: 'Wynik wysoki (7-8)',
      desc: 'To dobry moment na podwyżkę. Z danych wynika, że jesteś przeciążony(-a), za tani(-a) i dokładasz do rozwoju zawodowego. Rozważ podwyżkę 10–20% zgodnie ze strategią „Wzrost jakości”.',
      strategy: 'quality'
    };
  } else if (rawScore >= 4) {
    recommendation = {
      level: 'mild',
      title: 'Wynik średni (4-6)',
      desc: 'Masz pierwsze sygnały, że Twoje ceny zaczynają odstawać od rzeczywistości. Rozważ delikatną korektę inflacyjną (np. +3–8%) dla nowych klientów i przygotuj grunt pod większą zmianę.',
      strategy: 'inflation'
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
    sandwich: `Cześć ${clientName},
Na początku chcę Ci bardzo podziękować za dotychczasową współpracę. Widzę, jak przez ostatnie miesiące poprawiła się Twoja forma i mega mnie to cieszy – to w dużej mierze Twoja zasługa.

Piszę, bo od ${startDate} aktualizuję cennik moich usług.
Cena za ${packageName} wzrośnie z ${oldPrice} zł do ${newPrice} zł.

Dzięki tej zmianie mogę dalej inwestować w sprzęt, szkolenia i narzędzia, które przekładają się na szybsze i lepsze efekty moich podopiecznych.

Ponieważ jesteś stałym klientem, chcę, żebyś na tym zyskał(-a):
– dla Ciebie nowa cena zacznie obowiązywać dopiero od ${graceDate}
ALBO
– możesz jeszcze do końca miesiąca wykupić kolejny pakiet w starej cenie.

Jeśli masz jakiekolwiek pytania – śmiało pisz.
Działamy dalej i robimy formę. 💪`,

    official: `Szanowny/a ${clientName},
dziękuję za dotychczasową współpracę i zaufanie, jakim mnie obdarzasz.

W celu utrzymania wysokiej jakości usług oraz dalszego rozwoju zaplecza merytorycznego i sprzętowego, od ${startDate} aktualizuję cennik.
Nowa cena za ${packageName} będzie wynosić ${newPrice} zł (dotychczas: ${oldPrice} zł).

Zmiana ta pozwoli mi nadal zapewniać Panu/Pani opiekę na najwyższym poziomie oraz rozwijać narzędzia, które usprawniają proces współpracy.

Dla obecnych klientów przewidziałem/am okres przejściowy – w Pana/Pani przypadku nowa stawka zacznie obowiązywać od ${graceDate}.

W razie pytań jestem do dyspozycji.
Z wyrazami szacunku,`,

    casual: `Hej ${clientName}! 👋
Krótka sprawa organizacyjna – od ${startDate} podnoszę ceny za ${packageName} z ${oldPrice} zł na ${newPrice} zł.

Robię to po to, żeby dalej dowozić poziom (sprzęt, szkolenia, czas dla podopiecznych), a nie się „rozjechać” finansowo.

Dla Ciebie mam jednak lepsze warunki:
– do ${graceDate} możesz jeszcze działać na starej cenie,
ALBO wykupić teraz pakiet po starej stawce.

Jak coś jest niejasne – pisz śmiało.
Nic się nie zmienia jeśli chodzi o naszą współpracę – dalej ciśniemy. 💪`,

    vip: `Dzień dobry ${clientName},
w związku z rozwojem oferty premium oraz ograniczoną liczbą miejsc we współpracy indywidualnej, od ${startDate} aktualizuję stawkę za ${packageName} do ${newPrice} zł (obecnie: ${oldPrice} zł).

Zmiana ta odzwierciedla aktualny poziom zaangażowania, dostępności oraz rezultatów, jakie osiągają moi klienci.

Jako osoba już ze mną współpracująca, otrzymuje Pan/Pani preferencyjne warunki:
– nowa stawka zacznie obowiązywać dopiero od ${graceDate},
– do tego czasu może Pan/Pani wykupić kolejne pakiety po obecnej cenie.

Dziękuję za zaufanie i cieszę się na dalszą współpracę.`
  };

  return templates[type] || "Wybierz szablon.";
};
