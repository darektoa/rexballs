window.addEventListener('load', ()=>{
    if('Notification' in window)
        Notification.requestPermission()
        .then(result =>{
            if(result === 'denied')
                console.log('Notification Has Been Blocked !');
            else if(result === 'default')
                console.log('Notification Permission Has Been Closed !');
            else{
                navigator.serviceWorker.ready
                .then(reg=> subscribe())
            }
        })
    else
        console.log('Your Browser Not Support Notification !');
})

const urlBase64ToUint8Array = (base64String)=>{
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const subscribe = ()=>{
    navigator.serviceWorker.getRegistration()
    .then(reg =>{
        reg.pushManager.subscribe({
            userVisibleOnly     : true,
            applicationServerKey: urlBase64ToUint8Array('BNLhJiri3FKB6EI10AvVTYg5aOQjlh5aE7uKIVAr_V5v7zXxOIvE4IarMs_IXPtCFGWVdiWoAN7ljP4jWWkV0f0')
        })
        .then(subscribe =>{
            console.log('Berhasil melakukan subscribe dengan endpoint: ', subscribe.endpoint);
            console.log('Berhasil melakukan subscribe dengan p256dh key: ', btoa(String.fromCharCode.apply(
                null, new Uint8Array(subscribe.getKey('p256dh')))));
            console.log('Berhasil melakukan subscribe dengan auth key: ', btoa(String.fromCharCode.apply(
                null, new Uint8Array(subscribe.getKey('auth')))));
        })
        .catch(e =>{
            console.error('Tidak dapat melakukan subscribe ', e.message);
        });
    })
}