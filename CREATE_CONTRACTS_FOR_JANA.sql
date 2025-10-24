-- Vytvoření zprostředkovatelských smluv pro Janu Novákovou
-- Pro všechny její nabídky, které ještě nemají smlouvu

-- Kontrola aktuálního stavu
SELECT 
  p.id,
  p.title,
  p.agent_id,
  CASE WHEN bc.id IS NOT NULL THEN 'MÁ SMLOUVU' ELSE 'NEMÁ SMLOUVU' END as status
FROM properties p
LEFT JOIN brokerage_contracts bc 
  ON bc.entity_type = 'property' 
  AND bc.entity_id = p.id 
  AND bc.user_id = p.agent_id
  AND bc.signed_at IS NOT NULL
WHERE p.agent_id = 2;

-- Vytvoření smluv pro nabídky bez smlouvy
INSERT INTO brokerage_contracts (
  user_id, 
  entity_type, 
  entity_id, 
  commission_rate, 
  code, 
  expires_at, 
  signed_at
)
SELECT 
  2 as user_id,
  'property' as entity_type,
  p.id as entity_id,
  3.0 as commission_rate,
  'AUTO' || p.id as code,
  NULL as expires_at,
  datetime('now') as signed_at
FROM properties p
WHERE p.agent_id = 2
  AND NOT EXISTS (
    SELECT 1 FROM brokerage_contracts bc
    WHERE bc.entity_type = 'property'
      AND bc.entity_id = p.id
      AND bc.user_id = 2
      AND bc.signed_at IS NOT NULL
  );

-- Ověření
SELECT 
  p.id,
  p.title,
  bc.signed_at,
  bc.commission_rate
FROM properties p
JOIN brokerage_contracts bc 
  ON bc.entity_type = 'property' 
  AND bc.entity_id = p.id 
  AND bc.user_id = p.agent_id
WHERE p.agent_id = 2
ORDER BY p.id;
