# 📡 Příklady API volání

## Uživatelé

### Získat všechny uživatele
```bash
curl http://localhost:3001/api/users
```

### Získat jednoho uživatele
```bash
curl http://localhost:3001/api/users/1
```

### Vytvořit uživatele
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Petr Novotný",
    "email": "petr.novotny@example.com"
  }'
```

## Projekty

### Získat všechny projekty
```bash
curl http://localhost:3001/api/projects
```

### Získat jeden projekt
```bash
curl http://localhost:3001/api/projects/1
```

### Vytvořit projekt
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nový projekt",
    "description": "Popis nového projektu",
    "user_id": 1
  }'
```

### Aktualizovat projekt
```bash
curl -X PUT http://localhost:3001/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aktualizovaný název",
    "description": "Nový popis",
    "status": "active"
  }'
```

### Smazat projekt
```bash
curl -X DELETE http://localhost:3001/api/projects/1
```

## Úkoly

### Získat všechny úkoly
```bash
curl http://localhost:3001/api/tasks
```

### Filtrovat úkoly podle projektu
```bash
curl "http://localhost:3001/api/tasks?project_id=1"
```

### Filtrovat úkoly podle stavu
```bash
curl "http://localhost:3001/api/tasks?status=todo"
```

### Filtrovat úkoly podle priority
```bash
curl "http://localhost:3001/api/tasks?priority=high"
```

### Kombinace filtrů
```bash
curl "http://localhost:3001/api/tasks?project_id=1&status=in_progress"
```

### Získat jeden úkol
```bash
curl http://localhost:3001/api/tasks/1
```

### Vytvořit úkol
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nový úkol",
    "description": "Popis úkolu",
    "status": "todo",
    "priority": "high",
    "project_id": 1,
    "user_id": 1,
    "due_date": "2024-02-01"
  }'
```

### Aktualizovat úkol
```bash
curl -X PUT http://localhost:3001/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aktualizovaný úkol",
    "description": "Nový popis",
    "status": "completed",
    "priority": "medium",
    "due_date": "2024-02-15"
  }'
```

### Změnit stav úkolu
```bash
curl -X PUT http://localhost:3001/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Existující název",
    "description": "Existující popis",
    "status": "completed",
    "priority": "high",
    "due_date": "2024-02-01"
  }'
```

### Smazat úkol
```bash
curl -X DELETE http://localhost:3001/api/tasks/1
```

## Komentáře

### Získat komentáře k úkolu
```bash
curl http://localhost:3001/api/tasks/1/comments
```

### Přidat komentář
```bash
curl -X POST http://localhost:3001/api/tasks/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Toto je komentář k úkolu",
    "user_id": 1
  }'
```

## Statistiky

### Získat celkové statistiky
```bash
curl http://localhost:3001/api/stats
```

Vrátí:
```json
{
  "totalProjects": 2,
  "totalTasks": 4,
  "completedTasks": 1,
  "inProgressTasks": 1,
  "todoTasks": 2,
  "totalUsers": 2
}
```

## Možné hodnoty

### Status úkolu
- `todo` - K provedení
- `in_progress` - Probíhá
- `completed` - Dokončeno

### Priorita úkolu
- `low` - Nízká
- `medium` - Střední
- `high` - Vysoká

### Status projektu
- `active` - Aktivní
- `archived` - Archivovaný

## Testování v JavaScriptu

```javascript
// Získat projekty
const response = await fetch('/api/projects');
const projects = await response.json();

// Vytvořit úkol
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Nový úkol',
    description: 'Popis',
    status: 'todo',
    priority: 'high',
    project_id: 1,
    user_id: 1,
    due_date: '2024-02-01'
  })
});
const task = await response.json();

// Aktualizovat úkol
const response = await fetch('/api/tasks/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Aktualizovaný úkol',
    description: 'Nový popis',
    status: 'completed',
    priority: 'medium',
    due_date: '2024-02-15'
  })
});
const updatedTask = await response.json();

// Smazat úkol
await fetch('/api/tasks/1', {
  method: 'DELETE'
});
```
