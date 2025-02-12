const axios = require('axios');
const qs = require('qs');
const dotenv = require('dotenv');

dotenv.config();

const CLIENT_ID = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getAccessToken() {
    try {
        const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', qs.stringify({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error obtaining token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to obtain access token');
    }
}

async function getAirportCodeByCityOrAirport(name) {
    try {
        const accessToken = await getAccessToken();
        const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            params: {
                keyword: name,
                subType: 'AIRPORT,CITY',
            },
        });

        if (response.data && response.data.data && response.data.data.length > 0) {
            return response.data.data[0].iataCode;
        } else {
            throw new Error('No airport code found for the given name');
        }
    } catch (error) {
        console.error('Error fetching airport code:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch airport code');
    }
}

async function searchFlights(origin, destination, date) {
    try {
        const originCode = await getAirportCodeByCityOrAirport(origin);
        const destinationCode = await getAirportCodeByCityOrAirport(destination);
        const accessToken = await getAccessToken();

        const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            params: {
                originLocationCode: originCode,
                destinationLocationCode: destinationCode,
                departureDate: date,
                adults: 1,
            },
        });

        return response.data.data;
    } catch (error) {
        console.error('Error fetching flights:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch flight data');
    }
}

module.exports = {
    getAccessToken,
    getAirportCodeByCityOrAirport,
    searchFlights,
};