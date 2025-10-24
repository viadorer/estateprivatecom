# 🤝 Přispívání do projektu

Děkujeme za váš zájem přispět do Task Manager projektu!

## 🚀 Jak začít

1. **Forkněte repozitář**
2. **Naklonujte si svůj fork**
   ```bash
   git clone https://github.com/vase-jmeno/reactrealprojekt.git
   cd reactrealprojekt
   ```

3. **Nainstalujte závislosti**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Vytvořte novou větev**
   ```bash
   git checkout -b feature/nova-funkce
   ```

## 📝 Pravidla pro commit zprávy

Používejte konvenci:

```
typ(oblast): Stručný popis

Detailnější popis (volitelné)
```

### Typy commitů:
- `feat`: Nová funkce
- `fix`: Oprava chyby
- `docs`: Změny v dokumentaci
- `style`: Formátování, chybějící středníky, atd.
- `refactor`: Refaktoring kódu
- `test`: Přidání testů
- `chore`: Údržba, aktualizace závislostí

### Příklady:
```
feat(tasks): Přidání filtru podle priority
fix(api): Oprava chyby při mazání projektu
docs(readme): Aktualizace instalačních instrukcí
```

## 🎨 Coding Standards

### JavaScript/React
- Používejte **ES6+** syntax
- Preferujte **arrow functions**
- Používejte **const** a **let**, ne **var**
- Komponenty v **PascalCase**
- Funkce v **camelCase**

### Formátování
- **2 mezery** pro odsazení
- **Středníky** na konci příkazů
- **Single quotes** pro stringy
- **Trailing commas** v objektech a polích

### Příklad:
```javascript
const MyComponent = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="container">
      <h1>{title}</h1>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## 🧪 Testování

Před odesláním pull requestu:

1. **Otestujte backend**
   ```bash
   cd backend
   npm start
   # Zkontrolujte, že všechny endpointy fungují
   ```

2. **Otestujte frontend**
   ```bash
   cd frontend
   npm run dev
   # Zkontrolujte, že UI funguje správně
   ```

3. **Zkontrolujte konzoli**
   - Žádné chyby v terminálu
   - Žádné chyby v browser console

## 📋 Pull Request Process

1. **Aktualizujte dokumentaci**
   - Pokud přidáváte novou funkci, aktualizujte README.md
   - Přidejte komentáře do kódu

2. **Popište změny**
   - Co jste změnili a proč
   - Jak to otestovat
   - Screenshots (pokud je to UI změna)

3. **Vytvořte Pull Request**
   - Použijte popisný název
   - Vyplňte šablonu PR

### Šablona Pull Requestu:
```markdown
## Popis změn
Stručný popis toho, co tento PR dělá.

## Typ změny
- [ ] Nová funkce
- [ ] Oprava chyby
- [ ] Dokumentace
- [ ] Refaktoring

## Jak otestovat
1. Krok 1
2. Krok 2
3. Krok 3

## Checklist
- [ ] Kód funguje lokálně
- [ ] Žádné console.error
- [ ] Dokumentace aktualizována
- [ ] Commit zprávy jsou správné
```

## 🐛 Hlášení chyb

Při hlášení chyby uveďte:

1. **Popis chyby** - Co se stalo?
2. **Kroky k reprodukci** - Jak chybu vyvolat?
3. **Očekávané chování** - Co mělo nastat?
4. **Screenshots** - Pokud je to možné
5. **Prostředí**:
   - OS (macOS, Windows, Linux)
   - Node.js verze
   - Browser a verze

### Šablona Issue:
```markdown
## Popis chyby
Stručný popis problému.

## Kroky k reprodukci
1. Přejděte na...
2. Klikněte na...
3. Vidíte chybu...

## Očekávané chování
Co mělo nastat.

## Screenshots
Přidejte screenshots.

## Prostředí
- OS: macOS 14.0
- Node.js: v18.17.0
- Browser: Chrome 119
```

## 💡 Návrhy na nové funkce

Před implementací nové funkce:

1. **Vytvořte Issue** s návrhem
2. **Diskutujte** s maintainery
3. **Počkejte na schválení**
4. **Implementujte** funkci
5. **Vytvořte Pull Request**

## 🎯 Priority

### Vysoká priorita
- Kritické bugy
- Bezpečnostní problémy
- Performance problémy

### Střední priorita
- Nové funkce
- Vylepšení UX
- Refaktoring

### Nízká priorita
- Dokumentace
- Drobné UI tweaky
- Nice-to-have funkce

## 📚 Další zdroje

- [React Best Practices](https://react.dev/learn)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Git Commit Messages](https://www.conventionalcommits.org/)

## 🙏 Děkujeme!

Každý příspěvek je vítán, ať už je to:
- Oprava překlepu v dokumentaci
- Hlášení chyby
- Návrh na vylepšení
- Implementace nové funkce

**Děkujeme za váš čas a úsilí!** 🎉
