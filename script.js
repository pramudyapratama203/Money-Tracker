document.addEventListener('DOMContentLoaded', function () {
    let transactions = [

    ];

    let editingId = null;

    const form = {
        description: document.getElementById('description'),
        amount: document.getElementById('amount'),
        type: document.getElementById('type')
    };
    const addBtn = document.getElementById('addBtn');
    const updateBtn = document.getElementById('updateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const tbody = document.getElementById('transactionBody');
    const emptyMsg = document.getElementById('emptyMessage');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const totalBalanceEl = document.getElementById('totalBalance');

    render();

    addBtn.addEventListener('click', addTransaction);
    updateBtn.addEventListener('click', updateTransaction);
    cancelBtn.addEventListener('click', resetForm);

    function render() {
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            emptyMsg.classList.remove('hidden');
        } else {
            emptyMsg.classList.add('hidden');
            transactions.forEach((tr, index) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                row.innerHTML = `
                    <td class="px-4 py-2">${index + 1}</td>
                    <td class="px-4 py-2">${tr.description}</td>
                    <td class="px-4 py-2">Rp ${tr.amount.toLocaleString('id-ID')}</td>
                    <td class="px-4 py-2">
                        <span class="px-2 py-1 text-xs rounded-full ${tr.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${tr.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                    </td>
                    <td class="px-4 py-2 space-x-2">
                        <button onclick="editTransaction(${tr.id})" class="text-blue-600 hover:text-blue-800 font-medium">✏️ Edit</button>
                        <button onclick="deleteTransaction(${tr.id})" class="text-red-600 hover:text-red-800 font-medium">🗑️ Hapus</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        updateSummary();
        setButtonMode();
    }

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
    }

    function addTransaction() {
        if (!validateForm()) return;

        const newTransaction = {
            id: Date.now(), // unique id
            description: form.description.value.trim(),
            amount: parseInt(form.amount.value),
            type: form.type.value
        };

        transactions.push(newTransaction);
        resetForm();
        render();
    }

    function updateTransaction() {
        if (!editingId) return;
        if (!validateForm()) return;

        const index = transactions.findIndex(tr => tr.id === editingId);
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                description: form.description.value.trim(),
                amount: parseInt(form.amount.value),
                type: form.type.value
            };
        }

        resetForm();
        render();
    }

    window.deleteTransaction = function (id) {
        if (confirm('Yakin ingin menghapus transaksi ini?')) {
            transactions = transactions.filter(tr => tr.id !== id);
            if (editingId === id) resetForm(); // jika yang dihapus sedang diedit
            render();
        }
    };

    window.editTransaction = function (id) {
        const transaction = transactions.find(tr => tr.id === id);
        if (!transaction) return;

        form.description.value = transaction.description;
        form.amount.value = transaction.amount;
        form.type.value = transaction.type;
        editingId = transaction.id;

        setButtonMode();
    };

    function resetForm() {
        form.description.value = '';
        form.amount.value = '';
        form.type.value = 'income';
        editingId = null;
        setButtonMode();
    }

    function setButtonMode() {
        if (editingId) {
            addBtn.disabled = true;
            updateBtn.disabled = false;
        } else {
            addBtn.disabled = false;
            updateBtn.disabled = true;
        }
    }

    function validateForm() {
        const desc = form.description.value.trim();
        const amount = form.amount.value.trim();

        if (!desc) {
            alert('Deskripsi harus diisi!');
            return false;
        }
        if (!amount || parseInt(amount) <= 0) {
            alert('Jumlah harus diisi dengan angka positif!');
            return false;
        }
        return true;
    }

    window.editTransaction = editTransaction;
    window.deleteTransaction = deleteTransaction;
});