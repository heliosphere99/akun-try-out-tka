// --- LOAD CURRENT DATA ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('../../src/data_sekolah.json');
        const data = await res.json();
        
        // Isi form dengan data saat ini
        document.getElementById('form-npsn').value = data.npsn || '';
        document.getElementById('form-nama').value = data.nama_sekolah || '';
        document.getElementById('form-alamat').value = data.alamat_jalan || '';
    } catch (err) {
        console.warn("Belum ada data sekolah atau gagal memuat", err);
    }
});

// --- FITUR CARI API ---
const btnCari = document.getElementById('btn-cari');
const inputNpsn = document.getElementById('api-npsn');
const resultDiv = document.getElementById('api-result');
let tempApiData = null; // Menyimpan data sementara dari API

btnCari.addEventListener('click', async () => {
    const npsn = inputNpsn.value.trim().toUpperCase();
    if (npsn.length < 5) {
        Swal.fire('Perhatian', 'NPSN terlalu pendek!', 'warning');
        return;
    }

    // Efek loading
    btnCari.innerHTML = 'Mencari...';
    btnCari.disabled = true;
    resultDiv.classList.add('hidden');

    try {
        // Menggunakan endpoint yang benar tanpa /api/
        const response = await fetch(`https://sekolah.devapi.id/sekolah?npsn=${npsn}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            // Ambil data pertama
            const dataSekolah = result.data[0];
            
            // Map data sesuai kebutuhan
            tempApiData = {
                npsn: dataSekolah.npsn,
                nama_sekolah: dataSekolah.nama,
                // Pastikan alamat tidak error jika objeknya null
                alamat_jalan: dataSekolah.alamat ? dataSekolah.alamat.jalan : '-' 
            };

            // Tampilkan ke UI
            document.getElementById('res-npsn').textContent = tempApiData.npsn;
            document.getElementById('res-nama').textContent = tempApiData.nama_sekolah;
            document.getElementById('res-alamat').textContent = tempApiData.alamat_jalan;
            
            resultDiv.classList.remove('hidden');
            resultDiv.classList.add('animate-[fadeIn_0.3s_ease-in]');
        } else {
            Swal.fire('Tidak Ditemukan', 'NPSN tidak ditemukan di database.', 'error');
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        Swal.fire('Gagal', 'Terjadi kesalahan jaringan atau API tidak merespons.', 'error');
    } finally {
        btnCari.innerHTML = 'CARI';
        btnCari.disabled = false;
    }
});

// --- TOMBOL GUNAKAN DATA INI ---
document.getElementById('btn-gunakan').addEventListener('click', () => {
    if (tempApiData) {
        document.getElementById('form-npsn').value = tempApiData.npsn;
        document.getElementById('form-nama').value = tempApiData.nama_sekolah;
        document.getElementById('form-alamat').value = tempApiData.alamat_jalan;
        
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Data ditransfer ke form!',
            showConfirmButton: false,
            timer: 1500
        });
    }
});

// --- SIMPAN DAN UNDUH JSON ---
document.getElementById('form-sekolah').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Bentuk JSON baru
    const newData = {
        npsn: document.getElementById('form-npsn').value.trim(),
        nama_sekolah: document.getElementById('form-nama').value.trim(),
        alamat_jalan: document.getElementById('form-alamat').value.trim()
    };

    const jsonString = JSON.stringify(newData, null, 2);

    Swal.fire({
        title: 'Berhasil Dibuat!',
        html: `Data JSON siap. Karena sistem bersifat statis, silakan salin kode di bawah atau unduh filenya lalu timpa file <b>src/data_sekolah.json</b> di repository Anda.<br><br><textarea class="w-full text-xs font-mono p-3 bg-slate-100 rounded-lg outline-none" rows="6" readonly>${jsonString}</textarea>`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Download File',
        cancelButtonText: 'Tutup',
        confirmButtonColor: '#16a34a' // green-600
    }).then((result) => {
        if (result.isConfirmed) {
            // Trigger download file json
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data_sekolah.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
});