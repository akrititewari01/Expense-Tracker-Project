const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const budgetInput = document.getElementById('budget');
const budgetDisplay = document.getElementById('budget-display');

let budget = 0;

const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
let incomeExpenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Income', 'Expense'],
        datasets: [{
            label: 'Amount',
            data: [0, 0],
            backgroundColor: [
                'rgba(46, 204, 113, 0.6)',
                'rgba(231, 76, 60, 0.6)'
            ],
            borderColor: [
                'rgba(46, 204, 113, 1)',
                'rgba(231, 76, 60, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const localStorageTransactions = JSON.parse(
    localStorage.getItem('transactions')
);

let transactions =
    localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

function addTransaction(amountValue) {
    if (text.value.trim() === '' || amountValue === '') {
        alert('Please add a text and amount');
    } else {
        const transaction = {
            id: generateID(),
            text: text.value,
            amount: +amountValue,
            dateTime: new Date().toLocaleString(),
            date: new Date()
        };

        transactions.push(transaction);

        addTransactionDOM(transaction);
        updateValues();
        updateLocalStorage();
        updateChart();
        updateCurrentMonthExpense();

        text.value = '';
        amount.value = '';
    }
}

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';

    const item = document.createElement('li');

    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span> 
    <span class="date-time">[${transaction.dateTime}]</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;

    list.appendChild(item);
}

function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
        -1
    ).toFixed(2);

    balance.innerText = `₹${total}`;
    money_plus.innerText = `₹${income}`;
    money_minus.innerText = `₹${expense}`;

    if (budget > 0) {
        budgetDisplay.innerText = `₹${budget}`;
        if (expense > budget) {
            alert('You have exceeded your budget!');
        } else if (expense >= budget * 0.9) {
            alert('Warning: You are approaching your budget limit.');
        }
    }
}

function updateChart() {
    const amounts = transactions.map(transaction => transaction.amount);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;

    incomeExpenseChart.data.datasets[0].data = [income, expense];
    incomeExpenseChart.update();
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);

    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function init() {
    list.innerHTML = '';

    transactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
    updateCurrentMonthExpense();
}

init();

document.getElementById('set-budget').addEventListener('click', () => {
    const budgetValue = budgetInput.value;
    if (budgetValue === '' || isNaN(budgetValue) || budgetValue <= 0) {
        alert('Please enter a valid budget amount');
        return;
    }
    budget = parseFloat(budgetValue);
    budgetDisplay.innerText = `₹${budget}`;
    budgetInput.value = '';
});

document.getElementById('add-income').addEventListener('click', () => {
    const incomeAmount = amount.value;
    if (incomeAmount === '' || isNaN(incomeAmount)) {
        alert('Please enter a valid amount for income');
        return;
    }
    addTransaction(incomeAmount);
    amount.value = '';
});

document.getElementById('add-expense').addEventListener('click', () => {
    const expenseAmount = amount.value;
    if (expenseAmount === '' || isNaN(expenseAmount)) {
        alert('Please enter a valid amount for expense');
        return;
    }
    addTransaction(-expenseAmount);
    amount.value = '';
});

function updateCurrentMonthExpense() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let totalExpense = 0;

    transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        if (transaction.amount < 0 &&
            transactionDate.getMonth() === currentMonth && 
            transactionDate.getFullYear() === currentYear) {
            totalExpense += Math.abs(transaction.amount);
        }
    });

    document.getElementById('current-month-name').innerText = new Date().toLocaleString('default', { month: 'long' }) + ' ' + currentYear;
    document.getElementById('current-month-total').innerText = `₹${totalExpense.toFixed(2)}`;
}