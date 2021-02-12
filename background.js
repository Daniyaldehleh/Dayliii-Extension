let tabId;

chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    console.log(tabs[0].id) //? does 0 represent current tab? what's point of this?
})
// fetch('http://127.0.0.1:5000/current', {
//     method: 'POST',
//     body: JSON.stringify({
//         email: '@gmail.com', //sample data
//         id: '2' //sample data
//     }),
//     headers: {
//         'Content-Type': 'application/json;charset=UTF-8',
//         Accept: 'application/json'
//     }
// })

//stores value upon change
chrome.storage.onChanged.addListener(function(changes, storageName) {
    let timestamp = changes.time.newValue; //? what's "changes.time.newValue" is it current time?
    var sec_num = parseInt(timestamp, 10); // don't forget the second param //parseInt is same as int()
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; } //for display purposes
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    let formattedTime = hours + ':' + minutes;
    chrome.browserAction.setBadgeText({ "text": formattedTime })
}) //? is this function solely for be for the badge (icon timer) display and functionality

let countup2; //for start
let countup3; //for extend
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.cmd == "start") { //? what is request.cmd or what does it do? or come from
            countup2 = setInterval(() => {
                getDB('time', function(opt) { //? what's opt? is it key of time?
                    var timeup = opt.time

                    if (timeup == startTime) {
                        playsound()
                        chrome.tabs.sendMessage(tabId, { cmd: "popup" }) //? what is cmd?
                        console.log('popup to tab ', tabId)
                        clearInterval(countup2)
                    } else {
                        setDB('time', opt.time + 1) //? why adding + 1?
                    }

                })
            }, 1000); //? will it reset after 1000 seconds even if user doesn't do it? what's 1000?
        }

        if (request.cmd == "extend") {
            countup3 = setInterval(() => {
                getDB('time', function(opt) {
                    setDB('time', opt.time + 1)
                })
            }, 1000);
            console.log(request.cmd)
        }


        if (request.cmd == "stop") {
            clearInterval(countup2) //resets time
            clearInterval(countup3) //resets extension time
            setDB('time', 0)
            setDB('extended', false)
        }

    }
);

function setDB(key, value) {
    chrome.storage.sync.set({
        [key]: value
    });

}

function getDB(key, cb) { //what's cb? 
    chrome.storage.sync.get(key, (opt) => {
        cb(opt) 
    });

}

function playsound() {
    console.log('play sound')
    var audio = new Audio('https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-61905/zapsplat_bells_small_hand_bell_ring_in_water_weird_cartoon_tone_001_61906.mp3');
    audio.play();
}

chrome.tabs.onActiveChanged.addListener((newid) => {
    console.log('change tab to ', newid)
    tabId = newid;
})