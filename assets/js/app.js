/* =====================================
   MoneyFlow Pro
   Final Version
===================================== */

// ===============================
// DOM Elements
// ===============================

const transactionForm = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const search = document.getElementById("search");
const themeBtn = document.getElementById("themeBtn");

// ===============================
// Local Storage
// ===============================

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;

// ===============================
// Save
// ===============================

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ===============================
// Dashboard
// ===============================

function updateDashboard() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(item => {

        if (item.type === "income") {

            totalIncome += item.amount;

        } else {

            totalExpense += item.amount;

        }

    });

    balance.textContent = "$" + (totalIncome - totalExpense).toFixed(2);
    income.textContent = "$" + totalIncome.toFixed(2);
    expense.textContent = "$" + totalExpense.toFixed(2);

}

// ===============================
// Render
// ===============================

function renderTransactions(list = transactions) {

    transactionList.innerHTML = "";

    list.forEach(item => {

        const li = document.createElement("li");

        li.innerHTML = `

        <div>

        <strong>${item.title}</strong><br>

        <small>${item.category} | ${item.date}</small>

        </div>

        <div>

        <strong style="color:${item.type=="income"?"limegreen":"red"}">

        ${item.type=="income"?"+":"-"}

        $${item.amount.toFixed(2)}

        </strong>

        <br><br>

        <button class="edit-btn"
        onclick="editTransaction(${item.id})">

        Edit

        </button>

        <button class="delete-btn"
        onclick="deleteTransaction(${item.id})">

        Delete

        </button>

        </div>

        `;

        transactionList.prepend(li);

    });

}

// ===============================
// Add / Update Transaction
// ===============================

transactionForm.addEventListener("submit", function(e){

    e.preventDefault();

    const transaction={

        id:editId || Date.now(),

        title:titleInput.value.trim(),

        amount:Number(amountInput.value),

        category:categoryInput.value,

        type:typeInput.value,

        date:dateInput.value

    };

    if(editId){

        transactions=transactions.map(item=>

            item.id===editId ? transaction : item

        );

        editId=null;

    }

    else{

        transactions.push(transaction);

    }

    saveTransactions();

    renderTransactions();

    updateDashboard();

    transactionForm.reset();

});
// ===============================
// Delete Transaction
// ===============================

function deleteTransaction(id){

    if(!confirm("Are you sure you want to delete this transaction?")){
        return;
    }

    transactions = transactions.filter(item => item.id !== id);

    saveTransactions();

    renderTransactions();

    updateDashboard();

}

// ===============================
// Edit Transaction
// ===============================

function editTransaction(id){

    const transaction = transactions.find(item => item.id === id);

    if(!transaction) return;

    editId = id;

    titleInput.value = transaction.title;
    amountInput.value = transaction.amount;
    categoryInput.value = transaction.category;
    typeInput.value = transaction.type;
    dateInput.value = transaction.date;

    titleInput.focus();

}

// ===============================
// Search
// ===============================

search.addEventListener("input", function(){

    const keyword = this.value.toLowerCase().trim();

    const filtered = transactions.filter(item =>

        item.title.toLowerCase().includes(keyword) ||

        item.category.toLowerCase().includes(keyword)

    );

    renderTransactions(filtered);

});

// ===============================
// Theme
// ===============================

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("light-mode");

    if(document.body.classList.contains("light-mode")){

        themeBtn.textContent="☀️";

        localStorage.setItem("theme","light");

    }else{

        themeBtn.textContent="🌙";

        localStorage.setItem("theme","dark");

    }

});

// Load Theme

if(localStorage.getItem("theme")==="light"){

    document.body.classList.add("light-mode");

    themeBtn.textContent="☀️";

}else{

    themeBtn.textContent="🌙";

}

// ===============================
// Export CSV
// ===============================

function exportCSV(){

    if(transactions.length===0){

        alert("No transactions found.");

        return;

    }

    let csv="Title,Amount,Category,Type,Date\n";

    transactions.forEach(item=>{

        csv+=`${item.title},${item.amount},${item.category},${item.type},${item.date}\n`;

    });

    const blob=new Blob([csv],{type:"text/csv"});

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download="MoneyFlow_Report.csv";

    a.click();

    URL.revokeObjectURL(url);

}

// ===============================
// Initial Load
// ===============================

renderTransactions();

updateDashboard();
// ===============================
// Expense Chart
// ===============================

let expenseChart = null;

function updateChart() {

    const expenseTransactions = transactions.filter(
        item => item.type === "expense"
    );

    const totals = {};

    expenseTransactions.forEach(item => {

        if (totals[item.category]) {
            totals[item.category] += item.amount;
        } else {
            totals[item.category] = item.amount;
        }

    });

    const labels = Object.keys(totals);
    const data = Object.values(totals);

    const canvas = document.getElementById("expenseChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{

                data: data

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

// ===============================
// Override Dashboard
// ===============================

const oldUpdateDashboard = updateDashboard;

updateDashboard = function () {

    oldUpdateDashboard();

    updateChart();

};

updateDashboard();