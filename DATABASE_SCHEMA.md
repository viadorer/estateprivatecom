# 📊 Databázové schéma - Task Manager

## Vizuální diagram

```
┌─────────────────────┐
│      USERS          │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email (UNIQUE)      │
│ created_at          │
└─────────────────────┘
         │
         │ 1:N
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐
│     PROJECTS        │    │       TASKS         │
├─────────────────────┤    ├─────────────────────┤
│ id (PK)             │    │ id (PK)             │
│ name                │◄───┤ project_id (FK)     │
│ description         │ 1:N│ user_id (FK)        │
│ user_id (FK)        │    │ title               │
│ status              │    │ description         │
│ created_at          │    │ status              │
└─────────────────────┘    │ priority            │
                           │ due_date            │
                           │ created_at          │
                           │ updated_at          │
                           └─────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
                           ┌─────────────────────┐
                           │     COMMENTS        │
                           ├─────────────────────┤
                           │ id (PK)             │
                           │ content             │
                           │ task_id (FK)        │
                           │ user_id (FK)        │
                           │ created_at          │
                           └─────────────────────┘
```

## Detailní popis tabulek

### 1. USERS (Uživatelé)
Tabulka pro správu uživatelů systému.

| Sloupec    | Typ      | Popis                          | Omezení           |
|------------|----------|--------------------------------|-------------------|
| id         | INTEGER  | Primární klíč                  | PRIMARY KEY, AUTO |
| name       | TEXT     | Jméno uživatele                | NOT NULL          |
| email      | TEXT     | Email uživatele                | UNIQUE, NOT NULL  |
| created_at | DATETIME | Datum vytvoření                | DEFAULT NOW       |

**Vztahy:**
- 1:N s PROJECTS (jeden uživatel může mít více projektů)
- 1:N s TASKS (jeden uživatel může mít přiřazeno více úkolů)
- 1:N s COMMENTS (jeden uživatel může napsat více komentářů)

---

### 2. PROJECTS (Projekty)
Tabulka pro správu projektů.

| Sloupec     | Typ      | Popis                          | Omezení           |
|-------------|----------|--------------------------------|-------------------|
| id          | INTEGER  | Primární klíč                  | PRIMARY KEY, AUTO |
| name        | TEXT     | Název projektu                 | NOT NULL          |
| description | TEXT     | Popis projektu                 |                   |
| user_id     | INTEGER  | Vlastník projektu              | FK -> users(id)   |
| status      | TEXT     | Stav projektu                  | DEFAULT 'active'  |
| created_at  | DATETIME | Datum vytvoření                | DEFAULT NOW       |

**Možné hodnoty status:**
- `active` - Aktivní projekt
- `archived` - Archivovaný projekt

**Vztahy:**
- N:1 s USERS (projekt patří jednomu uživateli)
- 1:N s TASKS (projekt může mít více úkolů)

**Kaskádové mazání:**
- Při smazání uživatele se smažou všechny jeho projekty
- Při smazání projektu se smažou všechny jeho úkoly

---

### 3. TASKS (Úkoly)
Tabulka pro správu úkolů.

| Sloupec     | Typ      | Popis                          | Omezení           |
|-------------|----------|--------------------------------|-------------------|
| id          | INTEGER  | Primární klíč                  | PRIMARY KEY, AUTO |
| title       | TEXT     | Název úkolu                    | NOT NULL          |
| description | TEXT     | Popis úkolu                    |                   |
| status      | TEXT     | Stav úkolu                     | DEFAULT 'todo'    |
| priority    | TEXT     | Priorita úkolu                 | DEFAULT 'medium'  |
| project_id  | INTEGER  | Projekt, ke kterému patří      | FK -> projects(id)|
| user_id     | INTEGER  | Přiřazený uživatel             | FK -> users(id)   |
| due_date    | DATETIME | Termín splnění                 |                   |
| created_at  | DATETIME | Datum vytvoření                | DEFAULT NOW       |
| updated_at  | DATETIME | Datum poslední aktualizace     | DEFAULT NOW       |

**Možné hodnoty status:**
- `todo` - K provedení
- `in_progress` - Probíhá
- `completed` - Dokončeno

**Možné hodnoty priority:**
- `low` - Nízká priorita
- `medium` - Střední priorita
- `high` - Vysoká priorita

**Vztahy:**
- N:1 s PROJECTS (úkol patří jednomu projektu)
- N:1 s USERS (úkol je přiřazen jednomu uživateli)
- 1:N s COMMENTS (úkol může mít více komentářů)

**Kaskádové mazání:**
- Při smazání projektu se smažou všechny jeho úkoly
- Při smazání uživatele se smažou všechny jeho úkoly
- Při smazání úkolu se smažou všechny jeho komentáře

---

### 4. COMMENTS (Komentáře)
Tabulka pro komentáře k úkolům.

| Sloupec    | Typ      | Popis                          | Omezení           |
|------------|----------|--------------------------------|-------------------|
| id         | INTEGER  | Primární klíč                  | PRIMARY KEY, AUTO |
| content    | TEXT     | Obsah komentáře                | NOT NULL          |
| task_id    | INTEGER  | Úkol, ke kterému patří         | FK -> tasks(id)   |
| user_id    | INTEGER  | Autor komentáře                | FK -> users(id)   |
| created_at | DATETIME | Datum vytvoření                | DEFAULT NOW       |

**Vztahy:**
- N:1 s TASKS (komentář patří jednomu úkolu)
- N:1 s USERS (komentář má jednoho autora)

**Kaskádové mazání:**
- Při smazání úkolu se smažou všechny jeho komentáře
- Při smazání uživatele se smažou všechny jeho komentáře

---

## Indexy

Pro optimalizaci výkonu jsou automaticky vytvořeny indexy na:
- Všechny primární klíče (id)
- Email v tabulce USERS (kvůli UNIQUE)
- Cizí klíče (user_id, project_id, task_id)

## Ukázková data

Při prvním spuštění se automaticky vytvoří:

**Uživatelé:**
1. Jan Novák (jan.novak@example.com)
2. Eva Svobodová (eva.svobodova@example.com)

**Projekty:**
1. Webová aplikace (vlastník: Jan Novák)
2. Marketing kampaň (vlastník: Jan Novák)

**Úkoly:**
1. Navrhnout databázi (projekt: Webová aplikace, stav: completed)
2. Implementovat backend (projekt: Webová aplikace, stav: in_progress)
3. Vytvořit frontend (projekt: Webová aplikace, stav: todo)
4. Napsat obsah (projekt: Marketing kampaň, stav: todo)

## SQL dotazy pro vytvoření

Kompletní SQL schéma najdete v souboru `backend/database.js`.

## Rozšíření databáze

Možná rozšíření pro budoucnost:

1. **Tags (Štítky)**
   - Tabulka pro štítky úkolů
   - Many-to-Many vztah s TASKS

2. **Attachments (Přílohy)**
   - Tabulka pro soubory připojené k úkolům
   - Vztah N:1 s TASKS

3. **Activity Log (Historie změn)**
   - Tabulka pro sledování změn
   - Auditní trail všech operací

4. **Notifications (Notifikace)**
   - Tabulka pro notifikace uživatelů
   - Vztah N:1 s USERS

5. **Teams (Týmy)**
   - Tabulka pro týmy
   - Many-to-Many vztah s USERS
   - Vztah 1:N s PROJECTS
