const BASE_URL  = 'https://api.football-data.org/v2';
const API_KEY   = 'a688a819eebf480c989cc98fc7b7ea91';

// FUNGSI MEMEPERCEPAT QUERY DOM
const $ = (selector, opsi='') =>{
    if(opsi.match(/all/i))
        return document.querySelectorAll(selector);
    else
        return document.querySelector(selector);
}

// FUNGSI RENDER PREMIER LEAGUE
const premierLeague = async ()=>{
    const tBody  = $('tbody');

    try{
        const response = await fetch(`${BASE_URL}/competitions/2021/standings`, {
            headers : {
                'X-Auth-Token' : API_KEY
            }
        });

        const resJson  = await response.json();
        const listClub = await resJson.standings[0].table;
    
        for(const item of await listClub){
            const name = item.team.name.replace(/(AFC|FC)/, '');
            const icon = item.team.crestUrl.replace('http://', 'https://');
    
            tBody.innerHTML += `
            <tr>
                <th class="name-club">
                    ${item.position}.
                    <img alt="icon" src="${icon}"> 
                    ${name}
                </th>
                <td>${item.points}</td>
                <td>${item.playedGames}</td>
                <td>${item.won}</td>
                <td>${item.draw}</td>
                <td>${item.lost}</td>
                <td>${item.goalsFor}</td>
                <td>${item.goalsAgainst}</td>
                <td>${item.goalDifference}</td>
            </tr>`;
        }
        
        setTimeout(()=> $('.progress').remove(), 500);
        
    }catch(err){
        setTimeout(()=>{
            $('.progress').remove();
            toastError('Gagal mengambil data dari server.<br>Periksa kembali internet anda');
        }, 500);
    }
}

// FUNGSI RENDER CHAMPIONS LEAGUE
const championsLeague = async ()=>{
    const container = $('#container-content');

    try{
        const response   = await fetch(`${BASE_URL}/competitions/2001/standings`, {
            headers : {
                'X-Auth-Token' : API_KEY
            }
        });

        const resJson  = await response.json();
        const listClub = resJson.standings;

        for(const data of listClub){
            if(!data.type.match(/TOTAL/i)) continue;

            const group = data.group.replace(/GROUP_/i, 'Group ')

            container.innerHTML += `
                <div class="content" id="${group.slice(6)}">
                    <div class="header-content black white-text">
                        <h1>${group}</h1>
                    </div>
                
                    <table class="centered striped responsive-table">
                        <thead>
                            <tr>
                                <th>Klub</th>
                                <th>Poin</th>
                                <th>Pertandingan</th>
                                <th>Menang</th>
                                <th>Seri</th>
                                <th>Kalah</th>
                                <th>Total Gol</th>
                                <th>Kebobolan</th>
                                <th>Selisih Gol</th>
                            </tr>
                        </thead>
                
                        <tbody></tbody>
                    </table>
                </div>`;

            const tBody = $(`#${group.slice(6)} tbody`);

            for(const item of data.table){
                const icon = item.team.crestUrl.replace('http://', 'https://');
                const name = item.team.name.replace(/(AFC|FC)/i, '');

                tBody.innerHTML += `
                <tr">
                    <th class="name-club">
                        ${item.position}.
                        &nbsp
                        <span>${name}</span>
                    </th>
                    <td>${item.points}</td>
                    <td>${item.playedGames}</td>
                    <td>${item.won}</td>
                    <td>${item.draw}</td>
                    <td>${item.lost}</td>
                    <td>${item.goalsFor}</td>
                    <td>${item.goalsAgainst}</td>
                    <td>${item.goalDifference}</td>
                </tr>`;
            }
        }
        
        setTimeout(()=> $('.progress').remove(), 500);
        
    }catch(err){
        setTimeout(()=>{
            $('.progress').remove();
            toastError('Gagal mengambil data dari server.<br>Periksa kembali internet anda');
        }, 500);
    }   
}

// FUNCTION DIJALANKAN KETIKA PAGE ABOUT DIMUAT
const about = ()=>{
    const elmntVersion = $('#version')
    
    // Menampilkan Versi Cache Berdasarkan Nama Cache
    caches.keys()
    .then(version =>{
        elmntVersion.innerText = `Versi ${version[0].slice(1)}`;
    })

    // fetch('/src/fonts/MAGNETOB.ttf');
}

// FUNCTION DIJALANKAN KETIKA PAGE FAVORITE DIMUAT
const favorite = ()=>{
    const loader = $('.progress', 'all');
    const submit = $('#button-submit');
    const select = $('select', 'all');
    M.FormSelect.init(select);
    
    if(indexedDBOK()){
        let db;
        const reqDB = indexedDB.open('favorite', 1);

        reqDB.onupgradeneeded = ()=>{
            db = reqDB.result;

            if(!db.objectStoreNames.contains('player'))
                db.createObjectStore('player', {keyPath: 'id'});
                
            if(!db.objectStoreNames.contains('team'))
                db.createObjectStore('team', {keyPath: 'id'});
            }
            
        reqDB.onsuccess = ()=>{
            db = reqDB.result;

            submit.addEventListener('click', ()=> addFavorite(db));
            lastId(db);
            getAllPlayer(db);
            getAllTeam(db);
            
            setTimeout(()=>{
                for(const item of loader){
                    item.remove();
                }
            }, 1000);
        }
    }else{
        const msgErr = 'Browser anda tidak mendukung fitur ini. Gunakan google chrome terbaru agar dapat menggunakan fitur ini';

        submit.addEventListener('click', ()=> toastError(msgErr));
        toastError(msgErr);
    }
}

// Function Menambahkan Favorite Ke IndexedDB
let id;
const addFavorite = db =>{
    
    const type   = $('#input-type').value.trim();
    const name   = $('#input-name').value.trim();
    const note   = $('#input-note').value.trim();

    const tx        = db.transaction(['player', 'team'], 'readwrite');
    const playerOS  = tx.objectStore('player');
    const teamOS    = tx.objectStore('team');
    let addData, data;

    // Validasi Input
    if(type && name && note){
        if(name.length <= 20 && note.length <= 20){
            data = {
                name        : name,
                note        : note,
                createdDate : getDate(),
                createdTime : getTimes()
            }
        }else{
            toastError('Maksimal input 20 karakter');
            return;
        }
    }else{
        toastError('Semua input harus diisi');
        return;
    }

    // Memeriksa Type
    if(type === 'player'){
        data.id = id.player;
        addData = playerOS.add(data);
    }

    if(type === 'team'){
        data.id = id.team;
        addData = teamOS.add(data);
    }

    addData.onsuccess = ()=>{
        toastSuccess('Berhasil Ditambahkan');
        lastId(db);
        getAllPlayer(db);
        getAllTeam(db);
    }

    addData.onerror   = ()=> toastError('Terjadi Kesalahan Saat Menambahkan');

}

// Function Mengambil Semua Data Favorit Player
const getAllPlayer  = (db)=>{
    const tBody     = $('#player tbody');
    tBody.innerHTML = '';
    
    const tx        = db.transaction(['player'], 'readonly');
    const playerOS  = tx.objectStore('player');
    const getAll    = playerOS.getAll();

    getAll.onsuccess = ()=>{
        const result = getAll.result;

        if(result.length > 0){
            for(const item of result){
                tBody.innerHTML += `
                    <td>${item.name}</td>
                    <td>${item.note}</td>
                    <td>${item.createdDate}</td>
                    <td>${item.createdTime}</td>
                    <td>
                        <button class="btn red darken-4 remove" id="player-${item.id}">Hapus</button>
                    </td>`;
            }
            addEventButtonRemove(db);
        }
    }

    getAll.onerror = ()=> toastSuccess('Gagal menampilkan pemain favorit');
}

// Function Mengambil Semua Data Favorit Team
const getAllTeam = (db)=>{
    const tBody        = $('#team tbody');
    tBody.innerHTML    = '';

    const tx     = db.transaction(['team'], 'readonly');
    const teamOS = tx.objectStore('team');
    const getAll = teamOS.getAll();

    getAll.onsuccess = ()=>{
        let i = 0;
        const result = getAll.result;
        
        if(result.length > 0){
            for(const item of result){
                tBody.innerHTML += `
                    <td>${item.name}</td>
                    <td>${item.note}</td>
                    <td>${item.createdDate}</td>
                    <td>${item.createdTime}</td>
                    <td>
                        <button class="btn red darken-4 remove" id="team-${item.id}">Hapus</button>
                    </td>
                `;
            }
            addEventButtonRemove(db);
        }
    }

    getAll.onerror = ()=> toastSuccess('Gagal menampilkan team favorit');
    
}

//Function Menambahkan Event Ke Button Remove
const addEventButtonRemove = (db)=>{
    const buttonRemove = $('button.remove', 'all');

    for(const item of buttonRemove){
        item.addEventListener('click', ()=> remove(db, event.target));
    }
}

//Function Delete Data Favorit
const remove = (db, elmnt)=>{
    const idElmnt   = elmnt.id;
    const indexId   = idElmnt.indexOf('-')+1;
    const idItem    = parseInt(idElmnt.slice(indexId));
    
    let result;
    const tx        = db.transaction(['player', 'team'], 'readwrite');
    const playerOS  = tx.objectStore('player');
    const teamOS    = tx.objectStore('team');

    if(idElmnt.includes('player'))
        result = playerOS.delete(idItem);

    if(idElmnt.includes('team'))
        result = teamOS.delete(idItem);

    result.onsuccess = ()=>{
        toastSuccess('Item berhasil dihapus');
        getAllPlayer(db);
        getAllTeam(db);
    }

    result.onerror = ()=> toastError('Item gagal dihapus');
    
}

// Function Memeriksa Id Terakhir;
const lastId = db =>{
    let resultPlayer, resultTeam, playerLen, teamLen, lastIdPlayer, lastIdTeam;
    const tx            = db.transaction(['player', 'team'], 'readonly');
    const getAllPlayer  = tx.objectStore('player').getAll();
    const getAllTeam    = tx.objectStore('team').getAll();

    getAllPlayer.onsuccess = ()=>{
        resultPlayer = getAllPlayer.result;
        playerLen  = resultPlayer.length;

        if(playerLen === 0) lastIdPlayer = 0;
        if(playerLen > 0)   lastIdPlayer = resultPlayer[playerLen-1].id + 1;

        id = {player: lastIdPlayer, team: lastIdTeam};
    }

    getAllTeam.onsuccess = ()=>{
        resultTeam    = getAllTeam.result;
        teamLen       = resultTeam.length;

        if(teamLen === 0) lastIdTeam = 0;
        if(teamLen > 0)   lastIdTeam = resultTeam[teamLen-1].id + 1;

        id = {player: lastIdPlayer, team: lastIdTeam};
    }
}

// Funcion Pemberitahuan Ketika Sukses
const toastSuccess = (msg='Berhasil')=>{
    M.Toast.dismissAll();
    M.toast({
        html          : msg,
        classes       : 'toast-success',
        displayLength : 3000
    })
}

// Function Pemberitahuan Ketika Terjadi Error
const toastError = (msg='Error')=>{
    M.Toast.dismissAll();
    M.toast({
        html          : msg,
        classes       : 'toast-error',
        displayLength : 5000,
        outDuration   : 100
    })
}

// Function Memeriksa Ketersedian IndexedDB
const indexedDBOK = ()=>{
    if('indexedDB' in window)
        return true;
    else
        return false
}

// Function Untuk Mengembalikan Tanggal Sekarang
const getDate = ()=>{
    const d     = new Date;
    const date  = setZero(d.getDate());
    const month = setZero(d.getMonth()+1);
    const year  = d.getFullYear();

    return `${date}/${month}/${year}`;
}

// Function Untuk Mengembalikan Waktu Sekarang
const getTimes = ()=>{
    const d       = new Date;
    const dStr    = d.toString();
    const hour    = setZero(d.getHours()); 
    const minute  = setZero(d.getMinutes());
    const iTZ     = dStr.indexOf('GMT')+3;
    const TZ      = `${dStr.slice(iTZ, iTZ+3)}:${dStr.slice(iTZ+3, iTZ+5)}`;

    return `${hour}:${minute} (${TZ})`;
}

// Function Untuk Menambahkan Nol Jika Angka Tanggal Hanya 1 
const setZero = (val)=>{
    if(val.toString().length === 1)
        return `0${val}`;
    return val;
}