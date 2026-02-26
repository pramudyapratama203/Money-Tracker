document.addEventListener('DOMContentLoaded', function () {
    let transactions = [

    ];

    let editingId = null;

    const form = {
        description: document.getElementById('description'),
        amount: document.getElementById('amount'),
        date: document.getElementById('date'),
        type: document.getElementById('type')
    };

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    form.date.value = today;

    const addBtn = document.getElementById('addBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');
    const resetFilterBtn = document.getElementById('resetFilter');

    const editActions = document.getElementById('editActions');
    const formTitle = document.getElementById('formTitle');
    const transactionCountEl = document.getElementById('transactionCount');
    const tbody = document.getElementById('transactionBody');
    const emptyMsg = document.getElementById('emptyMessage');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const totalBalanceEl = document.getElementById('totalBalance');

    render();

    addBtn.addEventListener('click', addTransaction);
    updateBtn.addEventListener('click', updateTransaction);
    cancelBtn.addEventListener('click', resetForm);

    // Search & Filter Events
    searchInput.addEventListener('input', render);
    dateFilter.addEventListener('change', render);
    resetFilterBtn.addEventListener('click', () => {
        searchInput.value = '';
        dateFilter.value = '';
        render();
    });

    function render() {
        tbody.innerHTML = '';

        const searchTerm = searchInput.value.toLowerCase();
        const filterDate = dateFilter.value;

        // Apply filtering
        const filteredTransactions = transactions.filter(tr => {
            const matchSearch = tr.description.toLowerCase().includes(searchTerm);
            const matchDate = filterDate ? tr.date === filterDate : true;
            return matchSearch && matchDate;
        });

        if (filteredTransactions.length === 0) {
            emptyMsg.classList.remove('hidden');
            transactionCountEl.textContent = '0 Transaksi';
        } else {
            emptyMsg.classList.add('hidden');
            transactionCountEl.textContent = `${filteredTransactions.length} Transaksi`;
            filteredTransactions.forEach((tr, index) => {
                const isIncome = tr.type === 'income';
                const row = document.createElement('tr');
                row.className = 'hover';

                // Format date for display
                const dateObj = new Date(tr.date);
                const formattedDate = dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });

                row.innerHTML = `
                    <th>${index + 1}</th>
                    <td>
                        <div class="font-medium">${tr.description}</div>
                        <div class="text-xs opacity-50">${formattedDate}</div>
                    </td>
                    <td class="${isIncome ? 'text-success' : 'text-error'} font-bold">
                        ${isIncome ? '+' : '-'} Rp ${tr.amount.toLocaleString('id-ID')}
                    </td>
                    <td>
                        <div class="badge ${isIncome ? 'badge-success' : 'badge-error'} badge-outline gap-2">
                            ${isIncome ? '📈' : '📉'}
                        </div>
                    </td>
                    <td>
                        <div class="flex justify-center gap-2">
                            <button onclick="editTransaction(${tr.id})" class="btn btn-ghost btn-sm text-info">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </button>
                            <button onclick="deleteTransaction(${tr.id})" class="btn btn-ghost btn-sm text-error">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        updateSummary();
        setButtonMode();
    }

    // Update Perhitungan
    function updateSummary() {
        let totalIncome = 0, totalExpense = 0;
        transactions.forEach(tr => {
            if (tr.type === 'income') totalIncome += tr.amount;
            else totalExpense += tr.amount;
        });
        const balance = totalIncome - totalExpense;

        totalIncomeEl.textContent = `Rp ${totalIncome.toLocaleString('id-ID')}`;
        totalExpenseEl.textContent = `Rp ${totalExpense.toLocaleString('id-ID')}`;
        totalBalanceEl.textContent = `Rp ${balance.toLocaleString('id-ID')}`;

        if (balance < 0) {
            totalBalanceEl.className = 'stat-value text-error text-2xl lg:text-3xl';
        } else {
            totalBalanceEl.className = 'stat-value text-primary text-2xl lg:text-3xl';
        }
    }

    // Tambah Transaksi
    function addTransaction() {
        if (!validateForm()) return;

        const newTransaction = {
            id: Date.now(),
            description: form.description.value.trim(),
            amount: parseInt(form.amount.value),
            date: form.date.value,
            type: form.type.value
        };

        transactions.push(newTransaction);

        const btn = document.getElementById('addBtn');
        btn.classList.add('loading');
        setTimeout(() => {
            btn.classList.remove('loading');
            resetForm();
            render();
        }, 300);
    }

    // Update Transaksi
    function updateTransaction() {
        if (!editingId) return;
        if (!validateForm()) return;

        const index = transactions.findIndex(tr => tr.id === editingId);
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                description: form.description.value.trim(),
                amount: parseInt(form.amount.value),
                date: form.date.value,
                type: form.type.value
            };
        }

        resetForm();
        render();
    }

    // Hapus Transaksi
    window.deleteTransaction = function (id) {
        if (confirm('Yakin ingin menghapus transaksi ini?')) {
            transactions = transactions.filter(tr => tr.id !== id);
            if (editingId === id) resetForm();
            render();
        }
    };

    window.editTransaction = function (id) {
        const transaction = transactions.find(tr => tr.id === id);
        if (!transaction) return;

        form.description.value = transaction.description;
        form.amount.value = transaction.amount;
        form.date.value = transaction.date;
        form.type.value = transaction.type;
        editingId = transaction.id;

        setButtonMode();
        document.getElementById('formTitle').scrollIntoView({ behavior: 'smooth' });
    };

    function resetForm() {
        form.description.value = '';
        form.amount.value = '';
        form.date.value = today;
        form.type.value = 'income';
        editingId = null;
        setButtonMode();
    }

    function setButtonMode() {
        if (editingId) {
            addBtn.classList.add('hidden');
            editActions.classList.remove('hidden');
            formTitle.textContent = 'Edit Transaksi';
            formTitle.classList.add('text-info');
        } else {
            addBtn.classList.remove('hidden');
            editActions.classList.add('hidden');
            formTitle.textContent = 'Tambah Transaksi';
            formTitle.classList.remove('text-info');
        }
    }

    // Validasi Form
    function validateForm() {
        const desc = form.description.value.trim();
        const amount = form.amount.value.trim();
        const date = form.date.value;

        if (!desc) {
            alert('Deskripsi harus diisi!');
            return false;
        }
        if (!amount || parseInt(amount) <= 0) {
            alert('Jumlah harus diisi dengan angka positif!');
            return false;
        }
        if (!date) {
            alert('Tanggal harus diisi!');
            return false;
        }
        return true;
    }

    window.editTransaction = editTransaction;
    window.deleteTransaction = deleteTransaction;
});