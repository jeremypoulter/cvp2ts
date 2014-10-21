def main(request, response):
    response.headers.set("Content-Type", "text/plain")
    origin = request.headers.get("origin")
    if origin is not None:
        response.headers.set("Access-Control-Allow-Origin", origin)
        body = "true"
    else:
        body = "false"
    return body
