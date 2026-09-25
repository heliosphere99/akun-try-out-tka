// assets/js/app.js
// Berisi fungsi-fungsi global untuk UI/UX aplikasi

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Mobile Menu Toggle untuk Admin Panel
    setupMobileSidebar();
});

function setupMobileSidebar() {
    // Cek apakah ini halaman admin yang punya sidebar
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('main header');
    
    if (sidebar && header) {
        // Buat tombol hamburger menu
        const menuBtn = document.createElement('button');
        menuBtn.innerHTML = `<svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`;
        menuBtn.className = 'md:hidden mr-4 p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none';
        
        // Sisipkan tombol di sebelah kiri judul halaman
        const headerTitle = header.querySelector('h1');
        if (headerTitle) {
            header.insertBefore(menuBtn, headerTitle);
        }

        // Agar sidebar bisa melayang (absolute) di mobile
        sidebar.classList.add('transition-transform', 'duration-300', 'z-40');
        
        // Logika buka tutup
        let isOpen = false;
        
        // Buat backdrop gelap
        const backdrop = document.createElement('div');
        backdrop.className = 'fixed inset-0 bg-slate-900/50 z-30 hidden md:hidden transition-opacity opacity-0';
        document.body.appendChild(backdrop);

        const toggleMenu = () => {
            isOpen = !isOpen;
            if (isOpen) {
                // Buka sidebar
                sidebar.classList.remove('hidden');
                sidebar.classList.add('absolute', 'inset-y-0', 'left-0', 'shadow-2xl');
                
                // Tampilkan backdrop
                backdrop.classList.remove('hidden');
                setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
            } else {
                // Tutup sidebar
                sidebar.classList.add('hidden');
                sidebar.classList.remove('absolute', 'inset-y-0', 'left-0', 'shadow-2xl');
                
                // Sembunyikan backdrop
                backdrop.classList.add('opacity-0');
                setTimeout(() => backdrop.classList.add('hidden'), 300);
            }
        };

        menuBtn.addEventListener('click', toggleMenu);
        backdrop.addEventListener('click', toggleMenu);
    }
}