const API_URL = "https://7zonzdr72h.execute-api.us-east-1.amazonaws.com";
let expenseChart;
let monthlyChart;

window.onload = function () {
    loadTransactions();
};

async function loadTransactions() {
    const response = await fetch(`${API_URL}/transactions`);
    const data = await response.json();

    const table = document.getElementById("transactionTable");

    table.innerHTML = "";

    let income = 0;
    let expense = 0;
    let categoryTotals = {};
    let monthlyTotals = {};

    data.forEach(transaction => {

        table.innerHTML += `
<tr>
    <td>${transaction.Date}</td>
    <td>${transaction.Type}</td>
    <td>${transaction.Category}</td>
    <td>₹${transaction.Amount}</td>
    <td>${transaction.Description}</td>
    <td>
    <button onclick="editTransaction(
        '${transaction.UserId}',
        '${transaction.TransactionId}',
        '${transaction.Amount}',
        '${transaction.Type}',
        '${transaction.Category}',
        '${transaction.Date}',
        '${transaction.Description}'
    )">
        ✏ Edit
    </button>

    <button onclick="deleteTransaction('${transaction.UserId}','${transaction.TransactionId}')">
        🗑 Delete
    </button>
</td></tr>
`;        if (transaction.Type === "Income") {

    income += Number(transaction.Amount);

}else {

    expense += Number(transaction.Amount);

    // Category totals
    if (categoryTotals[transaction.Category]) {
        categoryTotals[transaction.Category] += Number(transaction.Amount);
    } else {
        categoryTotals[transaction.Category] = Number(transaction.Amount);
    }

    // Monthly totals
    if (transaction.Date) {

        const month = transaction.Date.substring(0, 7);

        if (monthlyTotals[month]) {
            monthlyTotals[month] += Number(transaction.Amount);
        } else {
            monthlyTotals[month] = Number(transaction.Amount);
        }

    }

}        
    });

    document.getElementById("income").innerHTML = "₹" + income;
    document.getElementById("expense").innerHTML = "₹" + expense;
    document.getElementById("balance").innerHTML = "₹" + (income - expense);
    drawChart(categoryTotals);
    drawMonthlyChart(monthlyTotals);
}

    async function addTransaction() {

    const transaction = {
        UserId: document.getElementById("userId").value,
        TransactionId: window.currentTransactionId,
        Amount: Number(document.getElementById("amount").value),
        Type: document.getElementById("type").value,
        Category: document.getElementById("category").value,
        Date: document.getElementById("date").value,
        Description: document.getElementById("description").value
    };

    let method = "POST";

    if (window.currentTransactionId) {
        method = "PUT";
    }

    const response = await fetch(`${API_URL}/transactions`, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transaction)
    });

    const result = await response.json();

    alert(result.message);

    window.currentTransactionId = null;

    location.reload();
}
       function drawChart(categoryTotals) {

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx = document.getElementById("expenseChart").getContext("2d");

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {
            labels: labels,
            datasets: [{
                data: values
            }]
        },

        options: {

            responsive: true,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }

        }

    });

}
function drawMonthlyChart(monthlyTotals) {

    const labels = Object.keys(monthlyTotals).sort();
    const values = labels.map(month => monthlyTotals[month]);

    if (monthlyChart) {
        monthlyChart.destroy();
    }

    const ctx = document.getElementById("monthlyChart").getContext("2d");

    monthlyChart = new Chart(ctx, {

        type: "line",

        data: {
            labels: labels,
            datasets: [{
                label: "Monthly Expenses",
                data: values,
                fill: false,
                tension: 0.3
            }]
        },

        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top"
                }
            }
        }

    });

}
async function deleteTransaction(userId, transactionId) {

    const response = await fetch(`${API_URL}/transactions`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            UserId: userId,
            TransactionId: transactionId
        })
    });

    const result = await response.json();

    alert(result.message);

    loadTransactions();
}
function editTransaction(userId, transactionId, amount, type, category, date, description) {

    document.getElementById("userId").value = userId;
    document.getElementById("amount").value = amount;
    document.getElementById("type").value = type;
    document.getElementById("category").value = category;
    document.getElementById("date").value = date;
    document.getElementById("description").value = description;

    // Save the TransactionId for updating later
    window.currentTransactionId = transactionId;
}