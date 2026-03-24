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
  const radioTerpilih = document.querySelector('input[name="tipe"]:checked');
  const tipeSelected = radioTerpilih ? radioTerpilih.id : 'pengeluaran'; // Pemasukan atau pengeluaran
  const tanggalValue = tanggalTransaksi.value;
  const catatanValue = document.getElementById("catatanTransaksi").value;

  // Validasi 
  if (!nominalValue) {
    showAlert('Isi form dengan lengkap!', 'alert-warning');
    return;
  };

  const transaksiBaru = {
    id : Date.now(), // ID Unik berdasarkan milidetik 
    nominal : nominalValue,
    tipe : tipeSelected,
    tanggal : tanggalValue,
    catatan : catatanValue
  };
  
  dataTransaksi.unshift(transaksiBaru); // Masukkan ke urutan paling atas

  // Alert
  showAlert('Transaksi berhasil disimpan!', 'alert-success');
  tampilkanTransaksi();
  hitungSaldo();

  // Reset form
  formTransaksi.reset();
  tanggalTransaksi.valueAsDate = new Date(); 
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
    <div class="bg-slate-900 group border-2 border-slate-800 p-4 rounded-3xl flex justify-between items-center shadow-lg mb-3 transition-all hover:border-indigo-500/50">
      <div class="space-y-1">
        <p class="text-white font-black text-lg tracking-tight">Rp ${item.nominal}</p>
        
        <p class="text-slate-500 text-[10px] flex items-center gap-1.5">
          <span class="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">Tanggal</span> 
          ${item.tanggal}
        </p>
        
        <p class="text-slate-400 text-xs italic truncate max-w-[150px] md:max-w-xs">
          ${item.catatan || 'Tanpa catatan'}
        </p>
      </div>

      <div class="flex flex-col items-end gap-3">
        <span class="badge ${isPemasukan ? 'badge-success' : 'badge-warning'} badge-xs font-black uppercase text-[9px] py-2.5 px-3 shadow-sm">
          ${item.tipe}
        </span>

        <div class="flex gap-4 md:gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
          <button onclick="hapusTransaksi(${item.id})" class="text-error hover:text-red-400 text-[11px] font-bold uppercase tracking-wider transition-colors">
            Hapus
          </button>
          <div class="w-[1px] h-3 bg-slate-800 md:hidden"></div> <button onclick="editTransaksi(${item.id})" class="text-info hover:text-blue-400 text-[11px] font-bold uppercase tracking-wider transition-colors">
            Edit
          </button>
        </div>
      </div>
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

// Menjumlahkan nominalnya berdasarkan tipe transaksi
function hitungSaldo() {
  let pemasukan = 0;
  let pengeluaran = 0;

  dataTransaksi.forEach(item => {
    const angkaMurni = parseInt(item.nominal.replace(/\./g, '')) || 0 ;

    if (item.tipe === 'pemasukan'){
      pemasukan += angkaMurni;
    } else {
      pengeluaran += angkaMurni;
    }
  });

  const totalSaldo = pemasukan - pengeluaran;
  const formatTotal = new Intl.NumberFormat("id-ID");

  document.getElementById("totalPemasukan").innerText = `Rp. ${formatTotal.format(pemasukan)}`;
  document.getElementById("totalPengeluaran").innerText = `Rp. ${formatTotal.format(pengeluaran)}`;
  document.getElementById("totalSaldo").innerText = `Rp. ${formatTotal.format(totalSaldo)}`;
}

// CRUD 
// Hapus Transaksi 
let idYangAkanDihapus = null;
window.hapusTransaksi = function(id) {
  idYangAkanDihapus = id;
  const modal = document.getElementById("modalHapus");
  modal.showModal();
};

document.getElementById('btnConfirmHapus').addEventListener('click', () => {
  if(idYangAkanDihapus) {
    dataTransaksi = dataTransaksi.filter(item => item.id !== idYangAkanDihapus);

    // Update UI
    tampilkanTransaksi();
    hitungSaldo();
    document.getElementById("modalHapus").close();
    showAlert('Riwayat berhasil dihapus', 'alert-success');

    idYangAkanDihapus = null;
  }
}); 

// Edit Transaksi 
window.editTransaksi = function(id) {
  const item = dataTransaksi.find(t => t.id === id);
  if (!item) {
    showAlert('Data Transaksi tidak ditemukan', 'alert-error');
    return;
  }

  inputNominal.value = item.nominal;
  tanggalTransaksi.value = item.tanggal;
  document.getElementById("catatanTransaksi").value = item.catatan;

  const radioElement = document.getElementById(item.tipe);
  if (radioElement) {
    radioElement.checked=true;
  }

  // Hapus data lama
  dataTransaksi = dataTransaksi.filter(t => t.id !== id);

  // Scroll otomatis ke atas agar user sadar form sudah terisi
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showAlert("Silakan ubah data di atas", "alert-info");
}