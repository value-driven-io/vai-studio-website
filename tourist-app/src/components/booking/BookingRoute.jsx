/**
 * VAI Booking Route Component
 *
 * Handles the /booking route for both:
 * 1. Embed mode (loaded in iframe from operator websites)
 * 2. Direct access (normal booking flow)
 *
 * Features:
 * - Fetches tour data from URL parameters
 * - Sends postMessage events to parent iframe
 * - Handles booking completion
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BookingPage } from './BookingPage';
import { supabase } from '../../services/supabase';
import useEmbedMode from '../../hooks/useEmbedMode';

/**
 * Loading component
 */
const LoadingState = () => (
  <div className="min-h-screen bg-ui-surface-overlay flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-interactive-primary border-t-transparent"></div>
      <p className="mt-4 text-ui-text-secondary">Loading booking...</p>
    </div>
  </div>
);

/**
 * Error component
 */
const ErrorState = ({ message }) => (
  <div className="min-h-screen bg-ui-surface-overlay flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-ui-text-primary mb-2">Booking Not Available</h2>
      <p className="text-ui-text-secondary">{message}</p>
    </div>
  </div>
);

/**
 * Booking Route Component
 */
export default function BookingRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isEmbedMode, embedParams, sendError, sendBookingComplete } = useEmbedMode();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get tour ID from URL params (embed mode or direct access)
  const tourId = searchParams.get('tour_id') || embedParams.tourId;
  const operatorId = searchParams.get('operator_id') || embedParams.operatorId;

  // Fetch tour data
  useEffect(() => {
    async function fetchTour() {
      if (!tourId) {
        setError('Tour ID is required');
        setLoading(false);
        if (isEmbedMode) {
          sendError('Tour ID is required');
        }
        return;
      }

      try {
        // Try fetching from tours table first
        let { data: tourData, error: tourError } = await supabase
          .from('tours')
          .select(`
            *,
            operators (
              id,
              company_name,
              island,
              whatsapp_number,
              phone,
              contact_person
            )
          `)
          .eq('id', tourId)
          .eq('status', 'active')
          .single();

        // If not found, try active_tours_with_operators (template instances)
        if (!tourData || tourError) {
          const { data: instanceData, error: instanceError } = await supabase
            .from('active_tours_with_operators')
            .select(`
              *,
              operators (
                id,
                company_name,
                island,
                whatsapp_number,
                phone,
                contact_person
              )
            `)
            .eq('id', tourId)
            .single();

          if (instanceData && !instanceError) {
            // Transform instance data to match tour structure
            tourData = {
              ...instanceData,
              discount_price_adult: instanceData.effective_discount_price_adult,
              discount_price_child: instanceData.effective_discount_price_child,
              original_price_adult: instanceData.original_price_adult,
              status: 'active'
            };
          } else {
            throw instanceError || tourError;
          }
        }

        // Validate operator ID if provided (security check for embed mode)
        if (operatorId && tourData.operator_id !== operatorId) {
          throw new Error('Tour does not belong to specified operator');
        }

        setTour(tourData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tour:', err);
        const errorMessage = err.message || 'Failed to load tour. Please try again.';
        setError(errorMessage);
        setLoading(false);

        if (isEmbedMode) {
          sendError(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }
    }

    fetchTour();
  }, [tourId, operatorId, isEmbedMode]);

  // Handle booking success
  const handleBookingSuccess = (bookingResult) => {
    if (isEmbedMode) {
      // Send completion message to parent iframe
      sendBookingComplete(bookingResult.booking.id, {
        tourId: tour.id,
        tourTitle: tour.title,
        operatorId: tour.operator_id,
        totalAmount: bookingResult.booking.total_amount,
        currency: bookingResult.booking.currency,
        bookingDate: bookingResult.booking.booking_date,
        numAdults: bookingResult.booking.num_adults,
        numChildren: bookingResult.booking.num_children
      });

      // In embed mode, we don't navigate away - parent iframe handles it
      toast.success(t('booking.success', 'Booking confirmed!'));
    } else {
      // Normal mode - navigate to journey tab or success page
      toast.success(t('booking.success', 'Booking confirmed!'));
      navigate('/');
    }
  };

  // Handle booking close
  const handleClose = () => {
    if (isEmbedMode) {
      // In embed mode, parent iframe handles closing
      window.parent.postMessage(
        {
          type: 'vai:booking:close',
          source: 'vai-embed'
        },
        '*'
      );
    } else {
      // Normal mode - navigate back
      navigate(-1);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // No tour found
  if (!tour) {
    return <ErrorState message="Tour not found" />;
  }

  // Render booking page
  return (
    <div className={isEmbedMode ? 'vai-embed-mode' : ''}>
      <BookingPage
        tour={tour}
        mode={isEmbedMode ? 'modal' : 'page'}
        onClose={handleClose}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
