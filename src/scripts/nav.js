window.addEventListener("load", ()=>{
    // Activate sidebar nav
    const elems = $('.sidenav', 'all');
    M.Sidenav.init(elems);
    loadNav();
   
    function loadNav() {
        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status !== 200) return;
                // Muat daftar tautan menu
                $('.topnav, .sidenav', 'all').forEach( elm =>{
                    elm.innerHTML = xhttp.responseText;
                });
        
                // Daftarkan event listener untuk setiap tautan menu
                $('.sidenav a, .topnav a', 'all').forEach( elm =>{
                    elm.addEventListener('click', event =>{
                        // Tutup sidenav
                        const sidenav = document.querySelector('.sidenav');
                        M.Sidenav.getInstance(sidenav).close();
                        // Muat konten halaman yang dipanggil
                        page = event.target.getAttribute('href').substr(1);
                        loadPage(page);
                    });
                });
            }
        };

        xhttp.open('GET', '/src/html/nav.html', true);
        xhttp.send();
    }

    // Load page content
    let page = window.location.hash.substr(1);
    if (page === '') page = 'liga-champions';
    setTimeout(()=>loadPage(page), 500);
    
    function loadPage(page) {
        M.Toast.dismissAll();
        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if(this.readyState === 4){
                const content = $('#container-content');
                if(this.status === 200){
                    content.innerHTML = xhttp.responseText;
                    selectFunction(page);
                }else if(this.status === 404){
                    toastError('404 Not Found<br>Halaman tidak ditemukan')
                    content.innerHTML = '<p>Halaman tidak ditemukan.</p>';
                }else{
                    toastError('Ups...<br>Halaman tidak dapat diakses')
                    content.innerHTML = '<p>Ups.. halaman tidak dapat diakses.</p>';
                }
            }
        };

        xhttp.open('GET', '/src/html/' + page + '.html', true);
        xhttp.send();
    }

    function selectFunction(page){
        if(page === 'liga-champions')   return championsLeague();
        if(page === 'liga-inggris')     return premierLeague();
        if(page === 'favorit')          return favorite();
        if(page === 'about')            return about();

    }
});