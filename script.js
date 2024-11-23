document.getElementById("emiForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Initial input values
    const principal = parseFloat(document.getElementById("principal").value);
    const annualRate = parseFloat(document.getElementById("interestRate").value);
    const tenureYears = parseInt(document.getElementById("tenure").value);
    const startDate = document.getElementById("startDate").value;

    // Parse new loans
    const additionalLoans = parseAdditionalLoans();

    // Generate EMI schedule
    generateEMISchedule(principal, annualRate, tenureYears, startDate, additionalLoans);
});

document.getElementById("addLoan").addEventListener("click", function () {
    const loanDiv = document.createElement("div");
    loanDiv.classList.add("loan-entry");
    loanDiv.innerHTML = `
        <label>Additional Loan Principal (₹):</label>
        <input type="number" class="loan-principal" required>

        <label>Loan Start Date:</label>
        <input type="month" class="loan-date" required>

        <button type="button" class="remove-loan">Remove</button>
    `;
    document.getElementById("additionalLoans").appendChild(loanDiv);

    // Add event listener for removing loans
    loanDiv.querySelector(".remove-loan").addEventListener("click", function () {
        loanDiv.remove();
    });
});

function parseAdditionalLoans() {
    const loans = [];
    document.querySelectorAll(".loan-entry").forEach((entry) => {
        const principal = parseFloat(entry.querySelector(".loan-principal").value);
        const date = entry.querySelector(".loan-date").value;
        loans.push({ principal, date });
    });
    return loans.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
}

function generateEMISchedule(principal, annualRate, tenureYears, startDate, additionalLoans) {
    const emiTable = document.querySelector("#emiTable tbody");
    emiTable.innerHTML = "";

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    let outstandingPrincipal = principal;
    let currentDate = new Date(startDate + "-01");
    let EMI = calculateEMI(outstandingPrincipal, monthlyRate, totalMonths);
    let loanIndex = 0;

    for (let i = 1; i <= totalMonths; i++) {
        // Check if a new loan starts this month
        if (loanIndex < additionalLoans.length && isSameMonth(currentDate, new Date(additionalLoans[loanIndex].date))) {
            outstandingPrincipal += additionalLoans[loanIndex].principal;
            EMI = calculateEMI(outstandingPrincipal, monthlyRate, totalMonths - i + 1); // Update EMI
            loanIndex++;
        }

        // EMI calculations
        const interest = outstandingPrincipal * monthlyRate;
        const principalPayment = EMI - interest;
        outstandingPrincipal -= principalPayment;

        // Append to table
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${currentDate.toLocaleString("default", { month: "short", year: "2-digit" })}</td>
            <td>${Math.round(EMI)}</td>
            <td>${interest.toFixed(2)}</td>
            <td>${principalPayment.toFixed(2)}</td>
            <td>${Math.max(0, outstandingPrincipal.toFixed(2))}</td>
        `;
        emiTable.appendChild(row);

        // Increment month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
}

function calculateEMI(principal, monthlyRate, tenureMonths) {
    return Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                      (Math.pow(1 + monthlyRate, tenureMonths) - 1));
}

function isSameMonth(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}
