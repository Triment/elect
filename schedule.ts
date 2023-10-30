function loop(deadline: IdleDeadline) {
    while (1) {
        if (deadline.timeRemaining() < 1) {
            break;
        }
        console.warn(`线程占用`);
    }
    requestIdleCallback(loop);
}

requestIdleCallback(loop);