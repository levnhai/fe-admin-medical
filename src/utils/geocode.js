export const getCoordinates = async (address) => {
  const apiKey = 'AIzaSyAe2_SNrnoOmWCCTwHcKFWYdoVaAFJyMgI';
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
  );

  const data = await response.json();

  if (data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
    };
  } else {
    throw new Error('Không tìm thấy tọa độ cho địa chỉ này');
  }
};
