// State untuk menyimpan data JSON
const state = {
    sekolah: null,
    tryout: null,
    peserta: []
};

// Elemen DOM utama
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// 1. FUNGSI LOAD DATA UTAMA
async function loadData() {
    try {
        const [resSekolah, resTryout, resPeserta] = await Promise.all([
            fetch('src/data_sekolah.json'),
            fetch('src/data_tryout.json'),
            fetch('src/data_peserta.json')
        ]);

        state.sekolah = await resSekolah.json();
        state.tryout = await resTryout.json();
        state.peserta = await resPeserta.json();

        // CEK STATUS MAINTENANCE DULU
        if (state.tryout.status_publik === 'maintenance') {
            renderMaintenance();
        } else {
            renderInfo(); // Lanjut render normal
        }
    } catch (error) {
        console.error("Gagal memuat data:", error);
        Swal.fire('Error', 'Sistem gagal memuat data. Pastikan file JSON tersedia.', 'error');
    }
}

// 2. FUNGSI TAMPILAN MAINTENANCE
function renderMaintenance() {
    // Sembunyikan isi main tag, ganti dengan Card Maintenance
    const mainArea = document.querySelector('main');
    mainArea.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-10 text-center animate-[fadeIn_0.5s_ease-in-out]">
            <div class="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Sistem Sedang Ditutup</h2>
            <p class="text-slate-500 mb-6 font-semibold">Halaman pencarian akun peserta sedang dalam pemeliharaan atau Try Out belum dimulai. Silakan kembali lagi nanti sesuai instruksi Admin.</p>
        </div>
    `;
}

// 3. FUNGSI RENDER INFO SEKOLAH & TO (Normal Mode)
function renderInfo() {
    document.getElementById('nama-sekolah-display').innerHTML = `
        ${state.sekolah.nama_sekolah} 
        <br>
        <span class="text-sm text-slate-500 font-normal">
            NPSN: ${state.sekolah.npsn} &bull; ${state.sekolah.alamat_jalan}
        </span>
    `;

    // Format Tanggal (Contoh: Sabtu, 10 Oktober 2026)
    const dateObj = new Date(state.tryout.tanggal_tes);
    const formattedDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    document.getElementById('tgl-tes-display').textContent = formattedDate;
    document.getElementById('durasi-display').textContent = state.tryout.durasi_menit + ' menit';
    document.getElementById('buka-display').textContent = state.tryout.waktu_dibuka + ' WIB';
    document.getElementById('tutup-display').textContent = state.tryout.waktu_selesai + ' WIB';

    // Event Pencarian hanya aktif jika tidak maintenance
    searchInput.addEventListener('input', handleSearch);
}

// 4. LOGIKA PENCARIAN NAMA
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (query.length >= 3) {
        const results = state.peserta.filter(p => p.nama.toLowerCase().includes(query));
        renderSearchResults(results);
    } else {
        searchResults.innerHTML = ''; 
    }
}

// 5. TAMPILKAN HASIL PENCARIAN
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

// 6. KONFIRMASI NAMA (SWEETALERT)
function konfirmasiPeserta(userId) {
    const p = state.peserta.find(x => x.user_id === userId);
    if (!p) return;

    Swal.fire({
        title: 'PERHATIAN',
        html: `Pastikan ini nama Anda sendiri:<br><br><strong class="text-2xl text-neutron-700">${p.nama}</strong><br><br><span class="text-sm text-red-500 font-semibold">Jangan sampai mengambil akun peserta lain!</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#f1f5f9',
        confirmButtonText: 'Ya, ini nama saya',
        cancelButtonText: '<span class="text-slate-700">Batal</span>',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) renderDetailAkun(p);
    });
}

// 7. TAMPILKAN DETAIL KREDENSIAL + TOMBOL WA
function renderDetailAkun(p) {
    searchInput.parentElement.parentElement.style.display = 'none'; // Sembunyikan kotak cari
    
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
                
                <!-- TOMBOL SIMPAN KE WHATSAPP -->
                <button onclick="kirimKeWA('${p.user_id}')" class="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Simpan ke WhatsApp Saya
                </button>

                <a href="${state.tryout.link_to}" target="_blank" class="w-full bg-neutron-600 hover:bg-neutron-700 text-white text-center font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-neutron-500/30 flex items-center justify-center gap-2 mt-2">
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

// 8. LOGIKA WHATSAPP (Message Yourself)
function kirimKeWA(userId) {
    const p = state.peserta.find(x => x.user_id === userId);
    if (!p) return;

    Swal.fire({
        title: 'Kirim ke WA Saya',
        text: 'Masukkan nomor WA Anda (awali dengan awalan bebas seperti 08, 628, atau +62):',
        input: 'text',
        inputPlaceholder: 'Contoh: 08123456789',
        showCancelButton: true,
        confirmButtonText: 'Buka WhatsApp',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#25D366', // WA Color
        inputValidator: (value) => {
            if (!value) return 'Nomor WhatsApp tidak boleh kosong!';
            if (value.length < 9) return 'Nomor WhatsApp terlalu pendek!';
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Bersihkan nomor dari karakter aneh (+, spasi, strip)
            let waNumber = result.value.replace(/[^0-9]/g, '');
            
            // Otomatis ubah awalan 0 jadi 62
            if (waNumber.startsWith('0')) {
                waNumber = '62' + waNumber.substring(1);
            }

            // Dapatkan format tanggal yang bagus
            const dateObj = new Date(state.tryout.tanggal_tes);
            const formattedDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

            // RAKIT PESAN SUPER LENGKAP
            const pesan = `Halo *${p.nama}*! 👋\nBerikut adalah informasi Akun Try Out TKA Anda:\n\n🏢 *ASAL SEKOLAH*\nNama: ${state.sekolah.nama_sekolah}\nNPSN: ${state.sekolah.npsn}\n\n🔐 *DATA AKUN*\nUser ID: ${p.user_id}\nPassword: ${p.password}\nToken Wajib: ${state.tryout.token_wajib}\nToken Minat: ${state.tryout.token_minat}\n\n📅 *JADWAL PELAKSANAAN*\nTanggal: ${formattedDate}\nWaktu Akses: ${state.tryout.waktu_dibuka} - ${state.tryout.waktu_selesai} WIB\nDurasi: ${state.tryout.durasi_menit} Menit\n\n🔗 *LINK TRY OUT*\n${state.tryout.link_to}\n\n⚠️ _Pastikan Anda login sesuai jadwal yang ditentukan. Semangat!_`;

            // Buka aplikasi WhatsApp / WhatsApp Web
            const encodedPesan = encodeURIComponent(pesan);
            window.open(`https://wa.me/${waNumber}?text=${encodedPesan}`, '_blank');
        }
    });
}

// HELPERS COPY TEKS (Tidak Berubah)
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

function copyTeks(teks) {
    navigator.clipboard.writeText(teks).then(() => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Berhasil disalin!', showConfirmButton: false, timer: 1500 });
    });
}

function copySemua(userId, password) {
    const teks = `User ID: ${userId}\nPassword: ${password}\nToken Mapel Wajib: ${state.tryout.token_wajib}\nToken Mapel Minat: ${state.tryout.token_minat}`;
    copyTeks(teks);
}