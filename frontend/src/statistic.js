import './style.css';

const ctx = document.getElementById('chartKeuangan').getContext('2d');
const dataRaw = JSON.parse(localStorage.getItem('dataTransaksi')) || [];
let myChart;

// 1. Tambahkan parameter tahunTerpilih di sini
function updateStats(bulanTerpilih, tahunTerpilih) {
    let masuk = 0;
    let keluar = 0;

    const dataDifilter = dataRaw.filter(t => {
        const [tahun, bulan] = t.tanggal.split('-'); // Pecah YYYY-MM-DD

        // Logika filter ganda
        const cocokBulan = (bulanTerpilih === 'all' || bulan === bulanTerpilih);
        const cocokTahun = (tahun === tahunTerpilih);

        return cocokBulan && cocokTahun;
    });

    dataDifilter.forEach(t => {
        const nom = parseInt(t.nominal.replace(/\./g, '')) || 0;
        t.tipe === 'pemasukan' ? masuk += nom : keluar += nom;
    });

    const format = new Intl.NumberFormat("id-ID");
    document.getElementById('labelTengah').innerText = `Rp ${format.format(keluar)}`;
    document.getElementById('statPemasukan').innerText = `Rp ${format.format(masuk)}`;
    document.getElementById('statPengeluaran').innerText = `Rp ${format.format(keluar)}`;

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pemasukan', 'Pengeluaran'],
            datasets: [{
                data: [masuk, keluar],
                backgroundColor: ['#6366f1', '#f59e0b'],
                borderWidth: 0,
                borderRadius: 15,
                spacing: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: { legend: { display: false } }
        }
    });
}

// 2. Fungsi pembantu untuk menjalankan filter dari kedua dropdown
function jalankanFilter() {
    const bulan = document.getElementById('filterBulan').value;
    const tahun = document.getElementById('filterTahun').value;
    updateStats(bulan, tahun);
}

// 3. Event Listeners
document.getElementById('filterBulan').addEventListener('change', jalankanFilter);
document.getElementById('filterTahun').addEventListener('change', jalankanFilter);

document.getElementById('tabKeDashboard').addEventListener('click', () => {
    window.location.href = '/dashboard'; // Pastikan pakai .html jika di Vite
});

// 4. Inisialisasi Dropdown Tahun secara Dinamis
function updateDropdownTahun() {
    const filterTahun = document.getElementById('filterTahun');
    const daftarTahun = [...new Set(dataRaw.map(t => t.tanggal.split('-')[0]))];

    daftarTahun.sort((a, b) => b - a);

    filterTahun.innerHTML = daftarTahun.map(tahun =>
        `<option value="${tahun}">${tahun}</option>`
    ).join('');

    if (daftarTahun.length === 0) {
        const tahunSekarang = new Date().getFullYear().toString();
        filterTahun.innerHTML = `<option value="${tahunSekarang}">${tahunSekarang}</option>`;
    }
}

updateDropdownTahun(); // Isi dropdown dulu
const tahunDefault = document.getElementById('filterTahun').value;
updateStats('all', tahunDefault); // Baru jalankan chart pertama kali