document.addEventListener('DOMContentLoaded', function () {
    // Load data from LocalStorage or initialize with empty array
    let transactions = JSON.parse(localStorage.getItem('celenganku_data_v3')) || [];
    let editingId = null;
    let deletingId = null;

    const form = {
        description: document.getElementById('description'),
        amount: document.getElementById('amount'),
        date: document.getElementById('date'),
        type: document.getElementById('type')
    };

    const today = new Date().toISOString().split('T')[0];
    form.date.value = today;

    // UI Elements
    const elements = {
        addBtn: document.getElementById('addBtn'),
        updateBtn: document.getElementById('updateBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        searchInput: document.getElementById('searchInput'),
        monthFilter: document.getElementById('monthFilter'),
        yearFilter: document.getElementById('yearFilter'),
        resetFilterBtn: document.getElementById('resetFilter'),
        editActions: document.getElementById('editActions'),
        formTitle: document.getElementById('formTitle'),
        transactionCountEl: document.getElementById('transactionCount'),
        tbody: document.getElementById('transactionBody'),
        monthlySummaryBody: document.getElementById('monthlySummaryBody'),
        emptyMsg: document.getElementById('emptyMessage'),
        totalIncomeEl: document.getElementById('totalIncome'),
        totalExpenseEl: document.getElementById('totalExpense'),
        totalBalanceEl: document.getElementById('totalBalance'),
        toastContainer: document.getElementById('toast-container'),
        deleteModal: document.getElementById('delete_modal'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn')
    };

    // --- Routing Logic ---
    function handleRouting() {
        const hash = window.location.hash || '#home';
        
        // Toggle Pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', `#${page.id}` === `#page-${hash.substring(1)}`);
        });

        // Toggle Nav Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });

        // Scroll to top when changing page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('hashchange', handleRouting);
    handleRouting(); // Initial call

    // --- Core Logic: Save & Sync ---
    function persistData() {
        localStorage.setItem('celenganku_data_v3', JSON.stringify(transactions));
        render();
    }

    // --- Interactive: Formatting Amount ---
    form.amount.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = value ? parseInt(value).toLocaleString('id-ID') : '';
    });

    function getRawAmount(val) {
        if (!val) return 0;
        return parseInt(val.toString().replace(/\./g, '')) || 0;
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-item ${type === 'error' ? 'toast-error' : ''}`;
        toast.textContent = message;
        elements.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    function populateYearFilter() {
        const currentYear = new Date().getFullYear();
        elements.yearFilter.innerHTML = '<option value="">Tahun</option>';
        for (let i = currentYear - 5; i <= currentYear + 2; i++) {
            const opt = document.createElement('option');
            opt.value = i; opt.textContent = i;
            elements.yearFilter.appendChild(opt);
        }
    }
    populateYearFilter();

    // --- Actions ---
    function addTransaction() {
        if (!validateForm()) return;
        const nt = {
            id: Date.now(),
            description: form.description.value.trim(),
            amount: getRawAmount(form.amount.value),
            date: form.date.value,
            type: form.type.value
        };
        transactions.push(nt);
        showToast('Catatan disimpan! 🚀');
        resetForm();
        persistData();
    }

    function updateTransaction() {
        if (!editingId || !validateForm()) return;
        const i = transactions.findIndex(t => t.id === editingId);
        if (i !== -1) {
            transactions[i] = { ...transactions[i],
                description: form.description.value.trim(),
                amount: getRawAmount(form.amount.value),
                date: form.date.value,
                type: form.type.value
            };
            showToast('Catatan diperbarui! ✨');
            resetForm();
            persistData();
        }
    }

    function deleteConfirmed() {
        if (!deletingId) return;
        transactions = transactions.filter(t => t.id !== deletingId);
        if (editingId === deletingId) resetForm();
        elements.deleteModal.close();
        showToast('Dihapus! 🗑️');
        deletingId = null;
        persistData();
    }

    // --- Global Access ---
    window.openDeleteModal = (id) => { deletingId = id; elements.deleteModal.showModal(); };
    window.editTransaction = (id) => {
        const t = transactions.find(x => x.id === id);
        if (!t) return;
        
        // Switch to home page for editing
        window.location.hash = '#home';
        
        form.description.value = t.description;
        form.amount.value = t.amount.toLocaleString('id-ID');
        form.date.value = t.date;
        form.type.value = t.type;
        editingId = t.id;
        setButtonMode();
        
        setTimeout(() => {
            document.getElementById('formTitle').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    function resetForm() {
        form.description.value = ''; form.amount.value = ''; form.date.value = today; form.type.value = 'income';
        editingId = null; setButtonMode();
    }

    function setButtonMode() {
        const isEdit = editingId !== null;
        elements.addBtn.classList.toggle('hidden', isEdit);
        elements.editActions.classList.toggle('hidden', !isEdit);
        elements.formTitle.innerHTML = isEdit ? '<span class="bg-[#E0F7F9] w-12 h-12 rounded-2xl flex items-center justify-center">✏️</span> Ganti Data' : '<span class="bg-[#E0F7F9] w-12 h-12 rounded-2xl flex items-center justify-center">📝</span> Catat Uang';
    }

    function validateForm() {
        if (!form.description.value.trim()) { showToast('Isi catatannya ya! 😊', 'error'); return false; }
        if (getRawAmount(form.amount.value) <= 0) { showToast('Uangnya berapa? 💰', 'error'); return false; }
        if (!form.date.value) { showToast('Pilih tanggalnya! 📅', 'error'); return false; }
        return true;
    }

    // --- Rendering ---
    function render() {
        elements.tbody.innerHTML = '';
        const sTerm = elements.searchInput.value.toLowerCase();
        const mFilt = elements.monthFilter.value;
        const yFilt = elements.yearFilter.value;

        const filtered = transactions.filter(tr => {
            const [year, month] = tr.date.split('-').map(Number);
            const matchSearch = tr.description.toLowerCase().includes(sTerm);
            const matchMonth = mFilt === "" ? true : (month - 1) == mFilt;
            const matchYear = yFilt === "" ? true : year == yFilt;
            return matchSearch && matchMonth && matchYear;
        });

        if (filtered.length === 0) {
            elements.emptyMsg.classList.remove('hidden');
            elements.transactionCountEl.textContent = '0 Catatan';
        } else {
            elements.emptyMsg.classList.add('hidden');
            elements.transactionCountEl.textContent = `${filtered.length} Catatan`;
            filtered.forEach((tr, index) => {
                const isInc = tr.type === 'income';
                const dateObj = new Date(tr.date);
                const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                const row = document.createElement('tr');
                row.className = 'hover border-b-2 border-gray-50';
                row.innerHTML = `
                    <th class="font-black text-gray-300 text-xs">${index + 1}</th>
                    <td>
                        <div class="font-bold text-gray-700">${tr.description}</div>
                        <div class="text-[10px] font-black uppercase text-[#12B8B3] tracking-tighter">${formattedDate}</div>
                    </td>
                    <td class="${isInc ? 'text-[#12B8B3]' : 'text-[#FF7B89]'} font-black text-right pr-4">
                        ${isInc ? '+' : '-'} ${tr.amount.toLocaleString('id-ID')}
                    </td>
                    <td>
                        <div class="flex justify-center gap-1">
                            <button onclick="editTransaction(${tr.id})" class="btn btn-ghost btn-circle btn-sm text-[#12B8B3] hover:bg-[#E0F7F9]">✏️</button>
                            <button onclick="openDeleteModal(${tr.id})" class="btn btn-ghost btn-circle btn-sm text-[#FF7B89] hover:bg-[#FFE4E6]">🗑️</button>
                        </div>
                    </td>
                `;
                elements.tbody.appendChild(row);
            });
        }
        updateSummary();
        renderMonthlyReport();
    }

    function renderMonthlyReport() {
        elements.monthlySummaryBody.innerHTML = '';
        const savingsPanelContainer = document.getElementById('savingsPanelContainer');
        savingsPanelContainer.innerHTML = '';
        
        const report = {};
        let grandIncome = 0;
        let grandExpense = 0;

        transactions.forEach(tr => {
            const [year, month] = tr.date.split('-').map(Number);
            const d = new Date(year, month - 1);
            const key = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            if (!report[key]) report[key] = { income: 0, expense: 0 };
            if (tr.type === 'income') {
                report[key].income += tr.amount;
                grandIncome += tr.amount;
            } else {
                report[key].expense += tr.amount;
                grandExpense += tr.amount;
            }
        });

        const keys = Object.keys(report).reverse(); // Newest first
        if (keys.length === 0) {
            elements.monthlySummaryBody.innerHTML = '<div class="text-center py-20 text-gray-300 font-bold bg-white rounded-[35px] border-4 border-[#F0F9FA]">Belum ada catatan bulanan 🎈</div>';
            return;
        }

        keys.forEach(k => {
            const data = report[k];
            const net = data.income - data.expense;
            const card = document.createElement('div');
            card.className = "monthly-card";
            card.innerHTML = `
                <div class="month-title">${k}</div>
                <div class="dashed-line"></div>
                <div class="data-row">
                    <div class="data-item">
                        <span class="data-label">PEMASUKAN</span>
                        <span class="data-value text-[#12B8B3]">Rp ${data.income.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="data-item text-right">
                        <span class="data-label">PENGELUARAN</span>
                        <span class="data-value text-[#FF7B89]">Rp ${data.expense.toLocaleString('id-ID')}</span>
                    </div>
                </div>
                <div class="data-item">
                    <span class="data-label">SISA</span>
                    <span class="data-value text-black">Rp ${net.toLocaleString('id-ID')}</span>
                </div>
            `;
            elements.monthlySummaryBody.appendChild(card);
        });

        // Add Grand Total Card
        const grandNet = grandIncome - grandExpense;
        const savingsRate = grandIncome > 0 ? Math.round((grandNet / grandIncome) * 100) : 0;
        
        const totalCard = document.createElement('div');
        totalCard.className = "total-card";
        totalCard.innerHTML = `
            <div class="total-title">Total Semua ✨</div>
            <div class="data-row">
                <div class="data-item">
                    <span class="data-label">TOTAL PEMASUKAN</span>
                    <span class="data-value text-[#12B8B3]">Rp ${grandIncome.toLocaleString('id-ID')}</span>
                </div>
                <div class="data-item text-right">
                    <span class="data-label">TOTAL PENGELUARAN</span>
                    <span class="data-value text-[#FF7B89]">Rp ${grandExpense.toLocaleString('id-ID')}</span>
                </div>
            </div>
            <div class="data-item text-center">
                <span class="data-label">TOTAL SISA</span>
                <span class="data-value text-black">Rp ${grandNet.toLocaleString('id-ID')}</span>
            </div>
        `;
        elements.monthlySummaryBody.appendChild(totalCard);

        // Add Savings Panel
        const savingsPanel = document.createElement('div');
        savingsPanel.className = "savings-panel";
        savingsPanel.innerHTML = `${savingsRate}% Tersimpan 🏆`;
        savingsPanelContainer.appendChild(savingsPanel);
    }

    function updateSummary() {
        let inc = 0, exp = 0;
        transactions.forEach(tr => {
            if (tr.type === 'income') inc += tr.amount;
            else exp += tr.amount;
        });
        const bal = inc - exp;
        elements.totalIncomeEl.textContent = `Rp ${inc.toLocaleString('id-ID')}`;
        elements.totalExpenseEl.textContent = `Rp ${exp.toLocaleString('id-ID')}`;
        elements.totalBalanceEl.textContent = `Rp ${bal.toLocaleString('id-ID')}`;
        elements.totalBalanceEl.className = `balance-value ${bal < 0 ? 'text-[#FF7B89]' : 'text-white'}`;
    }

    // --- Export to Excel with Styling ---
    async function exportToExcel() {
        if (transactions.length === 0) {
            showToast('Belum ada data untuk diunduh! 😊', 'error');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const summarySheet = workbook.addWorksheet('Ringkasan Bulanan');
        const detailSheet = workbook.addWorksheet('Semua Transaksi');

        // Theme Colors
        const primaryTeal = '12B8B3';
        const primaryRed = 'FF7B89';
        const lightTeal = 'E0F7F9';

        // --- 1. Style & Populate Summary Sheet ---
        summarySheet.columns = [
            { header: 'BULAN & TAHUN', key: 'month', width: 25 },
            { header: 'UANG MASUK', key: 'income', width: 20 },
            { header: 'UANG KELUAR', key: 'expense', width: 20 },
            { header: 'SISA TABUNGAN', key: 'net', width: 20 }
        ];

        // Header Styling
        summarySheet.getRow(1).height = 30;
        summarySheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryTeal } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } } };
        });

        // Data Processing
        const report = {};
        transactions.forEach(tr => {
            const [year, month] = tr.date.split('-').map(Number);
            const d = new Date(year, month - 1);
            const key = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            if (!report[key]) report[key] = { income: 0, expense: 0 };
            if (tr.type === 'income') report[key].income += tr.amount;
            else report[key].expense += tr.amount;
        });

        Object.keys(report).reverse().forEach((k, idx) => {
            const data = report[k];
            const net = data.income - data.expense;
            const row = summarySheet.addRow({
                month: k,
                income: data.income,
                expense: data.expense,
                net: net
            });

            // Styling Rows
            row.height = 25;
            row.eachCell((cell, colNumber) => {
                cell.alignment = { vertical: 'middle' };
                cell.border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } };
                
                // Number Formatting
                if (colNumber > 1) {
                    cell.numFmt = '"Rp "#,##0';
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                }

                // Conditional Color for Net
                if (colNumber === 4) {
                    cell.font = { bold: true, color: { argb: net >= 0 ? 'FF333333' : primaryRed } };
                }
            });

            // Zebra Striping
            if (idx % 2 === 0) {
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            }
        });

        // --- 2. Style & Populate Detail Sheet ---
        detailSheet.columns = [
            { header: 'NO', key: 'no', width: 8 },
            { header: 'TANGGAL', key: 'date', width: 15 },
            { header: 'KETERANGAN', key: 'desc', width: 35 },
            { header: 'TIPE', key: 'type', width: 12 },
            { header: 'JUMLAH (RP)', key: 'amount', width: 20 }
        ];

        detailSheet.getRow(1).height = 30;
        detailSheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B5563' } }; // Dark Gray
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        transactions.forEach((tr, idx) => {
            const row = detailSheet.addRow({
                no: idx + 1,
                date: tr.date,
                desc: tr.description,
                type: tr.type === 'income' ? 'MASUK' : 'KELUAR',
                amount: tr.amount
            });

            row.height = 22;
            row.eachCell((cell, colNumber) => {
                cell.alignment = { vertical: 'middle' };
                cell.border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } };

                if (colNumber === 1 || colNumber === 4) cell.alignment = { vertical: 'middle', horizontal: 'center' };
                
                if (colNumber === 4) {
                    cell.font = { bold: true, color: { argb: tr.type === 'income' ? primaryTeal : primaryRed } };
                }

                if (colNumber === 5) {
                    cell.numFmt = '"Rp "#,##0';
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                }
            });
        });

        // --- 3. Generate and Download ---
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `Laporan_Celenganku_${new Date().getTime()}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);

        showToast('Laporan Cantik Berhasil Diunduh! 🎨');
    }

    // --- Init ---
    elements.addBtn.addEventListener('click', addTransaction);
    elements.updateBtn.addEventListener('click', updateTransaction);
    elements.cancelBtn.addEventListener('click', resetForm);
    elements.confirmDeleteBtn.addEventListener('click', deleteConfirmed);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);

    render(); // Initial load
});