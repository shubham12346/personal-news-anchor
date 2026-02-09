export async function getWeather(city: string) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city,
    )}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) {
        return {
            city,
            condition: "Unavailable",
            temperatureC: null,
        };
    }

    const geoData = (await geoResponse.json()) as {
        results?: Array<{
            name: string;
            latitude: number;
            longitude: number;
        }>;
    };
    const location = geoData.results?.[0];
    if (!location) {
        return {
            city,
            condition: "Unavailable",
            temperatureC: null,
        };
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
        return {
            city: location.name,
            condition: "Unavailable",
            temperatureC: null,
        };
    }

    const weatherData = (await weatherResponse.json()) as {
        current?: {
            temperature_2m?: number;
            weather_code?: number;
        };
    };

    const temperatureC =
        typeof weatherData.current?.temperature_2m === "number"
            ? Math.round(weatherData.current?.temperature_2m)
            : null;

    return {
        city: location.name,
        condition: mapWeatherCode(weatherData.current?.weather_code),
        temperatureC,
    };
}

function mapWeatherCode(code?: number) {
    if (code === undefined || code === null) return "Unavailable";
    if (code === 0) return "Clear";
    if (code === 1 || code === 2) return "Mostly clear";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Fog";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain showers";
    if (code >= 85 && code <= 86) return "Snow showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Unknown";
}