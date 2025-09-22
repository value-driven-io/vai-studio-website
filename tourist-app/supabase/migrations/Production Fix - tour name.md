CREATE OR REPLACE FUNCTION create_booking_notification()
  RETURNS TRIGGER AS $$
  DECLARE
      tour_name_var TEXT;  -- Renamed from 'tour_name' to avoid column conflict
  BEGIN
      -- Only create notification for new bookings, not updates
      IF TG_OP = 'INSERT' THEN
          -- Get tour name with explicit table alias to avoid ambiguity
          SELECT t.tour_name INTO tour_name_var
          FROM tours t WHERE t.id = NEW.tour_id;

          INSERT INTO public.notifications (
              operator_id,
              recipient_type,
              type,
              category,
              title,
              message,
              title_i18n,
              message_i18n,
              action_type,
              action_data,
              source,
              data
          ) VALUES (
              NEW.operator_id,
              'operator',
              'booking',
              'transactional',
              'New Booking Request',
              'New booking for ' || COALESCE(tour_name_var, 'your activity'),
              -- Multilingual titles
              jsonb_build_object(
                  'en', 'New Booking Request',
                  'fr', 'Nouvelle Demande de Réservation'
              ),
              -- Multilingual messages  
              jsonb_build_object(
                  'en', 'New booking for ' || COALESCE(tour_name_var, 'your 
  activity'),
                  'fr', 'Nouvelle réservation pour ' || COALESCE(tour_name_var,
  'votre activité')
              ),
              'navigate',
              jsonb_build_object('tab', 'bookings', 'bookingId', NEW.id),
              'trigger',
              jsonb_build_object(
                  'bookingId', NEW.id,
                  'tourId', NEW.tour_id,
                  'bookingReference', NEW.booking_reference,
                  'customerName', NEW.customer_name,
                  'activityName', COALESCE(tour_name_var, 'Unknown Activity')
              )
          );

          RAISE LOG 'Created multilingual booking notification for operator % 
  booking %', NEW.operator_id, NEW.id;
      END IF;

      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;