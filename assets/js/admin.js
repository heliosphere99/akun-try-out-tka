// --- KONFIGURASI LOGIN ---
const loginForm = document.getElementById('form-login');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ambil nilai dari input
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const btnSubmit = loginForm.querySelector('button[type="submit"]');
        
        // Ubah state tombol menjadi loading
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = 'Memeriksa...';
        btnSubmit.disabled = true;
        btnSubmit.classList.add('opacity-70');

        try {
            // Fetch kredensial dari JSON
            const res = await fetch('../../src/admin_user.json');
            const data = await res.json();

            // Simulasi delay sedikit agar terasa "memproses" (opsional untuk feel UX)
            setTimeout(() => {
                if (user === data.username && pass === data.password) {
                    // Berhasil login - set flag session
                    sessionStorage.setItem('auth_admin', 'true');
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Berhasil',
                        text: 'Mengalihkan ke Dashboard...',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.href = 'dashboard.html';
                    });
                } else {
                    // Gagal
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Gagal',
                        text: 'Username atau Password yang Anda masukkan salah!',
                        confirmButtonColor: '#2563eb'
                    });
                    // Kembalikan tombol
                    btnSubmit.innerHTML = originalText;
                    btnSubmit.disabled = false;
                    btnSubmit.classList.remove('opacity-70');
                }
            }, 800);

        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Gagal terhubung ke data sistem (JSON tidak ditemukan)', 'error');
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }
    });
}

// --- FUNGSI PROTEKSI HALAMAN (Untuk dipakai di halaman admin lain) ---
function checkAuth() {
    // Jika tidak ada session, lempar kembali ke halaman login
    if (!sessionStorage.getItem('auth_admin')) {
        window.location.href = 'login.html';
    }
}

// --- FUNGSI LOGOUT ---
function logoutAdmin() {
    Swal.fire({
        title: 'Keluar?',
        text: "Anda akan keluar dari sesi admin.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc2626', // red
        cancelButtonColor: '#94a3b8', // slate
        confirmButtonText: 'Ya, Keluar'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem('auth_admin');
            window.location.href = 'login.html';
        }
    });
}