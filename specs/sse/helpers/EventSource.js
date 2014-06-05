function getEventSource() {
    return !!window['EventSource'] && new EventSource("./resources/simple.txt");
}
