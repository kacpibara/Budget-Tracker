import { getToken, setToken, clearToken } from './auth.js';
import { 
    AUTH_URL, fetchTransactionsApi, addTransactionApi, 
    deleteTransactionApi, deleteAllTransactionsApi, updateTransactionApi 
} from './api.js';

const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');
const currentUserDisplay = document.getElementById('currentUserDisplay');

const expenseForm = document.getElementById('expenseForm');
const expenseName = document.getElementById('expenseName');
const expenseCategory = document.getElementById('expenseCategory');
const expenseAmount = document.getElementById('expenseAmount');
const expensesList = document.getElementById('expensesList');
const expensesTotal = document.getElementById('expensesTotal');

const incomeForm = document.getElementById('incomeForm');
const incomeName = document.getElementById('incomeName');
const incomeAmount = document.getElementById('incomeAmount');
const incomeList = document.getElementById('incomeList');
const incomeTotal = document.getElementById('incomeTotal');

const balanceValue = document.getElementById('balanceValue');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

let isEditMode = false;
let editId = null;
let editType = null;
let expensesChartInstance = null;

window.prepareEdit = prepareEdit;
window.deleteTransaction = deleteTransaction;

function checkAuthState() {
    const token = getToken();
    if (token) {
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        currentUserDisplay.innerText = `Logged in as: ${localStorage.getItem('budgetUser') || 'User'}`;
        loadTransactions();
    } else {
        authSection.style.display = 'block';
        appSection.style.display = 'none';
    }
}

function logout() {
    clearToken();
    checkAuthState();
    if (expensesChartInstance) {
        expensesChartInstance.destroy();
        expensesChartInstance = null;
    }
}
logoutBtn.addEventListener('click', logout);

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            localStorage.setItem('budgetUser', username);
            authError.innerText = '';
            loginForm.reset();
            checkAuthState();
        } else {
            authError.innerText = `❌ ${data.error}`;
        }
    } catch (error) {
        authError.innerText = '❌ Cannot connect to the server.';
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            authError.innerText = '✅ Account created! You can now log in.';
            authError.style.color = 'seagreen';
            registerForm.reset();
        } else {
            authError.innerText = `❌ ${data.error}`;
            authError.style.color = 'crimson';
        }
    } catch (error) {
        authError.innerText = '❌ Cannot connect to the server.';
        authError.style.color = 'crimson';
    }
});

async function loadTransactions() {
    const data = await fetchTransactionsApi(logout);
    if (data) renderTransactions(data);
}

async function addTransaction(transactionData, formToReset) {
    const response = await addTransactionApi(transactionData, logout);
    if (response && response.ok) {
        formToReset.reset();
        loadTransactions();
    } else if (response) {
        const errorData = await response.json();
        alert('Wystąpił błąd: ' + errorData.error);
    }
}

async function deleteTransaction(id) {
    if (!confirm('Do you want to delete it?')) return;
    const response = await deleteTransactionApi(id, logout);
    if (response && response.ok) loadTransactions();
}

async function deleteAllTransactions() {
    if (!confirm('Do you want to delete all your data?')) return;
    const response = await deleteAllTransactionsApi(logout);
    if (response && response.ok) loadTransactions();
}

async function updateTransaction(id, updatedData) {
    const response = await updateTransactionApi(id, updatedData, logout);
    if (response && response.ok) {
        cancelEdit();
        loadTransactions();
    }
}

if (clearAllBtn) clearAllBtn.addEventListener('click', deleteAllTransactions);

expenseForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const data = {
        type: 'expense',
        name: expenseName.value,
        category: expenseCategory.value,
        amount: Number(parseFloat(expenseAmount.value).toFixed(2)),
        date: new Date().toISOString().split('T')[0] 
    };
    if (isEditMode && editType === 'expense') updateTransaction(editId, data);
    else addTransaction(data, expenseForm);
});

incomeForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const data = {
        type: 'income',
        name: incomeName.value,
        category: 'Income', 
        amount: Number(parseFloat(incomeAmount.value).toFixed(2)),
        date: new Date().toISOString().split('T')[0] 
    };
    if (isEditMode && editType === 'income') updateTransaction(editId, data);
    else addTransaction(data, incomeForm);
});

function updateChart(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const chartContainer = document.querySelector('.chart-container');

    if (expenses.length === 0) {
        chartContainer.style.display = 'none';
        if (expensesChartInstance) {
            expensesChartInstance.destroy();
            expensesChartInstance = null;
        }
        return; 
    }

    chartContainer.style.display = 'block';

    const categoryTotals = {};
    expenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const ctx = document.getElementById('expensesChart').getContext('2d');

    if (expensesChartInstance) expensesChartInstance.destroy();

    expensesChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function prepareEdit(id, type, name, category, amount) {
    isEditMode = true;
    editId = id;
    editType = type;

    if (type === 'expense') {
        expenseName.value = name;
        expenseCategory.value = category;
        expenseAmount.value = amount;
        expenseForm.querySelector('button').innerText = 'Update Expense';
        expenseForm.querySelector('button').classList.add('btn-success');
    } else {
        incomeName.value = name;
        incomeAmount.value = amount;
        incomeForm.querySelector('button').innerText = 'Update Income';
        incomeForm.querySelector('button').classList.add('btn-success');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    isEditMode = false;
    editId = null;
    editType = null;
    
    expenseForm.reset();
    expenseForm.querySelector('button').innerText = 'Add Expense';
    expenseForm.querySelector('button').classList.remove('btn-success');
    
    incomeForm.reset();
    incomeForm.querySelector('button').innerText = 'Add Income';
    incomeForm.querySelector('button').classList.remove('btn-success');
}

function renderTransactions(transactions) {
    updateChart(transactions); 
    expensesList.innerHTML = '';
    incomeList.innerHTML = '';
    
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        const item = document.createElement('div');
        item.className = 'singleItem';
        
        if (t.type === 'income') {
            totalIncome += t.amount;
            item.innerHTML = `
                <span>
                    <strong>${t.name || 'Bez nazwy'}</strong> 
                    <br><small style="color: #999; font-size: 11px;">${t.date}</small>
                </span>
                <span class="positive">+${t.amount.toFixed(2)} PLN</span>
                <div class="item-actions" style="display:flex; gap:5px;">
                    <button class="edit-btn" onclick="prepareEdit(${t.id}, '${t.type}', '${t.name}', '${t.category}', ${t.amount})">✎</button>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>`;
            incomeList.appendChild(item);
        } else {
            totalExpense += t.amount;
            item.innerHTML = `
                <span>
                    <strong>${t.name || 'Bez nazwy'}</strong> 
                    <span class="category-badge">${t.category}</span>
                    <br><small style="color: #999; font-size: 11px;">${t.date}</small>
                </span>
                <span class="negative">-${t.amount.toFixed(2)} PLN</span>
                <div class="item-actions" style="display:flex; gap:5px;">
                    <button class="edit-btn" onclick="prepareEdit(${t.id}, '${t.type}', '${t.name}', '${t.category}', ${t.amount})">✎</button>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>`;
            expensesList.appendChild(item);
        }
    });

    const currentBalance = totalIncome - totalExpense;
    expensesTotal.innerText = `${totalExpense.toFixed(2)} PLN`;
    incomeTotal.innerText = `${totalIncome.toFixed(2)} PLN`;
    balanceValue.innerText = `${currentBalance.toFixed(2)} PLN`;
    balanceValue.className = currentBalance >= 0 ? 'positive' : 'negative';
}

if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', async () => {
        try {
            const data = await fetchTransactionsApi(logout);
            if (!data) return;
            
            if (data.length === 0) {
                alert("Nie masz żadnych danych do wyeksportowania!");
                return;
            }

            let csvContent = "Type,Name,Category,Amount (PLN),Date\n";

            data.forEach(t => {
                const safeName = `"${t.name.replace(/"/g, '""')}"`;
                const typeLabel = t.type === 'income' ? 'Przychód' : 'Wydatek';
                csvContent += `${typeLabel},${safeName},${t.category},${t.amount},${t.date}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.setAttribute("href", url);
            
            const today = new Date().toISOString().split('T')[0];
            link.setAttribute("download", `budget_report_${today}.csv`);
            
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Błąd podczas generowania CSV:', error);
            alert('Wystąpił błąd podczas eksportu.');
        }
    });
}

checkAuthState();