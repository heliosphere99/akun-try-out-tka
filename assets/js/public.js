// State untuk menyimpan data yang di-fetch dari JSON
const state = {
    sekolah: null,
    tryout: null,
    peserta: []
};

// Elemen DOM
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// Fungsi mengambil data JSON secara asinkron
async function loadData() {
    try {
        // Fetch ke-3 file JSON sekaligus
        const [resSekolah, resTryout, resPeserta] = await Promise.all([
            fetch('src/data_sekolah.json'),
            fetch('src/data_tryout.json'),
            fetch('src/data_peserta.json')
        ]);

        state.sekolah = await resSekolah.json();
        state.tryout = await resTryout.json();
        state.peserta = await resPeserta.json();

        // Render informasi ke UI
        renderInfo();
    } catch (error) {
        console.error("Gagal memuat data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Memuat Data',
            text: 'Terjadi kesalahan saat memuat data sistem. Pastikan file JSON tersedia.'
        });
    }
}

// Fungsi merender informasi Sekolah dan Try Out
// Fungsi merender informasi Sekolah dan Try Out
function renderInfo() {
    // Info Sekolah
    document.getElementById('nama-sekolah-display').innerHTML = `
        ${state.sekolah.nama_sekolah} 
        <br>
        <span class="text-sm text-slate-500 font-normal">
            NPSN: ${state.sekolah.npsn} &bull; ${state.sekolah.alamat_jalan}
        </span>
    `;

    // --- TAMBAHAN KODE FORMAT TANGGAL ---
    const dateObj = new Date(state.tryout.tanggal_tes);
    const formattedDate = dateObj.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    // ------------------------------------

    // Info Try Out
    document.getElementById('tgl-tes-display').textContent = formattedDate; // Gunakan variabel formattedDate
    document.getElementById('durasi-display').textContent = state.tryout.durasi_menit + ' menit';
    document.getElementById('buka-display').textContent = state.tryout.waktu_dibuka + ' WIB';
    document.getElementById('tutup-display').textContent = state.tryout.waktu_selesai + ' WIB';
}

// Event Listener Pencarian Nama (Minimal 3 Karakter)
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length >= 3) {
        // Filter nama yang mengandung huruf yang dicari
        const results = state.peserta.filter(p => p.nama.toLowerCase().includes(query));
        renderSearchResults(results);
    } else {
        // Kosongkan hasil jika kurang dari 3 karakter
        searchResults.innerHTML = ''; 
    }
});

// Fungsi merender daftar hasil pencarian
function renderSearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p class="text-slate-500 text-sm font-semibold">Nama tidak ditemukan.</p>
            </div>`;
        return;
    }

    const html = results.map(p => `
        <button onclick="konfirmasiPeserta('${p.user_id}')" class="w-full text-left bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-neutron-500 hover:shadow-md transition-all flex justify-between items-center group">
            <span class="font-bold text-slate-700 group-hover:text-neutron-600">${p.nama}</span>
            <svg class="w-5 h-5 text-slate-300 group-hover:text-neutron-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
    `).join('');
    
    searchResults.innerHTML = html;
}

// Fungsi konfirmasi sebelum menampilkan akun
function konfirmasiPeserta(userId) {
    const p = state.peserta.find(x => x.user_id === userId);
    if (!p) return;

    Swal.fire({
        title: 'PERHATIAN',
        html: `Pastikan Anda memilih nama Anda sendiri:<br><br><strong class="text-2xl text-neutron-700">${p.nama}</strong><br><br><span class="text-sm text-red-500 font-semibold">Jangan sampai salah mengambil akun peserta lain!</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb', // bg-neutron-600
        cancelButtonColor: '#f1f5f9', // bg-slate-100
        confirmButtonText: 'Ya, ini nama saya',
        cancelButtonText: '<span class="text-slate-700">Batal</span>',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            renderDetailAkun(p);
        }
    });
}

// Fungsi merender detail kredensial Try Out peserta
function renderDetailAkun(p) {
    // Sembunyikan div pencarian 
    searchInput.parentElement.parentElement.style.display = 'none';
    
    // Tampilkan Card Detail Akun
    const detailHtml = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-[fadeIn_0.3s_ease-in-out]">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-slate-800">${p.nama}</h3>
                <p class="text-sm text-slate-500 mt-1">Berikut adalah kredensial Try Out Anda</p>
            </div>

            <div class="space-y-3 mb-6">
                ${createCopyRow('User ID', p.user_id)}
                ${createCopyRow('Password', p.password)}
                ${createCopyRow('Token Mapel Wajib', state.tryout.token_wajib)}
                ${createCopyRow('Token Mapel Minat', state.tryout.token_minat)}
            </div>

            <div class="flex flex-col gap-3">
                <button onclick="copySemua('${p.user_id}', '${p.password}')" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Copy Semua Data
                </button>
                <a href="${state.tryout.link_to}" target="_blank" class="w-full bg-neutron-600 hover:bg-neutron-700 text-white text-center font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-neutron-500/30 flex items-center justify-center gap-2">
                    BUKA LINK TRY OUT
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
                <button onclick="location.reload()" class="w-full text-sm text-slate-400 hover:text-slate-600 font-semibold mt-3">
                    &larr; Kembali ke Pencarian
                </button>
            </div>
        </div>
    `;
    searchResults.innerHTML = detailHtml;
}

// Helper untuk membuat baris UI Copy
function createCopyRow(label, value) {
    return `
        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
                <p class="text-xs text-slate-400 font-semibold mb-0.5 uppercase tracking-wide">${label}</p>
                <p class="font-bold text-slate-800 font-mono text-lg">${value}</p>
            </div>
            <button onclick="copyTeks('${value}')" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-neutron-600 hover:bg-neutron-50 hover:border-neutron-300 transition-colors flex items-center gap-1.5 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                Copy
            </button>
        </div>
    `;
}

// Fungsi eksekusi Copy ke Clipboard
function copyTeks(teks) {
    navigator.clipboard.writeText(teks).then(() => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Berhasil disalin!',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
    }).catch(err => {
        console.error('Gagal menyalin:', err);
        Swal.fire('Error', 'Gagal menyalin teks ke clipboard', 'error');
    });
}

// Fungsi eksekusi Copy Semua
function copySemua(userId, password) {
    const teks = `User ID: ${userId}\nPassword: ${password}\nToken Mapel Wajib: ${state.tryout.token_wajib}\nToken Mapel Minat: ${state.tryout.token_minat}`;
    copyTeks(teks);
}