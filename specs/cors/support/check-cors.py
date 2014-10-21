def main(request, response):
    response.headers.set("Content-Type", "text/plain")
    origin = request.headers.get("origin")
    if origin is not None:
        allow = request.GET.first("allow")
        if allow == "1":
            response.headers.set("Access-Control-Allow-Origin", origin)
            body = "true"
        else:
            body = "false"
    else:
        body = "false"
    return body
