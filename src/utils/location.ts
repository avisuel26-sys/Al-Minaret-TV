
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
}

export const fetchCityName = async (lat: number, lng: number, lang: string = 'en'): Promise<string | undefined> => {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`);
    const data = await response.json();
    return data.city || data.locality || data.principalSubdivision;
  } catch (error) {
    console.error('Error fetching city:', error);
    return undefined;
  }
};

export const getIpLocation = async (): Promise<LocationData> => {
  const response = await fetch('https://ipapi.co/json/');
  if (!response.ok) throw new Error('IP location failed');
  
  const data = await response.json();
  if (data.latitude && data.longitude) {
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city
    };
  } else {
    throw new Error('Invalid IP location data');
  }
};
