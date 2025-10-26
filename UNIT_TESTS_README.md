# 🧪 Unit Testy

## Co jsou unit testy?

Unit testy testují **jednotlivé části kódu** izolovaně od zbytku aplikace. Běží pouze během **vývoje**, **nikoli v produkci**.

## 🚀 Spuštění testů

```bash
# Jednorázové spuštění všech testů
npm test

# Spuštění testů v watch módu (automaticky při změnách)
npm run test:watch

# Spuštění s pokrytím kódu
npm run test:coverage
```

## 📁 Struktura testů

```
src/__tests__/
├── components/          # Testy React komponent
│   └── ContractTemplatesManager.test.jsx
└── utils/              # Testy utility funkcí
    ├── propertyFilters.test.js
    └── demandFilters.test.js
```

## ✅ Co testujeme?

### 🔧 Utility funkce
- **Property filtering** - logika filtrování nemovitostí
- **Demand filtering** - logika filtrování poptávek
- **Data validation** - validace dat
- **Business logic** - obchodní pravidla

### 🖥️ React komponenty
- **Rendering** - správné zobrazení
- **Props handling** - zpracování props
- **State changes** - změny stavu
- **User interactions** - interakce uživatele

## 🎯 Výhody unit testů

1. **🚨 Detekce chyb** - chyby se odhalí hned při vývoji
2. **🔄 Refaktoring** - bezpečně měníte kód bez strachu z rozbití
3. **📚 Dokumentace** - testy ukazují, jak kód funguje
4. **🚀 CI/CD** - automatické testování při každém commitu

## ❌ Co se NETESTUJE?

- **UI vzhled** (použijte E2E testy)
- **HTTP requesty** (mockujte je)
- **Databáze** (použijte integration testy)
- **Externí API** (mockujte je)

## 🔧 Nástroje

- **Jest** - testovací framework
- **React Testing Library** - testování React komponent
- **jsdom** - simulace DOM prostředí

## 📊 Příklady testů

### Test filtrování nemovitostí
```javascript
test('filters properties by agent_id correctly', () => {
  const filtered = properties.filter(p =>
    Number(p.agent_id) === Number(currentUser.id)
  );
  expect(filtered).toHaveLength(2);
});
```

### Test React komponenty
```javascript
test('renders templates list', () => {
  render(<ContractTemplatesManager templates={mockTemplates} />);
  expect(screen.getByText('Letter of Intent')).toBeInTheDocument();
});
```

## 🎯 Doporučení

- **Psát testy** před implementací funkcí (TDD)
- **Testovat edge cases** - krajní hodnoty, chybové stavy
- **Mockovat externí závislosti** - API, databáze
- **Udržovat testy aktuální** - při změnách kódu upravit testy

## ⚡ Produkční prostředí

**Unit testy se v produkci NESPUŠTĚJÍ!** Jsou součástí development procesu:

- ✅ **Development** - testy běží při vývoji
- ✅ **CI/CD** - testy běží při build procesu
- ❌ **Production** - testy se do buildu nebalí
- ❌ **Runtime** - testy neovlivňují výkon aplikace

## 📈 Přidání nových testů

1. Vytvořte soubor `*.test.js` nebo `*.test.jsx`
2. Použijte `describe()` pro skupinu testů
3. Použijte `test()` pro jednotlivé testy
4. Použijte `expect()` pro assertions

```bash
# Příklad
npm test -- --testPathPattern=propertyFilters
```
