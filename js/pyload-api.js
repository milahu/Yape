function doCallback(...args) {
    const callback = args.shift();
    if (callback) {
        try {
            callback(...args);
        }
        catch (e) {
            console.log(`error in callback function:\n${callback}`);
            throw e;
        }
    }
}

function getServerStatus(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${origin}/api/statusServer`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.hasOwnProperty('error')) {
                    doCallback(callback, false, response.error);
                } else {
                    doCallback(callback, true, null, response);
                }
            } catch {
                doCallback(callback, false, 'Server unreachable');
            }
        }
    }
    xhr.timeout = 5000;
    xhr.ontimeout = function() {
        doCallback(callback, false, 'Server unreachable');
    }
    xhr.send();
}

function login(username, password, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${origin}/api/login`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (JSON.parse(xhr.responseText) !== false) {
                doCallback(callback, true);
            } else {
                doCallback(callback, false, 'Login failed, invalid credentials');
            }
        }
    }
    xhr.timeout = 5000;
    xhr.ontimeout = function() {
        doCallback(callback, false, 'Login failed, server unreachable');
    }
    xhr.send(`username=${username}&password=${password}`);
}

function getStatusDownloads(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${origin}/api/statusDownloads`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const status = JSON.parse(xhr.responseText);
            doCallback(callback, status);
        }
    }
    xhr.send();
}

function assertArray(value) {
    if (!Array.isArray(value)) {
        throw Error(`expected array, got ${typeof(value)}: ${value}`);
    }
}

function getQueueData(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${origin}/api/getQueueData`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const queueData = JSON.parse(xhr.responseText);
            assertArray(queueData);
            const urls = [];
            queueData.forEach(pack => {
                pack.links.forEach(link => {
                    urls.push(link.url);
                });
            });
            doCallback(callback, urls);
        }
    }
    xhr.send();
}

function getLimitSpeedStatus(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${origin}/api/getConfigValue?category="download"&option="limit_speed"`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            let limitSpeed = JSON.parse(xhr.responseText);
            if (typeof(limitSpeed) == 'string') limitSpeed = limitSpeed.toLowerCase() === 'true';
            doCallback(callback, limitSpeed);
        }
    }
    xhr.send();
}

function setLimitSpeedStatus(limitSpeed, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${origin}/api/setConfigValue?category="download"&option="limit_speed"&value="${limitSpeed}"`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const success = JSON.parse(xhr.responseText);
            doCallback(callback, success);
        }
    }
    xhr.send();
}

function addPackage(name, url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${origin}/api/addPackage`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const response = JSON.parse(xhr.responseText);
            if (response.hasOwnProperty('error')) {
                doCallback(callback, false, response.error);
            } else {
                doCallback(callback, true);
            }
        }
    }
    const safeName = name.replace(/[^a-z0-9._\-]/gi, '_');
    xhr.send(`name="${encodeURIComponent(safeName)}"&links=["${encodeURIComponent(url)}"]`);
}

function checkURL(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${origin}/api/checkURLs`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const response = JSON.parse(xhr.responseText);
            doCallback(callback, !response.hasOwnProperty('BasePlugin') && !response.hasOwnProperty('error'));
        }
    }
    xhr.send(`urls=["${encodeURIComponent(url)}"]`);
}
