let tableData = null; // Variabel untuk menyimpan instance DataTables
let jsonPesertaArray = []; // Array data final peserta

// --- 1. LOAD DATA TRY OUT EKSISTING ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('../../src/data_tryout.json');
        const data = await res.json();
        
        // Isi form TO
        document.getElementById('to-link').value = data.link_to || '';
        document.getElementById('to-wajib').value = data.token_wajib || '';
        document.getElementById('to-minat').value = data.token_minat || '';
        document.getElementById('to-tanggal').value = data.tanggal_tes || '';
        document.getElementById('to-buka').value = data.waktu_dibuka || '';
        document.getElementById('to-tutup').value = data.waktu_selesai || '';
        document.getElementById('to-durasi').value = data.durasi_menit || '';
    } catch (err) {
        console.warn("Gagal memuat data TO saat ini", err);
    }
});

// --- 2. SIMPAN & UNDUH DATA TRY OUT ---
document.getElementById('form-tryout').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const tryoutData = {
        link_to: document.getElementById('to-link').value.trim(),
        token_wajib: document.getElementById('to-wajib').value.trim(),
        token_minat: document.getElementById('to-minat').value.trim(),
        tanggal_tes: document.getElementById('to-tanggal').value,
        waktu_dibuka: document.getElementById('to-buka').value,
        waktu_selesai: document.getElementById('to-tutup').value,
        durasi_menit: parseInt(document.getElementById('to-durasi').value)
    };

    downloadJSON(tryoutData, 'data_tryout.json');
});

// --- 3. BACA & VALIDASI FILE EXCEL ---
const fileInput = document.getElementById('file-excel');
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Ambil sheet pertama
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert ke Array of Objects (baris pertama otomatis jadi key)
            const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            
            if (rawJson.length === 0) {
                Swal.fire('Kosong', 'File Excel tidak memiliki data.', 'warning');
                return;
            }

            // Validasi Kolom (Kita normalisasi nama key agar case insensitive)
            const keys = Object.keys(rawJson[0]).map(k => k.toLowerCase().trim());
            
            const hasNo = keys.includes('no');
            const hasUserId = keys.includes('user id') || keys.includes('userid');
            const hasPassword = keys.includes('password');
            const hasNama = keys.includes('nama peserta') || keys.includes('nama');

            if (!hasNo || !hasUserId || !hasPassword || !hasNama) {
                Swal.fire({
                    icon: 'error',
                    title: 'Format Salah',
                    html: 'Pastikan baris pertama memiliki Header kolom:<br><b>No | User ID | Password | Nama Peserta</b>'
                });
                return;
            }

            // Map data mentah ke format JSON aplikasi
            jsonPesertaArray = rawJson.map((row, index) => {
                // Mencari key asli dari file yang mungkin huruf besar/kecilnya beda
                const getVal = (possibleKeys) => {
                    const foundKey = Object.keys(row).find(k => possibleKeys.includes(k.toLowerCase().trim()));
                    return foundKey ? row[foundKey] : "";
                };

                return {
                    no: getVal(['no']) || (index + 1),
                    user_id: String(getVal(['user id', 'userid'])).trim(),
                    password: String(getVal(['password'])).trim(),
                    nama: String(getVal(['nama peserta', 'nama'])).trim()
                };
            }).filter(p => p.user_id !== "" && p.nama !== ""); // Hapus baris benar-benar kosong

            // Render ke DataTables
            renderTable(jsonPesertaArray);
            
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success', 
                title: `${jsonPesertaArray.length} data peserta berhasil dibaca!`, 
                showConfirmButton: false, timer: 2000
            });

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal membaca file Excel. Pastikan formatnya benar (.xlsx).', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
});

// --- 4. RENDER DATATABLES ---
function renderTable(dataArray) {
    const previewContainer = document.getElementById('preview-container');
    previewContainer.classList.remove('hidden');

    // Jika tabel sudah ada, hancurkan dulu (re-initialize)
    if ($.fn.DataTable.isDataTable('#table-peserta')) {
        $('#table-peserta').DataTable().destroy();
    }

    // Persiapkan data untuk DataTables (Array of Arrays)
    const dtData = dataArray.map(item => [
        item.no, 
        item.user_id, 
        item.password, 
        item.nama
    ]);

    $('#table-peserta').DataTable({
        data: dtData,
        pageLength: 25,
        language: {
            search: "Cari:",
            lengthMenu: "Tampilkan _MENU_ data",
            info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ peserta",
            paginate: { previous: "<", next: ">" }
        }
    });
}

// --- 5. SIMPAN & UNDUH DATA PESERTA ---
document.getElementById('btn-unduh-peserta').addEventListener('click', () => {
    if (jsonPesertaArray.length === 0) return;
    downloadJSON(jsonPesertaArray, 'data_peserta.json');
});

// --- HELPER: FUNGSI UNDUH JSON ---
function downloadJSON(dataObject, filename) {
    const jsonString = JSON.stringify(dataObject, null, 2);
    
    Swal.fire({
        title: 'Berhasil Dibuat!',
        html: `File <b>${filename}</b> siap diunduh. Silakan timpa file lama di repository Anda.`,
        icon: 'success',
        confirmButtonText: 'Unduh File JSON',
        confirmButtonColor: '#16a34a'
    }).then((result) => {
        if (result.isConfirmed) {
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
}