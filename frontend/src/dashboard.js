import './style.css';

// 1. Inisialisasi State dan DOM Elements 
let dataTransaksi = [];
const formTransaksi = document.getElementById("formTransaksi");
const listContainer = document.getElementById("listTransaksi");
const tabKembali = document.getElementById("tabKembali");
const inputNominal = document.getElementById("inputNominal");
const tanggalTransaksi = document.getElementById("tanggalTransaksi");

// Button Kembali Navigasi
tabKembali.addEventListener('click', () => {
  window.location.href = '/';
});

// Format input nominal 
inputNominal.addEventListener('keyup', function(e) {
  let value = this.value.replace(/[^0-9]/g, '');

  if(value) {
    const formatter = new Intl.NumberFormat("id-ID");
    this.value = formatter.format(value);
  } else {
    this.value = '';
  }
});

// Set default tanggal 
tanggalTransaksi.valueAsDate = new Date();

// Handle Simpan Transaksi
formTransaksi.addEventListener('submit', (e) => {
  e.preventDefault();  // Mencegah reload halaman

  // Ambil data dari form
  const nominalValue = inputNominal.value;
  const radioTerpilih = document.querySelector('input[name="tipe]:checked');
  const tipeSelected = radioTerpilih ? radioTerpilih.id : 'pengeluaran'; // Pemasukan atau pengeluaran
  const tanggalValue = tanggalTransaksi.value;
  const catatanValue = document.getElementById("catatanTransaksi").value;

  // Validasi 
  if (!nominalValue) {
    showAlert('Isi form dengan lengkap!', 'alert-warning');
    return;
  };

  const transaksiBaru = {
    nominal : nominalValue,
    tipe : tipeSelected,
    tanggal : tanggalValue,
    catatan : catatanValue
  };
  
  dataTransaksi.unshift(transaksiBaru); // Masukkan ke urutan paling atas
  
  // Reset form
  formTransaksi.reset();
  tanggalTransaksi.valueAsDate = new Date(); 

  // Alert
  showAlert('Transaksi berhasil disimpan!', 'alert-success');
  tampilkanTransaksi();
});

// Menampilkan data ke UI
function tampilkanTransaksi() {
  listContainer.innerHTML = ""; 

  if (dataTransaksi.length === 0 ) {
    listContainer.innerHTML = ` <p class="text-slate-600 text-center text-sm italic">Belum ada transaksi.</p>`;
    return;
  }

  dataTransaksi.forEach((item) => {
    const isPemasukan = item.tipe === 'pemasukan';

    const cardHtml = `
      <div class="bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-lg">
        <div>
          <p class="text-white font-bold">${item.nominal}</p>
          <p class="text-slate-500 text-xs">${item.tanggal} • ${item.catatan || 'Tanpa catatan'}</p>
        </div>
        <span class="badge ${isPemasukan ? 'badge-success' : 'badge-warning'} badge-sm font-bold uppercase text-[10px]">
          ${item.tipe}
        </span>
      </div>
    `;

    listContainer.innerHTML += cardHtml;
  });
}  

// Modifikasi Alert 
function showAlert(pesan, tipe = 'alert-info') {
  const alertContainer = document.getElementById("alertContainer");

  // 1. Buat element alert 
  const alertDiv = document.createElement('div');
  alertDiv.setAttribute('role', 'alert');
  alertDiv.className = `alert ${tipe} shadow-lg mb-3 transition-all duration-500 opacity-0 translate-y-[-20px]`;

  alertDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span class="font-bold text-sm">${pesan}</span>
  `;

  // 2. Masukkan ke container
  alertContainer.appendChild(alertDiv);

  // 3. Trigger animasi
  setTimeout(() => {
        alertDiv.classList.remove('opacity-0', 'translate-y-[-20px]');
    }, 10);

    // 4. Hapus otomatis setelah 3 detik
    setTimeout(() => {
        alertDiv.classList.add('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => {
            alertDiv.remove();
        }, 500);
    }, 3000);
}
