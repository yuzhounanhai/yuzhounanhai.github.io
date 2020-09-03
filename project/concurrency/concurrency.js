function concurrencyRequest(urls, limit, eachHandle) {
    if (urls && urls.length) {
        var copyUrls = [].concat(urls);
        var asyncExecutor = [];
        function executor() {
            return eachHandle(copyUrls.shift()).then(() => {
                if (copyUrls.length > 0) {
                    // 执行完毕一项，如若还有任务，去继续读取执行
                    return executor();
                } else {
                    // 若无任务，该条“线程”结束。
                    return "done";
                }
            })
        }
        // 生成多条异步执行"线程"
        for (let i = 0; i < limit; i++) {
            asyncExecutor.push(executor());
        }
        return Promise.all(asyncExecutor);
    } else {
        return Promise.reject("no urls target or urls is not array");
    }
}