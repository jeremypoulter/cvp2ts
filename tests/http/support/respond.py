import json
def main(request, response):
    response.headers.set("Content-Type", "application/json")
    return json.dumps(request.headers)
