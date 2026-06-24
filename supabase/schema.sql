-- Execute no SQL Editor do Supabase (Dashboard → SQL → New query)

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf VARCHAR(11) NOT NULL,
  customer_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  barber_id VARCHAR(20) NOT NULL,
  barber_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Impede dois clientes no mesmo barbeiro/data/horário
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_barber_slot
  ON appointments (barber_id, appointment_date, appointment_time)
  WHERE status = 'confirmed';

-- Impede o mesmo CPF agendar o mesmo horário duas vezes
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_cpf_slot
  ON appointments (cpf, appointment_date, appointment_time)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_appointments_lookup
  ON appointments (appointment_date, barber_id, status);

CREATE INDEX IF NOT EXISTS idx_appointments_cpf_month
  ON appointments (cpf, appointment_date, status);
