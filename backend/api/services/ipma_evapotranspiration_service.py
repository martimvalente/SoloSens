import requests
import csv
import io
import math
from django.core.cache import cache

# Approximate lat/lon of known districts (partial list, extend as needed)
DISTRICTS = {
    "lisboa": (38.7169, -9.1399),
    "porto": (41.1496, -8.6109),
    "faro": (37.0194, -7.9304),
    "coimbra": (40.2111, -8.4291),
    # add more if needed
}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def find_closest_district(lat, lon):
    closest = min(DISTRICTS.items(), key=lambda item: haversine(lat, lon, item[1][0], item[1][1]))
    return closest[0]  # returns district name

def fetch_evapotranspiration(lat, lon):
    district = find_closest_district(lat, lon)
    cache_key = f"evapo_{district}"
    cached = cache.get(cache_key)

    if cached:
        return cached

    url = f"https://api.ipma.pt/open-data/observation/climate/evapotranspiration/{district}.csv"

    try:
        response = requests.get(url)
        response.raise_for_status()

        data = []
        file = io.StringIO(response.content.decode("utf-8"))
        reader = csv.DictReader(file, delimiter=';')

        for row in reader:
            if "data" in row and "eto" in row:
                data.append({"date": row["data"], "eto": row["eto"]})

        if data:
            cache.set(cache_key, data, timeout=3600)  # Cache for 1 hour
            return data
        else:
            raise Exception("No evapotranspiration data found in CSV.")

    except Exception as e:
        raise Exception(f"IPMA fetch error: {str(e)}")
