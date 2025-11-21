import requests
r = requests.get("https://httpbin.org/json")
print(r.history())

