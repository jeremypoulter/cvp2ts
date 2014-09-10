"use strict";
function getBackgroundValues() {
    return [
        "red",
        "url(http://example.com/image.png)"
        "repeat",
        "scroll",
        "0% 0%",
        "red url(http://example.com/image.png)",
        "red repeat",
        "red scroll",
        "red 0% 0%",
        "red url(http://example.com/image.png) repeat",
        "red url(http://example.com/image.png) scroll",
        "red url(http://example.com/image.png) 0% 0%",
        "red url(http://example.com/image.png) repeat scroll",
        "red url(http://example.com/image.png) repeat 0% 0%",
        "red url(http://example.com/image.png) repeat scroll 0% 0%",
        "red url(http://example.com/image.png)",
        "repeat red",
        "scroll red",
        "0% 0% red",
        "repeat url(http://example.com/image.png) red",
        "scroll url(http://example.com/image.png) red",
        "0% 0% url(http://example.com/image.png) red",
        "scroll repeat url(http://example.com/image.png) red",
        "0% 0% repeat url(http://example.com/image.png) red",
        "0% 0% scroll repeat url(http://example.com/image.png) red"
    ];
}
