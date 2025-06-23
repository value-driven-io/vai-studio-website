// ===================================================================
// SUPABASE API CLIENT
// Replaces Airtable with PostgreSQL + real-time capabilities
// ===================================================================

// Supabase Configuration
const SUPABASE_URL = window.APP_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.APP_CONFIG.SUPABASE_ANON_KEY;

// Simple Supabase client (no external library needed for basic operations)
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        };
    }

    // Generic query method
    async query(table, options = {}) {
        let url = `${this.url}/rest/v1/${table}`;
        const params = new URLSearchParams();

        // Add select columns
        if (options.select) {
            params.append('select', options.select);
        }

        // Add filters - IMPROVED to handle multiple conditions on same field
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
                // Handle multiple conditions on same field (like date ranges)
                if (key.includes('.')) {
                    // Remove the suffix (.1, .2, etc.) for the actual parameter name
                    const actualKey = key.split('.')[0];
                    params.append(actualKey, value);
                } else {
                    params.append(key, value);
                }
            });
        }

        // Add ordering
        if (options.order) {
            params.append('order', options.order);
        }

        // Add limit
        if (options.limit) {
            params.append('limit', options.limit);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        console.log('Supabase query URL:', url); // Debug log

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase query failed: ${error}`);
        }

        return response.json();
    }

    // Insert data
    async insert(table, data) {
        const response = await fetch(`${this.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                ...this.headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase insert failed: ${error}`);
        }

        return response.json();
    }

    // Update data
    async update(table, filters, data) {
        let url = `${this.url}/rest/v1/${table}`;
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            params.append(key, `eq.${value}`);
        });

        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                ...this.headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase update failed: ${error}`);
        }

        return response.json();
    }
}

// Initialize Supabase client
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================================================================
// API FUNCTIONS (Updated for Supabase)
// ===================================================================

const API = {
    // Fetch available tours with operator information
    async fetchTours(filters = {}) {
        try {
            console.log('Fetching tours with filters:', filters);

            // Build the query using our optimized view
            let queryFilters = {};
            let orderBy = 'tour_date,time_slot';

            // FIXED: Date filtering with proper timezone handling for French Polynesia
            const getPolynesianaDate = (offsetDays = 0) => {
                const now = new Date();
                // Get current time in French Polynesia (UTC-10)
                const polynesianTime = new Date(now.getTime() - (10 * 60 * 60 * 1000));
                polynesianTime.setDate(polynesianTime.getDate() + offsetDays);
                const year = polynesianTime.getFullYear();
                const month = String(polynesianTime.getMonth() + 1).padStart(2, '0');
                const day = String(polynesianTime.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            if (filters.date === 'today') {
                const todayInPolynesia = getPolynesianaDate(0);
                console.log('Today in Polynesia:', todayInPolynesia);
                queryFilters['tour_date'] = `eq.${todayInPolynesia}`;
            } else if (filters.date === 'tomorrow') {
                const tomorrowInPolynesia = getPolynesianaDate(1);
                console.log('Tomorrow in Polynesia:', tomorrowInPolynesia);
                queryFilters['tour_date'] = `eq.${tomorrowInPolynesia}`;
            } else if (filters.date === 'week') {
                const todayInPolynesia = getPolynesianaDate(0);
                const weekFromNowInPolynesia = getPolynesianaDate(7);
                console.log('Week range in Polynesia:', todayInPolynesia, 'to', weekFromNowInPolynesia);
                
                // FIXED: Correct syntax for range queries in Supabase
                // We need to add multiple filters to the filters object
                queryFilters['tour_date'] = `gte.${todayInPolynesia}`;
                queryFilters['tour_date.1'] = `lte.${weekFromNowInPolynesia}`; // Use different key for second condition
            }

            

            // Tour type filtering
            if (filters.tourType) {
                queryFilters['tour_type'] = `eq.${filters.tourType}`;
            }

            // Island filtering (through operator)
            if (filters.island) {
                queryFilters['operator_island'] = `eq.${filters.island}`;
            }

            // Use our optimized view that joins tours + operators
            const tours = await supabase.query('active_tours_with_operators', {
                filters: queryFilters,
                order: orderBy
            });

            console.log(`Found ${tours.length} tours`);

            // Transform data to match your frontend expectations
            return tours.map(tour => ({
                id: tour.id,
                fields: {
                    // Basic tour info
                    tour_name: tour.tour_name,
                    tour_type: tour.tour_type,
                    description: tour.description,
                    
                    // Scheduling
                    date: tour.tour_date,
                    time_slot: tour.time_slot,
                    
                    // Pricing
                    original_price_adult: tour.original_price_adult,
                    discount_price_adult: tour.discount_price_adult,
                    discount_price_child: tour.discount_price_child,
                    
                    // Availability
                    available_spots: tour.available_spots,
                    max_capacity: tour.max_capacity,
                    
                    // Location
                    meeting_point: tour.meeting_point,
                    
                    // Features
                    languages: tour.languages || ['French'],
                    whale_regulation_compliant: tour.whale_regulation_compliant,
                    equipment_included: tour.equipment_included,
                    food_included: tour.food_included,
                    drinks_included: tour.drinks_included,
                    
                    // Requirements
                    requirements: tour.requirements,
                    fitness_level: tour.fitness_level
                },
                operator: {
                    fields: {
                        company_name: tour.company_name,
                        island: tour.operator_island,
                        whatsapp_number: tour.whatsapp_number,
                        average_rating: tour.operator_rating
                    }
                }
            }));

        } catch (error) {
            console.error('Error fetching tours:', error);
            throw error;
        }
    },

    // Create a new booking
    async createBooking(bookingData) {
        try {
            console.log('Creating booking:', bookingData);

            // Generate unique booking reference
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const bookingReference = `VAI-${dateStr}-${randomNum}`;

            // Calculate pricing
            const tour = await supabase.query('tours', {
                filters: { 'id': `eq.${bookingData.tour_id}` }
            });

            if (!tour || tour.length === 0) {
                throw new Error('Tour not found');
            }

            const tourData = tour[0];
            const adultPrice = tourData.discount_price_adult;
            const childPrice = tourData.discount_price_child || (adultPrice * 0.5);
            
            const subtotal = (bookingData.num_adults * adultPrice) + 
                           (bookingData.num_children * childPrice);
            const commissionAmount = Math.round(subtotal * window.APP_CONFIG.COMMISSION_RATE);

            // Prepare booking data for database
            const dbBookingData = {
                tour_id: bookingData.tour_id,
                operator_id: tourData.operator_id,
                
                // Customer info
                customer_name: bookingData.customer_name,
                customer_email: bookingData.customer_email,
                customer_phone: bookingData.customer_phone,
                customer_whatsapp: bookingData.customer_whatsapp,
                
                // Booking details
                num_adults: bookingData.num_adults,
                num_children: bookingData.num_children,
                
                // Pricing
                adult_price: adultPrice,
                child_price: childPrice,
                subtotal: subtotal,
                commission_amount: commissionAmount,
                
                // Status
                booking_status: 'pending',
                payment_status: 'pending',
                booking_reference: bookingReference,
                
                // Set confirmation deadline (60 minutes from now)
                confirmation_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString()
            };

            // Create the booking
            const booking = await supabase.insert('bookings', dbBookingData);

            if (!booking || booking.length === 0) {
                throw new Error('Failed to create booking');
            }

            console.log('Booking created:', booking[0]);

            // Update tour available spots
            await this.updateTourSpots(bookingData.tour_id, bookingData.num_adults + bookingData.num_children);

            // Trigger n8n webhook for notifications
            await this.triggerBookingNotification(booking[0].id);

            return booking[0];

        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    // Update tour available spots
    async updateTourSpots(tourId, spotsBooked) {
        try {
            // Get current tour data
            const tours = await supabase.query('tours', {
                filters: { 'id': `eq.${tourId}` }
            });

            if (!tours || tours.length === 0) {
                throw new Error('Tour not found for spot update');
            }

            const tour = tours[0];
            const newAvailableSpots = tour.available_spots - spotsBooked;
            const newStatus = newAvailableSpots <= 0 ? 'sold_out' : 'active';

            // Update the tour
            await supabase.update('tours', 
                { 'id': tourId }, 
                { 
                    available_spots: newAvailableSpots,
                    status: newStatus
                }
            );

            console.log(`Updated tour ${tourId}: ${newAvailableSpots} spots remaining`);

        } catch (error) {
            console.error('Error updating tour spots:', error);
            throw error;
        }
    },

    // Trigger n8n webhook for notifications
    async triggerBookingNotification(bookingId) {
        try {
            const response = await fetch(window.APP_CONFIG.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    booking_id: bookingId,
                    platform: 'vai-tickets',
                    source: 'supabase'
                })
            });

            if (!response.ok) {
                console.warn('n8n webhook failed, but booking was created successfully');
                console.warn('Webhook status:', response.status, response.statusText);
            } else {
                console.log('n8n webhook triggered successfully');
            }

        } catch (error) {
            // IMPROVED: Don't let webhook errors break the booking flow
            console.warn('n8n webhook error (booking still created successfully):', error.message);
            // Webhook failure is not critical - booking was already saved
        }
    }
};

// ===================================================================
// CONNECTION TEST FUNCTION
// ===================================================================
async function testSupabaseConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', SUPABASE_URL);
    console.log('Key:', SUPABASE_ANON_KEY ? 'Found' : 'Missing');

    try {
        // Test basic connection
        const response = await fetch(`${SUPABASE_URL}/rest/v1/tours?limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Supabase connection successful!');
            console.log(`Found ${data.length} tour(s) in test query`);
            
            // Test the optimized view
            const viewTest = await supabase.query('active_tours_with_operators', { limit: 3 });
            console.log(`✅ View test: Found ${viewTest.length} active tours`);
            
        } else {
            console.error('❌ Supabase connection failed:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }
    } catch (error) {
        console.error('❌ Connection test error:', error);
    }
}

// Auto-test connection when this file loads
testSupabaseConnection();