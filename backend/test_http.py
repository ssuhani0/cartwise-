import urllib.request
import urllib.error

url = "http://localhost:8000/api/v1/shops/nearby?sort=distance&category=kirana&lat=22.3039&lng=70.8022"
try:
    req = urllib.request.Request(url, headers={
        "Origin": "http://localhost:5173",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
    })
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Data:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error Data:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
