import { Wallet, Receipt, TrendingUp } from "lucide-react";

function ExpenseSummary({ summary, totalRecords }) {
  const totalExpenses = Number(summary.totalExpenses || 0);

  const averageExpense = totalRecords > 0 ? totalExpenses / totalRecords : 0;

  const formatAmount = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="expense-summary">
      <div className="expense-summary-card">
        <div className="summary-icon">
          <Wallet size={25} />
        </div>

        <div>
          <p>Total Expenses</p>
          <h2>{formatAmount(totalExpenses)}</h2>
        </div>
      </div>

      <div className="expense-summary-card">
        <div className="summary-icon">
          <Receipt size={25} />
        </div>

        <div>
          <p>Total Records</p>
          <h2>{totalRecords}</h2>
        </div>
      </div>

      <div className="expense-summary-card">
        <div className="summary-icon">
          <TrendingUp size={25} />
        </div>

        <div>
          <p>Average Expense</p>
          <h2>{formatAmount(averageExpense)}</h2>
        </div>
      </div>
    </div>
  );
}

export default ExpenseSummary;
