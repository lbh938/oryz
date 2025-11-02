-- =====================================================
-- AJOUT : Colonne timezone pour scheduled_notifications
-- =====================================================

-- Ajouter la colonne timezone si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scheduled_notifications' 
    AND column_name = 'timezone'
  ) THEN
    ALTER TABLE scheduled_notifications 
    ADD COLUMN timezone TEXT DEFAULT 'Europe/Paris';
  END IF;
END $$;

COMMENT ON COLUMN scheduled_notifications.timezone IS 'Fuseau horaire de l''utilisateur pour la planification';

