// Airtable Configuration - Get from config.js
const AIRTABLE_PAT = window.APP_CONFIG.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = window.APP_CONFIG.AIRTABLE_BASE_ID;
const AIRTABLE_ENDPOINT = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Headers for Airtable requests
const headers = {
    'Authorization': `Bearer ${AIRTABLE_PAT}`,
    'Content-Type': 'application/json'
};

// API Functions
const API = {
    // Fetch available tours
    async fetchTours(filters = {}) {
        try {
            let filterFormula = `AND(status = 'Active', available_spots > 0)`;
            
            // Add date filter
            if (filters.date === 'today') {
                // filterFormula = `AND(${filterFormula}, date = TODAY())`;  //  OUT
            } else if (filters.date === 'tomorrow') {
                // filterFormula = `AND(${filterFormula}, date = DATEADD(TODAY(), 1, 'days'))`;  //  OUT
            }
            
            // Add tour type filter
            if (filters.tourType) {
                filterFormula = `AND(${filterFormula}, tour_type = '${filters.tourType}')`;
            }

            const params = new URLSearchParams({
                filterByFormula: filterFormula,
                // sort: JSON.stringify([{field: "date", direction: "asc"}, {field: "time_slot", direction: "asc"}]) //
            });

            const response = await fetch(`${AIRTABLE_ENDPOINT}/Tours?${params}`, { headers });
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Airtable error:', errorData);
                throw new Error('Failed to fetch tours');
            }
            
            const data = await response.json();
            
            // Fetch operator details for each tour
            const toursWithOperators = await Promise.all(
                data.records.map(async (tour) => {
                    if (tour.fields.operator_id && tour.fields.operator_id[0]) {
                        const operator = await this.fetchOperator(tour.fields.operator_id[0]);
                        return { ...tour, operator };
                    }
                    return tour;
                })
            );
            
            return toursWithOperators;
        } catch (error) {
            console.error('Error fetching tours:', error);
            throw error;
        }
    },

    // Fetch single operator
    async fetchOperator(operatorId) {
        try {
            const response = await fetch(`${AIRTABLE_ENDPOINT}/Operators/${operatorId}`, { headers });
            if (!response.ok) throw new Error('Failed to fetch operator');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching operator:', error);
            return null;
        }
    },

    // Create booking
    async createBooking(bookingData) {
        try {
            const response = await fetch(`${AIRTABLE_ENDPOINT}/Bookings`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    fields: bookingData
                })
            });

            if (!response.ok) throw new Error('Failed to create booking');
            
            const data = await response.json();
            
            // Update available spots
            await this.updateTourSpots(bookingData.tour_id[0], bookingData.num_adults + bookingData.num_children);
            
            // Trigger n8n webhook for notifications
            await this.triggerBookingNotification(data.id);
            
            return data;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    // Update tour available spots
    async updateTourSpots(tourId, spotsBooked) {
        try {
            // First get current spots
            const tourResponse = await fetch(`${AIRTABLE_ENDPOINT}/Tours/${tourId}`, { headers });
            const tour = await tourResponse.json();
            
            const newAvailableSpots = tour.fields.available_spots - spotsBooked;
            
            const response = await fetch(`${AIRTABLE_ENDPOINT}/Tours/${tourId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    fields: {
                        available_spots: newAvailableSpots,
                        status: newAvailableSpots <= 0 ? 'Sold Out' : 'Active'
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to update tour spots');
            
            return await response.json();
        } catch (error) {
            console.error('Error updating tour spots:', error);
            throw error;
        }
    },

    // Trigger n8n webhook
    async triggerBookingNotification(bookingId) {
        try {
            const response = await fetch(window.APP_CONFIG.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ booking_id: bookingId })
            });
            
            if (!response.ok) {
                console.error('Failed to trigger n8n webhook');
            }
        } catch (error) {
            console.error('Error triggering webhook:', error);
        }
    }
};

// Test function
async function testAirtableConnection() {
    console.log('Testing Airtable connection...');
    console.log('PAT:', AIRTABLE_PAT ? 'Found' : 'Missing');
    console.log('Base ID:', AIRTABLE_BASE_ID);
    
    try {
        const response = await fetch(`${AIRTABLE_ENDPOINT}/Tours?maxRecords=1`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Airtable connection successful!');
            const data = await response.json();
            console.log('Records found:', data.records.length);
        } else {
            console.error('❌ Airtable connection failed:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }
    } catch (error) {
        console.error('❌ Connection error:', error);
    }
}

// Uncomment to test
// testAirtableConnection();