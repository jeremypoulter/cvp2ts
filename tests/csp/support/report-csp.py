import time
import json
def main(request, response):
    op = request.GET.first("op");
    id = request.GET.first("id")
    timeout = float(request.GET.first("timeout", "0"))
    response.headers.set("Content-Type", "application/json")
    if op == "put":
        request.server.stash.put(key=id, value=request.body.rstrip())
        body = json.dumps({'id': id})
    elif op == "take":
        value = request.server.stash.take(key=id)
        if value is None:
            time.sleep(timeout)
            value = request.server.stash.take(key=id)
            if value is None:
                value = json.dumps({'error': 'no report', 'id': id})
        body = value
    else:
        body = json.dumps({'error': 'unknown operation', 'id': id})
    return response.headers, body
