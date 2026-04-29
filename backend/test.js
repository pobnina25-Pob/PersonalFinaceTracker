async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';

  console.log("=== 🚀 Starting API Tests ===\n");

  try {
    console.log("1. Creating an INCOME transaction (Salary: 50,000)...");
    const incomeRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 50000,
        type: 'INCOME',
        description: 'Monthly Salary',
        date: new Date().toISOString()
      })
    });
    const incomeData = await incomeRes.json();
    console.log("Response:", incomeData, "\n");

    console.log("2. Creating an EXPENSE transaction (Groceries: 1,500)...");
    const expenseRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 1500,
        type: 'EXPENSE',
        description: 'Groceries at Supermarket',
        date: new Date().toISOString()
      })
    });
    const expenseData = await expenseRes.json();
    console.log("Response:", expenseData, "\n");

    console.log("3. Fetching all transactions for this month...");
    const getRes = await fetch(`${BASE_URL}/transactions`);
    const getData = await getRes.json();
    console.log("Response:", getData.length, "transactions found.");
    console.log(getData, "\n");

    console.log("4. Fetching Dashboard Summary...");
    const summaryRes = await fetch(`${BASE_URL}/transactions/summary`);
    const summaryData = await summaryRes.json();
    console.log("Response:", summaryData, "\n");

    console.log("✅ All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test Failed. Is the server running? Error:", error.message);
  }
}

runTests();
