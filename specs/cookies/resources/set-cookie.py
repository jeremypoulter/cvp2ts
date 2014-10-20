def main(request, response):
    headers = [("Content-Type", "text/plain")]
    ident = request.GET.first('ident', 'test')
    if ident in request.cookies:
        body = request.cookies[ident].value
        response.delete_cookie(ident)
    else:
        response.set_cookie(ident, "COOKIE");
        body = "NO_COOKIE"
    return headers, body
